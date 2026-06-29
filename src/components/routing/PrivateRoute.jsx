import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingScreen from '../ui/LoadingScreen'

export default function PrivateRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()

  if (loading && !user) {
    return <LoadingScreen />
  }

  if (!user) {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (token && savedUser) {
      return <LoadingScreen />
    }

    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'driver' ? '/driver' : '/rider'} replace />
  }

  return children
}
