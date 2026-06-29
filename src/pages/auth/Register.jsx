import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { FaEnvelope, FaLock, FaUser, FaPhone, FaIdCard } from 'react-icons/fa'
import AuthLayout from '../../components/layout/AuthLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'rider',
    vehicleInfo: { make: '', model: '', year: '', color: '', licensePlate: '' },
    driverLicense: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: formData.role,
    }

    if (formData.role === 'driver') {
      userData.vehicleInfo = formData.vehicleInfo
      userData.driverLicense = formData.driverLicense
    }

    const result = await register(userData)

    if (result.success) {
      navigate(result.user?.role === 'driver' ? '/driver' : '/rider')
    } else {
      if (result.errors) {
        const errorObj = {}
        result.errors.forEach((err) => { errorObj[err.param] = err.msg })
        setErrors(errorObj)
      } else {
        setErrors({ general: result.message })
      }
    }

    setLoading(false)
  }

  return (
    <AuthLayout wide title="Join the movement" subtitle="Create your DriveMate account">
      <div className="w-full">
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 px-4 py-3 rounded-2xl border border-coral/30 bg-coral/10 text-coral text-sm font-mono"
          >
            {errors.general}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role selector */}
          <div>
            <label className="label-field">I want to be a</label>
            <div className="grid grid-cols-2 gap-3">
              {['rider', 'driver'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData({ ...formData, role })}
                  className={`relative py-3.5 rounded-2xl font-display font-semibold text-sm capitalize transition-all duration-300 ${
                    formData.role === role
                      ? 'bg-volt text-void shadow-volt'
                      : 'bg-void-50 border border-surface-border text-mist-muted hover:border-surface-border-strong hover:text-mist'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Full Name"
            type="text"
            required
            icon={FaUser}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            error={errors.name}
          />

          <Input
            label="Email"
            type="email"
            required
            icon={FaEnvelope}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="you@email.com"
            error={errors.email}
          />

          <Input
            label="Phone"
            type="tel"
            required
            icon={FaPhone}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1234567890"
            error={errors.phone}
          />

          <Input
            label="Password"
            type="password"
            required
            icon={FaLock}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            error={errors.password}
          />

          <AnimatePresence>
            {formData.role === 'driver' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-5 overflow-hidden"
              >
                <div className="glow-line my-2" />
                <p className="font-display font-bold text-mist">Vehicle Information</p>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'make', label: 'Make', placeholder: 'Toyota' },
                    { key: 'model', label: 'Model', placeholder: 'Camry' },
                    { key: 'year', label: 'Year', placeholder: '2024', type: 'number' },
                    { key: 'color', label: 'Color', placeholder: 'Black' },
                  ].map((field) => (
                    <Input
                      key={field.key}
                      label={field.label}
                      type={field.type || 'text'}
                      value={formData.vehicleInfo[field.key]}
                      onChange={(e) => setFormData({
                        ...formData,
                        vehicleInfo: { ...formData.vehicleInfo, [field.key]: e.target.value },
                      })}
                      placeholder={field.placeholder}
                    />
                  ))}
                </div>

                <Input
                  label="License Plate"
                  value={formData.vehicleInfo.licensePlate}
                  onChange={(e) => setFormData({
                    ...formData,
                    vehicleInfo: { ...formData.vehicleInfo, licensePlate: e.target.value },
                  })}
                  placeholder="ABC-1234"
                />

                <Input
                  label="Driver License"
                  required
                  icon={FaIdCard}
                  value={formData.driverLicense}
                  onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value })}
                  placeholder="DL123456"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Button type="submit" className="w-full !mt-8" loading={loading}>
            {loading ? 'Creating account' : 'Create Account →'}
          </Button>
        </form>

        <p className="text-center mt-8 text-mist-muted text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-volt font-semibold hover:underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
