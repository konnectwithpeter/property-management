import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import Overview from "./landlord/Overview";
import TenantPage from "./tenants/TenantPage";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import LandlordPage from "./landlord/LandlordPage";
import { APIProvider } from "./context/APIContext";
import AuthContext, { AuthProvider } from "./context/AuthContext";
import PublicLogin from "./context/PublicLogin";
import PrivateRoute from "./context/PrivateRoute";
import { useContext } from "react";
import ChangePasswordPage from "./pages/ChangePasswordPage";

function AppRouter() {
  return (
    <Router>
      <APIProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route element={<PublicLogin />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path={"/reset-password/:id/:id"}
                element={<ChangePasswordPage />}
              />
            </Route>
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </APIProvider>
    </Router>
  );
}

export default AppRouter;
