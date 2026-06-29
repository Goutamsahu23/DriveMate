import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'

export default function PublicNav() {
  const { user } = useAuth()

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-strong rounded-full px-6 py-3">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-volt flex items-center justify-center group-hover:shadow-volt transition-shadow duration-300">
            <span className="font-display font-extrabold text-void text-sm">D</span>
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-mist hidden sm:block">
            Drive<span className="text-volt">Mate</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <Link to={user.role === 'driver' ? '/driver' : '/rider'}>
              <Button variant="primary" className="!py-2.5 !px-5 !text-xs">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost hidden sm:inline-flex">
                Sign In
              </Link>
              <Link to="/register">
                <Button variant="primary" className="!py-2.5 !px-5 !text-xs">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
