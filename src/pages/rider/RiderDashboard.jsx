import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import DashboardLayout from '../../components/layout/DashboardLayout'
import ActiveRideBanner from '../../components/rides/ActiveRideBanner'
import RideHistory from '../../components/rides/RideHistory'
import Button from '../../components/ui/Button'
import { ACTIVE_STATUSES } from '../../lib/constants'
import { staggerContainer, staggerItem } from '../../lib/motion'

export default function RiderDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRides()
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        api.patch('/users/location', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
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

  const activeRide = rides.find((r) => ACTIVE_STATUSES.includes(r.status))
  const pastRides = rides.filter((r) => !ACTIVE_STATUSES.includes(r.status))

  return (
    <DashboardLayout role="rider">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-10">
        {/* Greeting */}
        <motion.div variants={staggerItem}>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-mist-dim mb-2">Dashboard</p>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-mist tracking-tight">
            Hey, <span className="text-gradient-volt">{user?.name?.split(' ')[0]}</span>
          </h1>
        </motion.div>

        {/* Active ride or book CTA */}
        <motion.div variants={staggerItem}>
          {activeRide ? (
            <ActiveRideBanner ride={activeRide} />
          ) : (
            <div className="relative overflow-hidden rounded-3xl border border-surface-border bg-gradient-to-br from-iris/10 via-void-100 to-volt/5 p-8 md:p-12">
              <div className="absolute top-0 right-0 w-72 h-72 bg-volt/5 rounded-full blur-[100px]" />
              <div className="relative z-10 max-w-lg">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-volt mb-3">Ready when you are</p>
                <h2 className="font-display font-bold text-2xl md:text-3xl text-mist mb-3">
                  Where to next?
                </h2>
                <p className="text-mist-muted text-sm mb-8 leading-relaxed">
                  Tap below to set your destination. A driver will be with you in minutes.
                </p>
                <Button onClick={() => navigate('/booking')} className="!text-base">
                  Book a Ride →
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Ride history */}
        <motion.div variants={staggerItem}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-surface-border" />
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-mist-dim">Ride History</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-surface-border" />
          </div>
          <RideHistory rides={pastRides.length ? pastRides : rides} loading={loading} />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
