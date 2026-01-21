import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaCar, FaMapMarkerAlt, FaClock, FaShieldAlt, FaStar } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <FaCar className="text-3xl text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">DriveMate</span>
          </motion.div>
          <div className="flex items-center space-x-4">
            {user ? (
              <Link
                to={user.role === 'driver' ? '/driver' : '/rider'}
                className="btn-primary"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 font-semibold">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Quick & Reliable
              <span className="text-primary-600 block">Ride Booking</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Connect with nearby drivers instantly. Fast, safe, and affordable rides at your fingertips.
            </p>
            {!user && (
              <Link to="/register" className="btn-primary text-lg inline-block">
                Start Riding Now
              </Link>
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <FaMapMarkerAlt className="text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Pickup Location</p>
                    <p className="text-gray-600 text-sm">123 Main Street</p>
                  </div>
                </div>
                <div className="border-l-2 border-dashed border-primary-300 ml-6 h-8"></div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FaMapMarkerAlt className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Dropoff Location</p>
                    <p className="text-gray-600 text-sm">456 Oak Avenue</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Estimated Fare</span>
                    <span className="text-2xl font-bold text-primary-600">$12.50</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Why Choose DriveMate?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: FaClock, title: 'Fast Booking', desc: 'Get a ride in minutes' },
            { icon: FaShieldAlt, title: 'Safe & Secure', desc: 'Verified drivers only' },
            { icon: FaStar, title: 'Rated Drivers', desc: 'Top-rated service quality' }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card text-center"
            >
              <feature.icon className="text-4xl text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Ride?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied riders and drivers
          </p>
          {!user && (
            <Link to="/register" className="btn-secondary bg-white text-primary-600 hover:bg-gray-100">
              Sign Up Now
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FaCar className="text-2xl" />
            <span className="text-xl font-bold">DriveMate</span>
          </div>
          <p className="text-gray-400">© 2024 DriveMate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
