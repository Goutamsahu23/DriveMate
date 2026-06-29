import { motion } from 'framer-motion'
import RideCard from './RideCard'

export default function RideHistory({ rides, loading, emptyMessage = 'No rides yet', fareLabel }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative w-10 h-10">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-volt/30 border-t-volt"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <p className="font-mono text-xs uppercase tracking-widest text-mist-dim">Loading rides</p>
      </div>
    )
  }

  if (rides.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-surface border border-surface-border flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl opacity-40">∅</span>
        </div>
        <p className="text-mist-muted">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {rides.map((ride, i) => (
        <motion.div
          key={ride._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <RideCard ride={ride} showFare fareLabel={fareLabel} />
        </motion.div>
      ))}
    </div>
  )
}
