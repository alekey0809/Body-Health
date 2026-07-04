import React, { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage/HomePage";
import LoginPage from "../pages/LoginPage/LoginPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import DashboardPage from "../pages/DashboardPage/DashboardPage";
import Navbar from "../components/Navbar/Navbar";
import { AuthContext } from "../context/AuthContext";

// Componente para proteger rutas privadas
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Cargando...</div>;
  return user ? children : <Navigate to="/login" replace />;
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
        
        {/* Rutas Privadas (Solo logueados) */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />

        {/* Ruta por defecto */}
        <Route path="/*" element={<Navigate to="/main" replace />} />
      </Routes>
    </>
  );
};

export default AppRouter;