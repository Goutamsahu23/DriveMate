import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { io } from 'socket.io-client'
import { FaCar, FaToggleOn, FaToggleOff, FaHistory, FaUser, FaSignOutAlt, FaMapMarkerAlt } from 'react-icons/fa'

const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000')

export default function DriverDashboard() {
  const { user, updateAvailability, updateLocation, logout } = useAuth()
  const navigate = useNavigate()
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable || false)
  const [rides, setRides] = useState([])
  const [pendingRides, setPendingRides] = useState([])
  const [availableRides, setAvailableRides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRides()
    if (isAvailable) {
      fetchAvailableRides()
    }
    
    // Update location periodically
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        updateLocation(position.coords.latitude, position.coords.longitude)
      })
      
      const locationInterval = setInterval(() => {
        navigator.geolocation.getCurrentPosition((position) => {
          updateLocation(position.coords.latitude, position.coords.longitude)
        })
      }, 30000) // Update every 30 seconds

      return () => clearInterval(locationInterval)
    }

    // Socket.io setup
    socket.on('connect', () => {
      console.log('Driver socket connected:', socket.id)
      socket.emit('join-room', user?._id)
      console.log('Joined room with userId:', user?._id)
    })

    socket.on('pending-ride-available', (rideData) => {
      console.log('New pending ride available:', rideData)
      // Add to available rides list
      const normalizedRide = {
        ...rideData,
        rideId: rideData.rideId || rideData._id,
        _id: rideData._id || rideData.rideId
      }
      setAvailableRides(prev => {
        // Avoid duplicates
        const exists = prev.some(r => (r.rideId || r._id) === (normalizedRide.rideId || normalizedRide._id))
        if (exists) return prev
        return [...prev, normalizedRide]
      })
    })

    socket.on('ride-accepted-by-driver', (rideId) => {
      console.log('Ride accepted by another driver:', rideId)
      // Remove from available rides
      setAvailableRides(prev => prev.filter(r => (r.rideId || r._id) !== rideId))
    })

    return () => {
      socket.off('pending-ride-available')
      socket.off('ride-accepted-by-driver')
    }
  }, [user, isAvailable])

  const fetchRides = async () => {
    try {
      const res = await api.get('/rides/my-rides')
      setRides(res.data)
    } catch (error) {
      console.error('Error fetching rides:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableRides = async () => {
    try {
      const res = await api.get('/rides/pending/all')
      setAvailableRides(res.data)
    } catch (error) {
      console.error('Error fetching available rides:', error)
    }
  }

  const handleToggleAvailability = async () => {
    const newStatus = !isAvailable
    setIsAvailable(newStatus)
    await updateAvailability(newStatus)
    if (newStatus) {
      // When going online, fetch available rides
      fetchAvailableRides()
    } else {
      // When going offline, clear available rides
      setAvailableRides([])
    }
  }

  const handleAcceptRide = async (ride) => {
    try {
      const rideId = ride.rideId || ride._id
      console.log('Accepting ride:', rideId)
      await api.post(`/rides/${rideId}/accept`)
      
      // Remove from available rides
      setAvailableRides(prev => prev.filter(r => (r.rideId || r._id) !== (ride.rideId || ride._id)))
      
      // Notify other drivers via Socket.io
      if (socket && socket.emit) {
        socket.emit('ride-accepted', { rideId })
      }
      
      fetchRides()
      navigate(`/ride/${rideId}`)
    } catch (error) {
      console.error('Error accepting ride:', error)
      alert('Failed to accept ride: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleLogout = () => {
    socket.disconnect()
    logout()
    navigate('/')
  }

  const activeRide = rides.find(r => ['accepted', 'driver_arrived', 'in_progress'].includes(r.status))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaCar className="text-2xl text-primary-600" />
              <span className="text-xl font-bold text-gray-900">DriveMate</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FaUser className="text-gray-600" />
                <span className="font-semibold">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Availability Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Driver Status</h3>
              <p className="text-gray-600">
                {isAvailable ? 'You are available for rides' : 'You are offline'}
              </p>
            </div>
            <button
              onClick={handleToggleAvailability}
              className="flex items-center space-x-3"
            >
              {isAvailable ? (
                <FaToggleOn className="text-5xl text-green-600" />
              ) : (
                <FaToggleOff className="text-5xl text-gray-400" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Available Ride Requests */}
        {isAvailable && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold mb-4">Available Rides</h2>
            {availableRides.length > 0 ? (
              <div className="space-y-4">
                {availableRides.map((ride) => (
                  <div key={ride.rideId || ride._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start space-x-3">
                        <FaMapMarkerAlt className="text-primary-600 mt-1" />
                        <div>
                          <p className="font-semibold">Pickup</p>
                          <p className="text-gray-600">{ride.pickupLocation?.address || 'Pickup Location'}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <FaMapMarkerAlt className="text-green-600 mt-1" />
                        <div>
                          <p className="font-semibold">Dropoff</p>
                          <p className="text-gray-600">{ride.dropoffLocation?.address || 'Dropoff Location'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t mb-4">
                      <div>
                        <p className="text-gray-600">Distance</p>
                        <p className="font-semibold">{ride.distance?.toFixed(2)} km</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Fare</p>
                        <p className="font-semibold text-primary-600 text-xl">${ride.fare?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Type</p>
                        <p className="font-semibold capitalize">{ride.rideType}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAcceptRide(ride)}
                      className="w-full btn-primary mt-4"
                    >
                      Accept Ride
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <FaCar className="text-5xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No available rides at the moment</p>
                <p className="text-gray-500 text-sm mt-2">Check back soon for new ride requests</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Active Ride */}
        {activeRide && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Active Ride</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <FaMapMarkerAlt className="text-primary-600 mt-1" />
                  <div>
                    <p className="font-semibold">Pickup</p>
                    <p className="text-gray-600">{activeRide.pickupLocation?.address}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FaMapMarkerAlt className="text-green-600 mt-1" />
                  <div>
                    <p className="font-semibold">Dropoff</p>
                    <p className="text-gray-600">{activeRide.dropoffLocation?.address}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/ride/${activeRide._id}`)}
                  className="w-full btn-primary"
                >
                  View Ride Details
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Ride History */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-6">
            <FaHistory className="text-primary-600" />
            <h2 className="text-2xl font-bold">Ride History</h2>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : rides.length === 0 ? (
            <p className="text-center text-gray-600 py-8">No rides yet</p>
          ) : (
            <div className="space-y-4">
              {rides.map((ride) => (
                <motion.div
                  key={ride._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">
                      {new Date(ride.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      ride.status === 'completed' ? 'bg-green-100 text-green-800' :
                      ride.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ride.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-semibold">From:</span> {ride.pickupLocation?.address}</p>
                    <p><span className="font-semibold">To:</span> {ride.dropoffLocation?.address}</p>
                    {ride.rider && (
                      <p><span className="font-semibold">Rider:</span> {ride.rider.name}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-gray-600">Earnings</span>
                    <span className="text-xl font-bold text-green-600">${ride.fare?.toFixed(2)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
