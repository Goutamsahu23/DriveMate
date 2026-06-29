import { motion, AnimatePresence } from 'framer-motion'

export default function Toast({ message, type = 'error', onClose }) {
  if (!message) return null

  const colors = {
    error: 'border-coral/30 bg-coral/10 text-coral',
    success: 'border-volt/30 bg-volt/10 text-volt',
    info: 'border-iris/30 bg-iris/10 text-iris',
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-[10000] px-6 py-3 rounded-2xl border backdrop-blur-xl font-mono text-sm ${colors[type]}`}
      >
        <div className="flex items-center gap-3">
          <span>{message}</span>
          {onClose && (
            <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">×</button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
