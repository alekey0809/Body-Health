import React, { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage/HomePage";
import LoginPage from "../pages/LoginPage/LoginPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import DashboardPage from "../pages/DashboardPage/DashboardPage";
import AdminDashboardPage from "../pages/AdminDashboardPage/AdminDashboardPage";
import CheckoutPage from "../pages/CheckoutPage/CheckoutPage";
import PaymentConfirmationPage from "../pages/PaymentConfirmationPage/PaymentConfirmationPage";
import Navbar from "../components/Navbar/Navbar";
import { AuthContext } from "../context/AuthContext";

// Componente para proteger rutas privadas generales (ej. Dashboard)
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Cargando...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

// Componente para proteger rutas de Administrador
const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Cargando...</div>;
  // Solo permitir si el rol es mayor a 1 (ej. idRol 2 = Admin)
  // Ajustar la lógica del rol según cómo venga de la BD (asumiendo idRol === 2 para admin)
  return (user && user.idRol === 2) ? children : <Navigate to="/dashboard" replace />;
};

// Componente para evitar que usuarios logueados vean login/registro
const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Cargando...</div>;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

const AppRouter = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/main" element={<HomePage />} />
        
        {/* Rutas Públicas (Solo no logueados) */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        
        {/* Rutas de Flujo de Compra (Públicas y Privadas) */}
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment-confirmation" element={<PaymentConfirmationPage />} />

        {/* Rutas Privadas (Solo logueados) */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        
        {/* Rutas Privadas de Administrador */}
        <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />

        {/* Ruta por defecto */}
        <Route path="/*" element={<Navigate to="/main" replace />} />
      </Routes>
    </>
  );
};

export default AppRouter;