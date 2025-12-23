import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Pages
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import HouseDetails from "./pages/HouseDetails";
import RentFormPage from "./pages/RentFormPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/rent/:token" element={<RentFormPage />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/house/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <HouseDetails />
                </ProtectedRoute>
              }
            />

            {/* Default Redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
