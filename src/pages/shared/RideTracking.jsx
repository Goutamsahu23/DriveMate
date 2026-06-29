import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import { io } from 'socket.io-client'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import ErrorBoundary from '../../components/common/ErrorBoundary'
import AppHeader from '../../components/layout/AppHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import Button from '../../components/ui/Button'
import Toast from '../../components/ui/Toast'
import { SOCKET_URL } from '../../config/env'
import { FaMapMarkerAlt, FaUser, FaPhone, FaStar, FaArrowLeft } from 'react-icons/fa'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const socket = io(SOCKET_URL)

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
  const [otpTimer, setOtpTimer] = useState(300)
  const [displayOtp, setDisplayOtp] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetchRide()

    socket.on('connect', () => socket.emit('join-room', rideId))

    socket.on('ride-status-update', (data) => {
      if (data.rideId === rideId) {
        const updatedRide = data.ride || { ...ride, status: data.status }
        setRide(updatedRide)
        if (data.status === 'driver_arrived' && updatedRide.otp?.code) {
          setDisplayOtp(updatedRide.otp.code)
          setOtpTimer(300)
        }
      }
    })

    socket.on('ride-status', (data) => {
      if (data.rideId === rideId) fetchRide()
    })

    socket.on('driver-arrived', (data) => {
      if (data.rideId === rideId && data.otp) {
        setDisplayOtp(data.otp)
        setOtpTimer(300)
      }
    })

    socket.on('otp-generated', (data) => {
      if (data.rideId === rideId) {
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
      const res = await api.get(`/rides/${rideId}`)
      if (!res.data) { setLoading(false); return }
      setRide(res.data)
      if (res.data.status === 'driver_arrived' && res.data.otp?.code) {
        setDisplayOtp(res.data.otp.code)
        setOtpTimer(300)
      }
      if (res.data.driver?.currentLocation) {
        setDriverLocation([res.data.driver.currentLocation.lat, res.data.driver.currentLocation.lng])
      }
    } catch (error) {
      console.error('Error fetching ride:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (ride?.status !== 'driver_arrived' || otpTimer <= 0) return
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
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

  const handleOtpInput = (index, value) => {
    if (!/^\d?$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setOtpError('')
    if (value && index < 3) document.getElementById(`otp-input-${index + 1}`)?.focus()
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus()
    }
  }

  const verifyOtpCode = async () => {
    const otpCode = otp.join('')
    if (otpCode.length !== 4) { setOtpError('Please enter all 4 digits'); return }
    setVerifyingOtp(true)
    setOtpError('')
    try {
      const res = await api.post(`/rides/${rideId}/verify-otp`, { otp: otpCode })
      if (res.data?.ride) {
        setRide({ ...ride, ...res.data.ride })
        setOtp(['', '', '', ''])
        setDisplayOtp(null)
      } else {
        setOtpError('Failed to verify OTP. Please try again.')
      }
    } catch (error) {
      setOtpError(error.response?.data?.message || 'Invalid OTP. Please try again.')
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
    } catch {
      setToast('Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const cancelRide = async () => {
    if (!window.confirm('Are you sure you want to cancel this ride?')) return
    try {
      await api.post(`/rides/${rideId}/cancel`)
      navigate(user?.role === 'driver' ? '/driver' : '/rider')
    } catch {
      setToast('Failed to cancel ride')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="relative w-12 h-12">
          <motion.div className="absolute inset-0 rounded-full border-2 border-volt/30 border-t-volt" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
        </div>
      </div>
    )
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center p-6">
        <div className="text-center glass rounded-3xl p-10 max-w-md">
          <p className="text-mist-muted mb-6">Ride not found</p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => { setLoading(true); fetchRide() }}>Retry</Button>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </div>
    )
  }

  const isDriver = user?.role === 'driver'
  const isRider = user?.role === 'rider'
  const mapCenter = driverLocation || (ride.pickupLocation ? [ride.pickupLocation.lat, ride.pickupLocation.lng] : [40.7128, -74.0060])
  const positions = []
  if (ride.pickupLocation) positions.push([ride.pickupLocation.lat, ride.pickupLocation.lng])
  if (driverLocation) positions.push(driverLocation)
  if (ride.dropoffLocation) positions.push([ride.dropoffLocation.lat, ride.dropoffLocation.lng])

  const formatTimer = (t) => `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, '0')}`

  return (
    <div className="min-h-screen bg-void flex flex-col">
      <AppHeader role={user?.role} />
      <Toast message={toast} type="error" onClose={() => setToast('')} />

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Map */}
        <div className="relative flex-1 min-h-[40vh] lg:min-h-0">
          <ErrorBoundary fallback={
            <div className="h-full flex items-center justify-center bg-void-100 p-6 text-center">
              <p className="text-mist-muted text-sm">{ride.pickupLocation?.address} → {ride.dropoffLocation?.address}</p>
            </div>
          }>
            <MapContainer key={`map-${ride._id}`} center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
              <MapController center={mapCenter} />
              {ride.pickupLocation && <Marker position={[ride.pickupLocation.lat, ride.pickupLocation.lng]} />}
              {driverLocation && <Marker position={driverLocation} />}
              {ride.dropoffLocation && <Marker position={[ride.dropoffLocation.lat, ride.dropoffLocation.lng]} />}
              {positions.length > 1 && <Polyline positions={positions} color="#c8ff00" weight={3} opacity={0.6} dashArray="8 12" />}
            </MapContainer>
          </ErrorBoundary>

          <button
            onClick={() => navigate(isDriver ? '/driver' : '/rider')}
            className="absolute top-4 left-4 z-[1000] glass-strong rounded-full px-4 py-2 flex items-center gap-2 text-sm text-mist-muted hover:text-mist transition-colors"
          >
            <FaArrowLeft className="w-3 h-3" /> Back
          </button>
        </div>

        {/* Ride panel */}
        <div className="w-full lg:w-[440px] xl:w-[480px] glass-strong border-t lg:border-t-0 lg:border-l border-surface-border overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-volt mb-1">Live tracking</p>
                <h1 className="font-display font-bold text-xl text-mist">Ride Details</h1>
              </div>
              <StatusBadge status={ride.status} />
            </div>

            {/* OTP — Rider view */}
            {isRider && ride.status === 'driver_arrived' && (displayOtp || ride.otp?.code) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-3xl border border-volt/30 bg-volt/5 p-6 text-center"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-volt mb-2">Share with driver</p>
                <p className="font-display font-bold text-5xl text-volt tracking-[0.3em] my-4">
                  {displayOtp || ride.otp?.code}
                </p>
                <p className="font-mono text-xs text-mist-dim">Expires in {formatTimer(otpTimer)}</p>
              </motion.div>
            )}

            {/* OTP — Driver view */}
            {isDriver && ride.status === 'driver_arrived' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-3xl border border-iris/30 bg-iris/5 p-6"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-iris mb-4">Enter rider OTP</p>
                <div className="flex gap-3 justify-center mb-4">
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
                      className="w-14 h-14 text-center text-2xl font-display font-bold bg-void-50 border border-surface-border-strong rounded-2xl text-mist focus:outline-none focus:border-iris/50 focus:ring-2 focus:ring-iris/20"
                      disabled={verifyingOtp}
                    />
                  ))}
                </div>
                <p className="font-mono text-xs text-mist-dim text-center mb-3">{formatTimer(otpTimer)} remaining</p>
                {otpError && <p className="text-coral text-sm text-center mb-3 font-mono">{otpError}</p>}
                <Button className="w-full" onClick={verifyOtpCode} disabled={verifyingOtp || otp.join('').length !== 4} loading={verifyingOtp}>
                  Verify & Start Ride
                </Button>
              </motion.div>
            )}

            {/* Driver actions */}
            {isDriver && ride.status === 'accepted' && (
              <Button className="w-full" onClick={() => updateStatus('driver_arrived')} loading={updatingStatus}>
                Mark as Arrived
              </Button>
            )}
            {isDriver && ride.status === 'driver_arrived' && (
              <Button className="w-full" onClick={() => updateStatus('in_progress')} loading={updatingStatus}>
                Start Ride
              </Button>
            )}
            {isDriver && ride.status === 'in_progress' && (
              <Button className="w-full" onClick={() => updateStatus('completed')} loading={updatingStatus}>
                Complete Ride
              </Button>
            )}

            {['pending', 'accepted', 'driver_arrived'].includes(ride.status) && (
              <Button variant="danger" className="w-full" onClick={cancelRide}>Cancel Ride</Button>
            )}

            {/* Payment — completed */}
            {ride.status === 'completed' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-3xl border border-volt/20 bg-volt/5 p-6"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-mist-dim mb-2">
                  {isDriver ? 'Payment collected' : 'Amount due'}
                </p>
                <p className="font-display font-bold text-4xl text-volt mb-4">${ride.fare?.toFixed(2)}</p>
                {isRider && (
                  <Button variant="secondary" className="w-full" onClick={() => setToast(`Payment of $${ride.fare?.toFixed(2)} marked as sent`)}>
                    Mark Payment Sent
                  </Button>
                )}
                {isDriver && (
                  <p className="text-mist-muted text-sm">Ride completed. Collect cash from rider.</p>
                )}
              </motion.div>
            )}

            {/* Locations */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-volt mt-1.5 shrink-0 shadow-[0_0_8px_rgba(200,255,0,0.5)]" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-mist-dim">Pickup</p>
                  <p className="text-mist text-sm mt-0.5">{ride.pickupLocation?.address}</p>
                </div>
              </div>
              <div className="ml-1.5 border-l border-dashed border-surface-border-strong h-4" />
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-coral mt-1.5 shrink-0 shadow-[0_0_8px_rgba(255,77,109,0.5)]" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-mist-dim">Dropoff</p>
                  <p className="text-mist-muted text-sm mt-0.5">{ride.dropoffLocation?.address}</p>
                </div>
              </div>
            </div>

            {/* Contact info */}
            {(ride.driver || ride.rider) && (
              <div className="glass rounded-2xl p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-mist-dim mb-4">
                  {isDriver ? 'Rider' : 'Driver'}
                </p>
                {isDriver && ride.rider && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-volt to-iris flex items-center justify-center text-void font-bold">
                        {ride.rider.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-display font-semibold text-mist">{ride.rider.name}</p>
                        <p className="text-mist-dim text-xs">Rider</p>
                      </div>
                    </div>
                    {ride.rider.phone && (
                      <a href={`tel:${ride.rider.phone}`} className="flex items-center gap-2 text-volt text-sm hover:underline">
                        <FaPhone className="w-3 h-3" /> {ride.rider.phone}
                      </a>
                    )}
                  </div>
                )}
                {isRider && ride.driver && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-volt to-iris flex items-center justify-center text-void font-bold">
                        {ride.driver.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-display font-semibold text-mist">{ride.driver.name}</p>
                        {ride.driver.rating > 0 && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <FaStar className="text-volt w-3 h-3" />
                            <span className="text-xs text-mist-muted">{ride.driver.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {ride.driver.phone && (
                      <a href={`tel:${ride.driver.phone}`} className="flex items-center gap-2 text-volt text-sm hover:underline">
                        <FaPhone className="w-3 h-3" /> {ride.driver.phone}
                      </a>
                    )}
                    {ride.driver.vehicleInfo && (
                      <div className="pt-3 border-t border-surface-border text-sm text-mist-muted">
                        <p>{ride.driver.vehicleInfo.make} {ride.driver.vehicleInfo.model} · {ride.driver.vehicleInfo.color}</p>
                        <p className="font-mono text-xs mt-1">{ride.driver.vehicleInfo.licensePlate}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Fare */}
            <div className="flex items-center justify-between pt-4 border-t border-surface-border">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-mist-dim">Total fare</p>
                <p className="text-mist-dim text-xs mt-0.5">{ride.distance?.toFixed(2)} km · {ride.rideType}</p>
              </div>
              <p className="font-display font-bold text-2xl text-volt">${ride.fare?.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
