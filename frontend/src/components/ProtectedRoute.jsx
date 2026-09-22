import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Protects routes that require authentication
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
