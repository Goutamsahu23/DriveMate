import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import RiderDashboard from './pages/RiderDashboard'
import DriverDashboard from './pages/DriverDashboard'
import Booking from './pages/Booking'
import RideTracking from './pages/RideTracking'

function PrivateRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()

  // Show loading only on initial load, not during navigation
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Check localStorage as fallback if user state is not set yet
  if (!user) {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    // If we have token/user in localStorage but not in state, wait a bit
    if (token && savedUser) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )
    }
    
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'driver' ? '/driver' : '/rider'} replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/rider"
        element={
          <PrivateRoute requiredRole="rider">
            <RiderDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/driver"
        element={
          <PrivateRoute requiredRole="driver">
            <DriverDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/booking"
        element={
          <PrivateRoute requiredRole="rider">
            <Booking />
          </PrivateRoute>
        }
      />
      <Route
        path="/ride/:rideId"
        element={
          <PrivateRoute>
            <RideTracking />
          </PrivateRoute>
        }
      />
    </Routes>
  )
}

export default App
