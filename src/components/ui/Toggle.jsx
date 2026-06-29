import { motion } from 'framer-motion'

export default function Toggle({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-4 text-left group"
    >
      <div>
        {label && <p className="font-display font-semibold text-mist">{label}</p>}
        {description && <p className="text-mist-muted text-sm mt-0.5">{description}</p>}
      </div>
      <div className={`relative w-16 h-8 rounded-full transition-colors duration-500 ${checked ? 'bg-volt/20 border border-volt/40' : 'bg-void-200 border border-surface-border'}`}>
        <motion.div
          className={`absolute top-1 w-6 h-6 rounded-full shadow-lg ${checked ? 'bg-volt' : 'bg-mist-dim'}`}
          animate={{ left: checked ? 'calc(100% - 1.75rem)' : '0.25rem' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
        {checked && (
          <motion.div
            className="absolute inset-0 rounded-full bg-volt/10"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </div>
    </button>
  )
}
