import React from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PrivateRoute from "./routes/PrivateRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import ResetPasswordPage from "./pages/ResetPasswordPage";

const OktaCallback = () => {
  const { handleOktaCallback } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    handleOktaCallback(navigate);
  }, [navigate, handleOktaCallback]);

  return <h2>Authenticating...</h2>;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/callback" element={<OktaCallback />} />  {/* This route handles the callback */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute allowedRoles={["Super Admin", "Warehouse Manager"]}>
                <Dashboard />
              </PrivateRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
