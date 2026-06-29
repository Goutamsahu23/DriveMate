import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { FaSignOutAlt } from 'react-icons/fa'

export default function AppHeader({ role }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const homePath = role === 'driver' ? '/driver' : '/rider'

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 border-b border-surface-border bg-void/80 backdrop-blur-2xl"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to={homePath} className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-volt flex items-center justify-center group-hover:shadow-volt transition-all duration-300">
            <span className="font-display font-extrabold text-void text-xs">D</span>
          </div>
          <div>
            <span className="font-display font-bold text-mist text-sm tracking-tight">
              Drive<span className="text-volt">Mate</span>
            </span>
            <p className="text-[10px] font-mono uppercase tracking-widest text-mist-dim">
              {role === 'driver' ? 'Driver' : 'Rider'}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-surface-border">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-volt to-iris flex items-center justify-center text-void text-[10px] font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <span className="text-sm text-mist-muted font-medium">{user?.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-mist-dim hover:text-coral transition-colors duration-200 text-sm"
          >
            <FaSignOutAlt className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </motion.header>
  )
}
