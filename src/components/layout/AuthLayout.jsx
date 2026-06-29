import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import FloatingOrbs from '../effects/FloatingOrbs'
import GrainOverlay from '../effects/GrainOverlay'

export default function AuthLayout({ children, title, subtitle, wide = false }) {
  return (
    <div className="min-h-screen bg-void relative flex items-center justify-center p-4 overflow-hidden">
      <GrainOverlay />
      <FloatingOrbs />

      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(200,255,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(200,255,0,0.5) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={`relative z-10 w-full ${wide ? 'max-w-lg' : 'max-w-md'}`}
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-11 h-11 rounded-2xl bg-volt flex items-center justify-center group-hover:shadow-volt transition-shadow duration-300">
              <span className="font-display font-extrabold text-void">D</span>
            </div>
          </Link>
          <h1 className="font-display font-bold text-3xl text-mist tracking-tight">{title}</h1>
          {subtitle && <p className="text-mist-muted mt-2 text-sm">{subtitle}</p>}
        </div>

        <div className="glass-strong rounded-4xl p-8 md:p-10">
          {children}
        </div>
      </motion.div>
    </div>
  )
}
