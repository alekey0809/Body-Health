import jwt from 'jsonwebtoken';

// Middleware para verificar que la petición contenga un JWT válido
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      ok: false,
      message: 'Acceso no autorizado. Se requiere un token de autenticación válido.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro_development');
    req.user = {
      ...decoded,
      u_id: decoded.u_id || decoded.id,
      id: decoded.id || decoded.u_id,
      rol: decoded.rol ?? decoded.u_r_id,
      u_r_id: decoded.u_r_id ?? decoded.rol
    };
    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: 'Token de autenticación inválido o expirado.',
      error: error.message
    });
  }
};

// Middleware para verificar que el usuario autenticado sea Administrador (u_r_id === 1 o rol === 1 o 'admin')
export const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      ok: false,
      message: 'Usuario no autenticado.'
    });
  }

  const userRole = req.user.rol ?? req.user.u_r_id;
  const isAdmin = userRole === 1 || Number(userRole) === 1 || String(userRole).toLowerCase() === 'admin' || String(userRole).toLowerCase() === 'administrador';

  if (!isAdmin) {
    return res.status(403).json({
      ok: false,
      message: 'Acceso denegado. Esta operación está reservada exclusivamente para Administradores del sistema.'
    });
  }

  next();
};
