import { Routes, Route } from 'react-router-dom'
import PrivateRoute from '../components/routing/PrivateRoute'
import Landing from '../pages/public/Landing'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import RiderDashboard from '../pages/rider/RiderDashboard'
import DriverDashboard from '../pages/driver/DriverDashboard'
import Booking from '../pages/rider/Booking'
import RideTracking from '../pages/shared/RideTracking'

export default function AppRoutes() {
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
