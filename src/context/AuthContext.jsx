import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = 'https://script.google.com/macros/s/AKfycbyohjcQ8j16bTV97q2axzQnwgxtFISBS6Jsx0SSZwaRyUrO3X0QYR2TXuwiQIkbPK3hqQ/exec';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('efcp_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}?type=users`);
      const users = await response.json();
      
      console.log("Usuarios cargados:", users.length);

      // Buscamos ignorando espacios y siendo flexibles con los nombres de las columnas
      const foundUser = users.find(u => {
        const dbUser = String(u.Usuario || u.usuario || "").trim();
        const dbPass = String(u.Contraseña || u.password || u.contraseña || "").trim();
        
        return dbUser === String(username).trim() && dbPass === String(password).trim();
      });

      if (foundUser) {
        const userData = { 
          username: foundUser.Usuario || foundUser.usuario, 
          role: foundUser.Rol || foundUser.rol, 
          name: foundUser.Nombre || foundUser.nombre 
        };
        setUser(userData);
        localStorage.setItem('efcp_user', JSON.stringify(userData));
        return true;
      }
      
      // Admin de respaldo
      if (username === 'admin' && password === 'admin123') {
        const adminUser = { username: 'admin', role: 'Master', name: 'Admin Temporal' };
        setUser(adminUser);
        localStorage.setItem('efcp_user', JSON.stringify(adminUser));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      // Permitir admin incluso sin conexión para pruebas
      if (username === 'admin' && password === 'admin123') {
        const adminUser = { username: 'admin', role: 'Master', name: 'Admin (Offline)' };
        setUser(adminUser);
        return true;
      }
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('efcp_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
