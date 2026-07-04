import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Si tenemos usuario guardado o queremos validar token, aquí iría.
    // Por simplicidad, simularemos la lectura del storage
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (correo, contrasena) => {
    try {
      const response = await api.post('/api/users/login', { correo, contrasena });
      if (response.data.ok) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        navigate('/dashboard');
        return true;
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error.response?.data?.message || 'Error al iniciar sesión';
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/api/users/register', userData);
      if (response.data.ok) {
        navigate('/login');
        return true;
      }
    } catch (error) {
      console.error('Error en registro:', error);
      throw error.response?.data?.message || 'Error al registrar';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
