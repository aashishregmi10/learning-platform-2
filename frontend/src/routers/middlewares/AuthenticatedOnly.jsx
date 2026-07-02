import { Navigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

const AuthenticatedOnly = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export default AuthenticatedOnly;
