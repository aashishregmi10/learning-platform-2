import { Navigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

// Factory for role guards. Redirects to the user's own home if role mismatches.
const makeRoleGuard = (allowed) =>
  function RoleGuard({ children }) {
    const { role, isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (role !== allowed) return <Navigate to={`/app/${role}`} replace />;
    return children;
  };

export const AdminOnly = makeRoleGuard("admin");
export const TeacherOnly = makeRoleGuard("teacher");
export const StudentOnly = makeRoleGuard("student");
