import { motion } from 'framer-motion'
import StatusBadge from '../ui/StatusBadge'
import Button from '../ui/Button'

export default function RideCard({ ride, onAction, actionLabel, showFare = true, fareLabel = 'Fare' }) {
  const otherParty = ride.driver || ride.rider

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative glass rounded-2xl p-5 hover:border-surface-border-strong transition-all duration-500"
    >
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-volt/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-mist-dim">
            {new Date(ride.createdAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </p>
          {otherParty && (
            <p className="text-mist-muted text-sm mt-1">
              {ride.driver ? `Driver: ${ride.driver.name}` : `Rider: ${ride.rider.name}`}
            </p>
          )}
        </div>
        <StatusBadge status={ride.status} size="sm" />
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-volt mt-2 shrink-0" />
          <p className="text-mist text-sm leading-relaxed line-clamp-2">
            {ride.pickupLocation?.address || 'Pickup location'}
          </p>
        </div>
        <div className="ml-1 border-l border-dashed border-surface-border-strong h-3" />
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-coral mt-2 shrink-0" />
          <p className="text-mist-muted text-sm leading-relaxed line-clamp-2">
            {ride.dropoffLocation?.address || 'Dropoff location'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-surface-border">
        {showFare && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-mist-dim">{fareLabel}</p>
            <p className="font-display font-bold text-xl text-volt">${ride.fare?.toFixed(2)}</p>
          </div>
        )}
        {onAction && (
          <Button variant="secondary" className="!py-2 !px-4 !text-xs" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </motion.div>
  )
}
