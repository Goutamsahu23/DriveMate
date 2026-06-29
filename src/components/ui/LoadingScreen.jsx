import { motion } from 'framer-motion'

export default function LoadingScreen({ message = 'Loading' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-void relative overflow-hidden">
      <div className="absolute inset-0">
        <motion.div
          className="absolute w-64 h-64 rounded-full border border-volt/20"
          style={{ top: '50%', left: '50%', x: '-50%', y: '-50%' }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-40 h-40 rounded-full border border-iris/20"
          style={{ top: '50%', left: '50%', x: '-50%', y: '-50%' }}
          animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        <div className="relative w-12 h-12">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-volt/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-1 rounded-full border-2 border-t-volt border-r-transparent border-b-transparent border-l-transparent"
            animate={{ rotate: -360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-mist-muted">{message}</p>
      </motion.div>
    </div>
  )
}
