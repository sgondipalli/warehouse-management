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
import ManageUserService from "./components/ManageUserService";
import CreateUserService from "./components/CreateUserService";
import CreateTradeItem from "./components/CreateTradeItemService";
import EditProfile from "./components/Editprofile";
import ManageTradeItems from "./components/ManageTradeItems";
import EditTradeItemService from "./components/EditTradeItemService";
import StockLevelUI from "./components/StockLevelService";
import ManageLocations from "./components/ManageLocations";
import CreateLocation from "./components/CreateLocation";
import EditLocation from "./components/EditLocation";
import ZoneRackShelfBin from "./components/ZoneRackShelfBin";


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
            <Route path="/dashboard" element={<Dashboard />} />

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
                  <ManageUserService />
                </PrivateRoute>
              }
            />
            <Route
              path="/create-user"
              element={
                <PrivateRoute allowedRoles={["Super Admin", "Warehouse Manager"]}>
                  <CreateUserService />
                </PrivateRoute>
              }
            />
            <Route
              path="/create-trade-item"
              element={
                <PrivateRoute allowedRoles={["Super Admin", "Warehouse Manager"]}>
                  <CreateTradeItem />
                </PrivateRoute>
              }
            />

            <Route
              path="/manage-trade-items"
              element={
                <PrivateRoute allowedRoles={["Super Admin", "Warehouse Manager"]}>
                  <ManageTradeItems />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-trade-item/:id"
              element={
                <PrivateRoute allowedRoles={["Super Admin", "Warehouse Manager"]}>
                  <EditTradeItemService />
                </PrivateRoute>
              }
            />

            <Route
              path="/stock-levels"
              element={
                <PrivateRoute allowedRoles={["Super Admin", "Warehouse Manager"]}>
                  <StockLevelUI />
                </PrivateRoute>
              }
            />

            <Route
              path="/locations"
              element={
                <PrivateRoute allowedRoles={["Super Admin", "Warehouse Manager"]}>
                  <ManageLocations />
                </PrivateRoute>
              }
            />
            <Route
              path="/locations/create"
              element={
                <PrivateRoute allowedRoles={["Super Admin", "Warehouse Manager"]}>
                  <CreateLocation />
                </PrivateRoute>
              }
            />
            <Route
              path="/locations/edit/:id"
              element={
                <PrivateRoute allowedRoles={["Super Admin", "Warehouse Manager"]}>
                  <EditLocation />
                </PrivateRoute>
              }
            />
            <Route
              path="/locations/storage"
              element={
                <PrivateRoute allowedRoles={["Super Admin", "Warehouse Manager"]}>
                  <ZoneRackShelfBin />
                </PrivateRoute>
              }
            />

            <Route
              path="/edit-profile"
              element={
                <PrivateRoute allowedRoles={["Super Admin", "Warehouse Manager", "Warehouse Worker", "Auditor/Compliance Officer", "Delivery Agent"]}>
                  <EditProfile />
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
