import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { io } from 'socket.io-client'
import { FaMapMarkerAlt } from 'react-icons/fa'
import { SOCKET_URL } from '../../config/env'
import DashboardLayout from '../../components/layout/DashboardLayout'
import ActiveRideBanner from '../../components/rides/ActiveRideBanner'
import RideHistory from '../../components/rides/RideHistory'
import Toggle from '../../components/ui/Toggle'
import Button from '../../components/ui/Button'
import Toast from '../../components/ui/Toast'
import { DRIVER_ACTIVE_STATUSES } from '../../lib/constants'
import { staggerContainer, staggerItem } from '../../lib/motion'

const socket = io(SOCKET_URL)

export default function DriverDashboard() {
  const { user, updateAvailability, updateLocation } = useAuth()
  const navigate = useNavigate()
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable || false)
  const [rides, setRides] = useState([])
  const [availableRides, setAvailableRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetchRides()
    if (isAvailable) fetchAvailableRides()

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        updateLocation(position.coords.latitude, position.coords.longitude)
      })

      const locationInterval = setInterval(() => {
        navigator.geolocation.getCurrentPosition((position) => {
          updateLocation(position.coords.latitude, position.coords.longitude)
        })
      }, 30000)

      socket.on('connect', () => {
        socket.emit('join-room', user?._id)
      })

      socket.on('pending-ride-available', (rideData) => {
        const normalizedRide = {
          ...rideData,
          rideId: rideData.rideId || rideData._id,
          _id: rideData._id || rideData.rideId,
        }
        setAvailableRides((prev) => {
          const exists = prev.some((r) => (r.rideId || r._id) === (normalizedRide.rideId || normalizedRide._id))
          if (exists) return prev
          return [...prev, normalizedRide]
        })
      })

      socket.on('ride-accepted-by-driver', (rideId) => {
        setAvailableRides((prev) => prev.filter((r) => (r.rideId || r._id) !== rideId))
      })

      return () => {
        clearInterval(locationInterval)
        socket.off('pending-ride-available')
        socket.off('ride-accepted-by-driver')
      }
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
    if (newStatus) fetchAvailableRides()
    else setAvailableRides([])
  }

  const handleAcceptRide = async (ride) => {
    try {
      const rideId = ride.rideId || ride._id
      await api.post(`/rides/${rideId}/accept`)
      setAvailableRides((prev) => prev.filter((r) => (r.rideId || r._id) !== (ride.rideId || ride._id)))
      if (socket?.emit) socket.emit('ride-accepted', { rideId })
      fetchRides()
      navigate(`/ride/${rideId}`)
    } catch (error) {
      setToast(error.response?.data?.message || 'Failed to accept ride')
    }
  }

  const activeRide = rides.find((r) => DRIVER_ACTIVE_STATUSES.includes(r.status))
  const pastRides = rides.filter((r) => !DRIVER_ACTIVE_STATUSES.includes(r.status))

  return (
    <DashboardLayout role="driver">
      <Toast message={toast} type="error" onClose={() => setToast('')} />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-10">
        <motion.div variants={staggerItem}>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-mist-dim mb-2">Driver Hub</p>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-mist tracking-tight">
            Welcome, <span className="text-gradient-volt">{user?.name?.split(' ')[0]}</span>
          </h1>
        </motion.div>

        {/* Availability toggle */}
        <motion.div variants={staggerItem} className="glass rounded-3xl p-6 md:p-8">
          <Toggle
            checked={isAvailable}
            onChange={handleToggleAvailability}
            label={isAvailable ? "You're online" : "You're offline"}
            description={isAvailable ? 'Receiving ride requests in your area' : 'Go online to start accepting rides'}
          />
          {isAvailable && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-volt animate-pulse" />
              <span className="font-mono text-xs text-volt uppercase tracking-widest">Scanning for rides</span>
            </motion.div>
          )}
        </motion.div>

        {/* Active ride */}
        {activeRide && (
          <motion.div variants={staggerItem}>
            <ActiveRideBanner ride={activeRide} />
          </motion.div>
        )}

        {/* Available rides */}
        <AnimatePresence>
          {isAvailable && !activeRide && (
            <motion.div
              variants={staggerItem}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-surface-border" />
                <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-mist-dim">Available Rides</h2>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-surface-border" />
              </div>

              {availableRides.length > 0 ? (
                <div className="space-y-4">
                  {availableRides.map((ride, i) => (
                    <motion.div
                      key={ride.rideId || ride._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="glass rounded-3xl p-6 hover:border-volt/20 transition-all duration-500 group"
                    >
                      <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-3">
                          <FaMapMarkerAlt className="text-volt mt-1 shrink-0" />
                          <div>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-mist-dim">Pickup</p>
                            <p className="text-mist text-sm">{ride.pickupLocation?.address || 'Pickup Location'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <FaMapMarkerAlt className="text-coral mt-1 shrink-0" />
                          <div>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-mist-dim">Dropoff</p>
                            <p className="text-mist-muted text-sm">{ride.dropoffLocation?.address || 'Dropoff Location'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-6 pt-4 border-t border-surface-border">
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-widest text-mist-dim">Distance</p>
                          <p className="font-display font-bold text-mist">{ride.distance?.toFixed(2)} km</p>
                        </div>
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-widest text-mist-dim">Fare</p>
                          <p className="font-display font-bold text-volt">${ride.fare?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-widest text-mist-dim">Type</p>
                          <p className="font-display font-bold text-mist capitalize">{ride.rideType}</p>
                        </div>
                      </div>

                      <Button className="w-full group-hover:shadow-volt" onClick={() => handleAcceptRide(ride)}>
                        Accept Ride →
                      </Button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="glass rounded-3xl p-12 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 rounded-full border border-dashed border-surface-border-strong mx-auto mb-4 flex items-center justify-center"
                  >
                    <span className="text-2xl opacity-30">◎</span>
                  </motion.div>
                  <p className="text-mist-muted">No rides available right now</p>
                  <p className="text-mist-dim text-sm mt-1">New requests appear here instantly</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        <motion.div variants={staggerItem}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-surface-border" />
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-mist-dim">Earnings History</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-surface-border" />
          </div>
          <RideHistory rides={pastRides.length ? pastRides : rides} loading={loading} fareLabel="Earnings" />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
