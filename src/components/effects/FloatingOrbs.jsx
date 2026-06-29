import { motion } from 'framer-motion'

export default function FloatingOrbs({ className = '' }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-iris/10 blur-[120px]"
        style={{ top: '-10%', right: '-10%' }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-volt/8 blur-[100px]"
        style={{ bottom: '10%', left: '-5%' }}
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full bg-coral/8 blur-[80px]"
        style={{ top: '40%', left: '50%' }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
    </div>
  )
}
