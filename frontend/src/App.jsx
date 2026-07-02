import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./hooks/useAuth";
import AuthenticatedOnly from "./routers/middlewares/AuthenticatedOnly";
import AppRouter from "./routers/AppRouter";
import GuestLayout from "./layouts/GuestLayout/GuestLayout";
import HomeScreen from "./screens/Guest/HomeScreen";
import PublicCatalogScreen from "./screens/Guest/PublicCatalogScreen";
import PublicSubjectScreen from "./screens/Guest/PublicSubjectScreen";
import CertificateVerifyScreen from "./screens/Guest/CertificateVerifyScreen";
import LoginScreen from "./screens/Guest/LoginScreen";
import NotFoundScreen from "./screens/NotFoundScreen";

function App() {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      <Route element={<GuestLayout />}>
        <Route
          index
          element={isAuthenticated ? <Navigate to={`/app/${role}`} replace /> : <HomeScreen />}
        />
        <Route path="catalog/:programSlug" element={<PublicCatalogScreen />} />
        <Route path="subjects/:slug" element={<PublicSubjectScreen />} />
        <Route path="verify" element={<CertificateVerifyScreen />} />
        <Route path="verify/:number" element={<CertificateVerifyScreen />} />
      </Route>
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
