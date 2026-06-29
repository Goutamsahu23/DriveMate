import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import StatusBadge from '../ui/StatusBadge'
import Button from '../ui/Button'

export default function ActiveRideBanner({ ride }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-3xl border border-volt/20 bg-gradient-to-br from-volt/5 via-void-100 to-iris/5 p-6 md:p-8"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-volt/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-volt mb-2">Live Ride</p>
            <h2 className="font-display font-bold text-2xl text-mist">Your journey is active</h2>
          </div>
          <StatusBadge status={ride.status} />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="glass rounded-2xl p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-mist-dim mb-1">Pickup</p>
            <p className="text-mist text-sm">{ride.pickupLocation?.address}</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-mist-dim mb-1">Dropoff</p>
            <p className="text-mist text-sm">{ride.dropoffLocation?.address}</p>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={() => navigate(`/ride/${ride._id}`)}
        >
          Track Live →
        </Button>
      </div>
    </motion.div>
  )
}
