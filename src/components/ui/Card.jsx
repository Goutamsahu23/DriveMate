import { motion } from 'framer-motion'

export default function Card({
  children,
  className = '',
  hover = false,
  glow,
  ...props
}) {
  const glowClass = glow === 'volt' ? 'hover:shadow-volt' : glow === 'coral' ? 'hover:shadow-coral' : glow === 'iris' ? 'hover:shadow-iris' : ''

  return (
    <motion.div
      className={`card ${hover ? `hover:-translate-y-1 ${glowClass}` : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
