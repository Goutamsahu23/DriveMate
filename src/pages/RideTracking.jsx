import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import { io } from 'socket.io-client'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import ErrorBoundary from '../components/ErrorBoundary'
import { FaMapMarkerAlt, FaCar, FaUser, FaPhone, FaCheckCircle, FaTimes, FaStar } from 'react-icons/fa'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000')

function MapController({ center }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

export default function RideTracking() {
  const { rideId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [ride, setRide] = useState(null)
  const [driverLocation, setDriverLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [otp, setOtp] = useState(['', '', '', ''])
  const [otpError, setOtpError] = useState('')
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [otpTimer, setOtpTimer] = useState(300) // 5 minutes
  const [displayOtp, setDisplayOtp] = useState(null) // OTP to display to rider

  useEffect(() => {
    fetchRide()
    
    socket.on('connect', () => {
      socket.emit('join-room', rideId)
    })

    // Listen for real-time status updates
    socket.on('ride-status-update', (data) => {
      if (data.rideId === rideId) {
        console.log('Real-time status update:', data.status)
        const updatedRide = data.ride || { ...ride, status: data.status }
        setRide(updatedRide)
        
        // If driver arrived and OTP is available, show it
        if (data.status === 'driver_arrived' && updatedRide.otp?.code) {
          console.log('OTP available from ride data:', updatedRide.otp.code)
          setDisplayOtp(updatedRide.otp.code)
          setOtpTimer(300)
        }
      }
    })

    // Legacy listener for backwards compatibility
    socket.on('ride-status', (data) => {
      if (data.rideId === rideId) {
        fetchRide()
      }
    })

    socket.on('driver-arrived', (data) => {
      if (data.rideId === rideId) {
        console.log('Driver arrived:', data)
        // Show OTP to rider, start timer for driver
        if (data.otp) {
          setDisplayOtp(data.otp)
          setOtpTimer(300)
        }
      }
    })

    socket.on('otp-generated', (data) => {
      if (data.rideId === rideId) {
        console.log('OTP generated:', data)
        setOtpTimer(300)
        setOtp(['', '', '', ''])
        setOtpError('')
      }
    })

    socket.on('driver-location', (data) => {
      if (data.rideId === rideId && data.location) {
        setDriverLocation([data.location.lat, data.location.lng])
      }
    })

    return () => {
      socket.off('ride-status-update')
      socket.off('ride-status')
      socket.off('driver-arrived')
      socket.off('otp-generated')
      socket.off('driver-location')
    }
  }, [rideId])

  const fetchRide = async () => {
    try {
      console.log('Fetching ride:', rideId)
      const res = await api.get(`/rides/${rideId}`)
      console.log('Ride data received:', res.data)
      if (!res.data) {
        console.error('No ride data received')
        setLoading(false)
        return
      }
      setRide(res.data)
      
      // If ride is already driver_arrived with OTP, show it
      if (res.data.status === 'driver_arrived' && res.data.otp?.code) {
        console.log('Fetched ride has OTP:', res.data.otp.code)
        setDisplayOtp(res.data.otp.code)
        setOtpTimer(300)
      }
      
      if (res.data.driver?.currentLocation) {
        setDriverLocation([res.data.driver.currentLocation.lat, res.data.driver.currentLocation.lng])
      }
    } catch (error) {
      console.error('Error fetching ride:', error.response?.data || error.message)
    } finally {
      setLoading(false)
    }
  }

  // OTP timer effect
  useEffect(() => {
    if (ride?.status !== 'driver_arrived' || otpTimer <= 0) return

    const interval = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          setOtp(['', '', '', ''])
          setOtpError('OTP expired. Please request a new one.')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [ride?.status, otpTimer])

  // Monitor ride status changes
  useEffect(() => {
    if (ride) {
      console.log('Ride status changed to:', ride.status)
    }
  }, [ride?.status])

  const handleOtpInput = (index, value) => {
    if (!/^\d?$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setOtpError('')

    // Auto-focus next field
    if (value && index < 3) {
      document.getElementById(`otp-input-${index + 1}`)?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus()
    }
  }

  const verifyOtpCode = async () => {
    const otpCode = otp.join('')
    
    if (otpCode.length !== 4) {
      setOtpError('Please enter all 4 digits')
      return
    }

    setVerifyingOtp(true)
    setOtpError('')

    try {
      console.log('Verifying OTP for ride:', rideId)
      const res = await api.post(`/rides/${rideId}/verify-otp`, { otp: otpCode })
      console.log('OTP verification response:', res.data)
      
      if (res.data && res.data.ride) {
        // Ensure ride is properly updated with all fields
        const updatedRide = {
          ...ride, // Keep existing ride data
          ...res.data.ride // Merge in updated ride data
        }
        console.log('Updated ride object:', updatedRide)
        setRide(updatedRide)
        setOtp(['', '', '', ''])
        setDisplayOtp(null)
        setOtpError('')
        console.log('Ride state updated successfully')
      } else {
        console.error('Invalid response structure:', res.data)
        setOtpError('Failed to verify OTP. Please try again.')
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Invalid OTP. Please try again.'
      setOtpError(errorMsg)
      setOtp(['', '', '', ''])
    } finally {
      setVerifyingOtp(false)
    }
  }

  const updateStatus = async (status) => {
    setUpdatingStatus(true)
    try {
      await api.patch(`/rides/${rideId}/status`, { status })
      socket.emit('ride-status-update', { rideId, status })
      fetchRide()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const cancelRide = async () => {
    if (!window.confirm('Are you sure you want to cancel this ride?')) return
    
    try {
      await api.post(`/rides/${rideId}/cancel`)
      navigate(user?.role === 'driver' ? '/driver' : '/rider')
    } catch (error) {
      console.error('Error cancelling ride:', error)
      alert('Failed to cancel ride')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!ride) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Ride not found or loading...</p>
          {!loading && (
            <button onClick={() => { setLoading(true); fetchRide(); }} className="btn-primary mr-2">
              Retry
            </button>
          )}
          <button onClick={() => navigate(-1)} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const isDriver = user?.role === 'driver'
  const isRider = user?.role === 'rider'
  const mapCenter = driverLocation || 
    (ride.pickupLocation ? [ride.pickupLocation.lat, ride.pickupLocation.lng] : [40.7128, -74.0060])

  const positions = []
  if (ride.pickupLocation) {
    positions.push([ride.pickupLocation.lat, ride.pickupLocation.lng])
  }
  if (driverLocation) {
    positions.push(driverLocation)
  }
  if (ride.dropoffLocation) {
    positions.push([ride.dropoffLocation.lat, ride.dropoffLocation.lng])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Ride Details</h1>
            <button
              onClick={() => navigate(isDriver ? '/driver' : '/rider')}
              className="text-gray-600 hover:text-gray-800"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Map */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: '500px' }}>
              <ErrorBoundary fallback={
                <div className="h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center p-4">
                    <p className="text-red-600 mb-2">Map unavailable</p>
                    <p className="text-sm text-gray-600">Location data: {ride?.pickupLocation?.address} → {ride?.dropoffLocation?.address}</p>
                  </div>
                </div>
              }>
                <MapContainer
                  key={`map-${ride?._id}`}
                  center={mapCenter}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <MapController center={mapCenter} />
                  {ride.pickupLocation && (
                    <Marker position={[ride.pickupLocation.lat, ride.pickupLocation.lng]} />
                  )}
                  {driverLocation && (
                    <Marker position={driverLocation} />
                  )}
                  {ride.dropoffLocation && (
                    <Marker position={[ride.dropoffLocation.lat, ride.dropoffLocation.lng]} />
                  )}
                  {positions.length > 1 && (
                    <Polyline positions={positions} color="blue" />
                  )}
                </MapContainer>
              </ErrorBoundary>
            </div>

            {/* Ride Info */}
            <div className="space-y-6">
              {/* Status */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Ride Status</h2>
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`px-4 py-2 rounded-full font-semibold ${
                    ride.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    ride.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                    ride.status === 'driver_arrived' ? 'bg-purple-100 text-purple-800' :
                    ride.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                    ride.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {ride.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Debug Info */}
                {ride.status === 'driver_arrived' && (
                  <div className="mb-4 p-3 bg-gray-100 rounded text-sm text-gray-700">
                    <p>Status: {ride.status}</p>
                    <p>OTP Code: {ride.otp?.code || 'not set'}</p>
                    <p>displayOtp: {displayOtp || 'not set'}</p>
                  </div>
                )}

                {/* OTP Display for Rider */}
                {isRider && ride.status === 'driver_arrived' && (displayOtp || ride.otp?.code) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4"
                  >
                    <h3 className="font-bold text-green-900 mb-2">Share OTP with Driver</h3>
                    <p className="text-sm text-green-800 mb-4">Driver has arrived! Share this code with the driver:</p>
                    
                    {/* OTP Display Box */}
                    <div className="bg-white border-3 border-green-400 rounded-lg p-6 text-center mb-4">
                      <p className="text-xs text-gray-500 mb-2">Your OTP</p>
                      <p className="text-5xl font-bold text-green-600 tracking-widest">{displayOtp || ride.otp?.code}</p>
                    </div>

                    {/* Timer */}
                    <div className="text-sm text-green-700 text-center">
                      Expires in: {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                    </div>
                  </motion.div>
                )}

                {/* OTP Input for Driver */}
                {isDriver && ride.status === 'driver_arrived' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4"
                  >
                    <h3 className="font-bold text-blue-900 mb-3">Enter Rider's OTP to Start Ride</h3>
                    <p className="text-sm text-blue-800 mb-4">Ask the rider for the 4-digit OTP code</p>
                    
                    {/* OTP Input Fields */}
                    <div className="flex gap-2 mb-3">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-input-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleOtpInput(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-12 text-center text-2xl font-bold border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                          placeholder="0"
                          disabled={verifyingOtp}
                        />
                      ))}
                    </div>

                    {/* Timer */}
                    <div className="text-sm text-blue-700 mb-3">
                      Time remaining: {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                    </div>

                    {/* Error Message */}
                    {otpError && (
                      <div className="text-sm text-red-600 mb-3">{otpError}</div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={verifyOtpCode}
                        disabled={verifyingOtp || otp.join('').length !== 4}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {verifyingOtp ? 'Verifying...' : 'Start Ride'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Driver Actions */}
                {isDriver && ride.status === 'accepted' && (
                  <div className="space-y-2">
                    <button
                      onClick={() => updateStatus('driver_arrived')}
                      disabled={updatingStatus}
                      className="w-full btn-primary"
                    >
                      Mark as Arrived
                    </button>
                  </div>
                )}

                {isDriver && ride.status === 'driver_arrived' && (
                  <button
                    onClick={() => updateStatus('in_progress')}
                    disabled={updatingStatus}
                    className="w-full btn-primary"
                  >
                    Start Ride
                  </button>
                )}

                {isDriver && ride.status === 'in_progress' && (
                  <button
                    onClick={() => updateStatus('completed')}
                    disabled={updatingStatus}
                    className="w-full btn-primary"
                  >
                    Complete Ride
                  </button>
                )}

                {/* Cancel Button */}
                {['pending', 'accepted', 'driver_arrived'].includes(ride.status) && (
                  <button
                    onClick={cancelRide}
                    className="w-full mt-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Cancel Ride
                  </button>
                )}

                {/* Payment Collection - Driver View */}
                {isDriver && ride.status === 'completed' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mt-4"
                  >
                    <h3 className="font-bold text-green-900 mb-4 text-lg">Payment Collected</h3>
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <p className="text-gray-600 text-sm mb-2">Amount from Rider</p>
                      <p className="text-4xl font-bold text-green-600">${ride.fare?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="bg-green-100 border border-green-300 rounded p-3">
                      <p className="text-green-900 text-sm font-semibold">✓ Ride completed successfully!</p>
                      <p className="text-green-800 text-xs mt-1">The rider will make the payment. Thank you for your service!</p>
                    </div>
                  </motion.div>
                )}

                {/* Payment Collection - Rider View */}
                {isRider && ride.status === 'completed' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mt-4"
                  >
                    <h3 className="font-bold text-blue-900 mb-4 text-lg">Please Pay the Driver</h3>
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <p className="text-gray-600 text-sm mb-2">Amount Due</p>
                      <p className="text-4xl font-bold text-blue-600">${ride.fare?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-blue-100 border border-blue-300 rounded p-3">
                        <p className="text-blue-900 text-sm font-semibold">💳 Cash Payment</p>
                        <p className="text-blue-800 text-xs mt-1">Please pay ${ride.fare?.toFixed(2) || '0.00'} directly to the driver</p>
                      </div>
                      <button
                        onClick={() => alert(`Payment of $${ride.fare?.toFixed(2)} made to driver`)}
                        className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Mark Payment as Sent
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Locations */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Locations</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <FaMapMarkerAlt className="text-primary-600 mt-1" />
                    <div>
                      <p className="font-semibold">Pickup</p>
                      <p className="text-gray-600">{ride.pickupLocation?.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaMapMarkerAlt className="text-green-600 mt-1" />
                    <div>
                      <p className="font-semibold">Dropoff</p>
                      <p className="text-gray-600">{ride.dropoffLocation?.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Driver/Rider Info */}
              {(ride.driver || ride.rider) && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold mb-4">
                    {isDriver ? 'Rider Information' : 'Driver Information'}
                  </h2>
                  {isDriver && ride.rider && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <FaUser className="text-primary-600" />
                        <div>
                          <p className="font-semibold">{ride.rider.name}</p>
                          <p className="text-gray-600 text-sm">Rider</p>
                        </div>
                      </div>
                      {ride.rider.phone && (
                        <div className="flex items-center space-x-3">
                          <FaPhone className="text-primary-600" />
                          <a href={`tel:${ride.rider.phone}`} className="text-primary-600 hover:underline">
                            {ride.rider.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  {isRider && ride.driver && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <FaUser className="text-primary-600" />
                        <div>
                          <p className="font-semibold">{ride.driver.name}</p>
                          <p className="text-gray-600 text-sm">Driver</p>
                          {ride.driver.rating > 0 && (
                            <div className="flex items-center space-x-1 mt-1">
                              <FaStar className="text-yellow-400" />
                              <span className="text-sm">{ride.driver.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {ride.driver.phone && (
                        <div className="flex items-center space-x-3">
                          <FaPhone className="text-primary-600" />
                          <a href={`tel:${ride.driver.phone}`} className="text-primary-600 hover:underline">
                            {ride.driver.phone}
                          </a>
                        </div>
                      )}
                      {ride.driver.vehicleInfo && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="font-semibold mb-2">Vehicle</p>
                          <p className="text-gray-600 text-sm">
                            {ride.driver.vehicleInfo.make} {ride.driver.vehicleInfo.model} ({ride.driver.vehicleInfo.year})
                          </p>
                          <p className="text-gray-600 text-sm">{ride.driver.vehicleInfo.color}</p>
                          <p className="text-gray-600 text-sm">Plate: {ride.driver.vehicleInfo.licensePlate}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Fare Info */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Fare Details</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distance</span>
                    <span className="font-semibold">{ride.distance?.toFixed(2)} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ride Type</span>
                    <span className="font-semibold capitalize">{ride.rideType}</span>
                  </div>
                  <div className="flex justify-between text-xl pt-4 border-t">
                    <span className="font-bold">Total Fare</span>
                    <span className="font-bold text-primary-600">${ride.fare?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
