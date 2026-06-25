import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage/HomePage";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/main" element={<HomePage />} />


      {/* Ruta para redirigir en caso de no encontrar el dominio */}
      <Route path="/*" element={<Navigate to="/main" replace />} />
    </Routes>
  );
};

export default AppRouter;