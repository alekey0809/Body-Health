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

import PlansCatalogPage from "../pages/PlansCatalogPage/PlansCatalogPage";
import EditProfilePage from "../pages/EditProfilePage/EditProfilePage";

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
  // Permitir acceso solo si u_r_id === 1 (Administrador)
  return (user && user.u_r_id === 1) ? children : <Navigate to="/dashboard" replace />;
};

// Componente para evitar que usuarios logueados vean login/registro
const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Cargando...</div>;
  if (!user) return children;
  // Si ya tiene sesión activa, redirigir según su rol
  return <Navigate to={user.u_r_id === 1 ? '/admin' : '/dashboard'} replace />;
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
        <Route path="/planes" element={<PlansCatalogPage />} />
    
        {/* Rutas Privadas (Solo logueados) */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/perfil" element={<PrivateRoute><EditProfilePage /></PrivateRoute>} />
        
        {/* Rutas Privadas de Administrador */}
        <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />

        {/* Ruta por defecto */}
        <Route path="/*" element={<Navigate to="/main" replace />} />
      </Routes>
    </>
  );
};

export default AppRouter;