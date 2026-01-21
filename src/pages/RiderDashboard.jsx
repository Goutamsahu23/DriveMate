import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { FaCar, FaMapMarkerAlt, FaHistory, FaUser, FaSignOutAlt, FaPlus } from 'react-icons/fa'

export default function RiderDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRides()
    // Update location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        api.patch('/users/location', {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      })
    }
  }, [])

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

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const activeRide = rides.find(r => ['pending', 'accepted', 'driver_arrived', 'in_progress'].includes(r.status))

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
        {activeRide ? (
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
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-4 py-2 rounded-full font-semibold ${
                    activeRide.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    activeRide.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                    activeRide.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {activeRide.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/ride/${activeRide._id}`)}
                  className="w-full btn-primary"
                >
                  Track Ride
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/booking')}
              className="w-full btn-primary text-lg py-4 flex items-center justify-center space-x-2"
            >
              <FaPlus />
              <span>Book a Ride</span>
            </button>
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
                    {ride.driver && (
                      <p><span className="font-semibold">Driver:</span> {ride.driver.name}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-gray-600">Fare</span>
                    <span className="text-xl font-bold text-primary-600">${ride.fare?.toFixed(2)}</span>
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
