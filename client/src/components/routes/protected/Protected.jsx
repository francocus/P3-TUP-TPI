import { useContext } from "react";
import { Navigate } from "react-router";
import { AuthenticationContext } from "../../services/auth/authentication.context";

const ProtectedByRole = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useContext(AuthenticationContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedByRole;