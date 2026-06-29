import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { FaEnvelope, FaLock } from 'react-icons/fa'
import AuthLayout from '../../components/layout/AuthLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(formData.email, formData.password)

    if (result.success) {
      const targetPath = result.user?.role === 'driver' ? '/driver' : '/rider'
      navigate(targetPath, { replace: true })
    } else {
      setError(result.message || 'Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue your journey">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 px-4 py-3 rounded-2xl border border-coral/30 bg-coral/10 text-coral text-sm font-mono"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          disabled={loading}
          icon={FaEnvelope}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="you@email.com"
        />

        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          disabled={loading}
          icon={FaLock}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="••••••••"
        />

        <Button type="submit" className="w-full !mt-8" loading={loading}>
          {loading ? 'Signing in' : 'Sign In →'}
        </Button>
      </form>

      <p className="text-center mt-8 text-mist-muted text-sm">
        No account?{' '}
        <Link to="/register" className="text-volt font-semibold hover:underline underline-offset-4">
          Create one
        </Link>
      </p>
    </AuthLayout>
  )
}
