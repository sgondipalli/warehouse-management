import React from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PrivateRoute from "./routes/PrivateRoute";
import Navbar from "./components/Navbar";
import DashboardNavbar from "./components/DashboardNavbar";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import UnauthorizedPage from "./pages/Unauthorized";  // New Unauthorized Page
import ManageUsers from "./pages/ManageUsers";  // New User Management Page

const OktaCallback = () => {
  const { handleOktaCallback } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    handleOktaCallback(navigate);
  }, [navigate, handleOktaCallback]);

  return <h2>Authenticating...</h2>;
};

const AppLayout = () => {
  const { authState } = useAuth();
  return (
    <BrowserRouter>
      {/* Show Public Navbar before login, Dashboard Navbar after login */}
      {authState.isAuthenticated ? <DashboardNavbar /> : <Navbar />}
      <div style={{ display: "flex", height: "100vh" }}>
        {authState.isAuthenticated && <Sidebar />}


        <div style={{ flexGrow: 1, padding: "20px", marginLeft: authState.isAuthenticated ? "250px" : "0px" }}>

          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} /> {/* Unauthorized Page */}
            <Route path="/auth/callback" element={<OktaCallback />} /> {/* Okta Authentication Callback */}

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute allowedRoles={["Super Admin", "Warehouse Manager", "Warehouse Worker", "Auditor/Compliance Officer", "Delivery Agent"]}>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            {/* User Management - Only Super Admin & Warehouse Manager */}
            <Route
              path="/manage-users"
              element={
                <PrivateRoute allowedRoles={["Super Admin", "Warehouse Manager"]}>
                  <ManageUsers />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter >
  );
};

const App = () => (
  <AuthProvider>
    <AppLayout />
  </AuthProvider>
);


export default App;
