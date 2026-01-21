import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { FaCar, FaEnvelope, FaLock, FaUser, FaPhone, FaIdCard } from 'react-icons/fa'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'rider',
    vehicleInfo: { make: '', model: '', year: '', color: '', licensePlate: '' },
    driverLicense: ''
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
      role: formData.role
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
        result.errors.forEach(err => {
          errorObj[err.param] = err.msg
        })
        setErrors(errorObj)
      } else {
        setErrors({ general: result.message })
      }
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <FaCar className="text-3xl text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">DriveMate</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-600 mt-2">Join DriveMate today</p>
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                I want to be a
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'rider' })}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                    formData.role === 'rider'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Rider
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'driver' })}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                    formData.role === 'driver'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Driver
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Full Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Phone
              </label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {formData.role === 'driver' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 border-t pt-6"
              >
                <h3 className="font-bold text-gray-900">Vehicle Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">Make</label>
                    <input
                      type="text"
                      value={formData.vehicleInfo.make}
                      onChange={(e) => setFormData({
                        ...formData,
                        vehicleInfo: { ...formData.vehicleInfo, make: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Toyota"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">Model</label>
                    <input
                      type="text"
                      value={formData.vehicleInfo.model}
                      onChange={(e) => setFormData({
                        ...formData,
                        vehicleInfo: { ...formData.vehicleInfo, model: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Camry"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">Year</label>
                    <input
                      type="number"
                      value={formData.vehicleInfo.year}
                      onChange={(e) => setFormData({
                        ...formData,
                        vehicleInfo: { ...formData.vehicleInfo, year: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="2020"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">Color</label>
                    <input
                      type="text"
                      value={formData.vehicleInfo.color}
                      onChange={(e) => setFormData({
                        ...formData,
                        vehicleInfo: { ...formData.vehicleInfo, color: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Blue"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">License Plate</label>
                  <input
                    type="text"
                    value={formData.vehicleInfo.licensePlate}
                    onChange={(e) => setFormData({
                      ...formData,
                      vehicleInfo: { ...formData.vehicleInfo, licensePlate: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="ABC-1234"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Driver License Number
                  </label>
                  <div className="relative">
                    <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required={formData.role === 'driver'}
                      value={formData.driverLicense}
                      onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="DL123456"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
