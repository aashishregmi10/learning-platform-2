import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./hooks/useAuth";
import AuthenticatedOnly from "./routers/middlewares/AuthenticatedOnly";
import AppRouter from "./routers/AppRouter";
import LoginScreen from "./screens/Guest/LoginScreen";
import NotFoundScreen from "./screens/NotFoundScreen";

function App() {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? `/app/${role}` : "/login"} replace />}
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={`/app/${role}`} replace /> : <LoginScreen />}
      />
      <Route
        path="/app/*"
        element={
          <AuthenticatedOnly>
            <AppRouter />
          </AuthenticatedOnly>
        }
      />
      <Route path="*" element={<NotFoundScreen />} />
    </Routes>
  );
}

export default App;
