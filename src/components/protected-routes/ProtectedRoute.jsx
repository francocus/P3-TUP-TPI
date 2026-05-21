import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthenticationContext } from '../services/auth/authentication.context';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthenticationContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
