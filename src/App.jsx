import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import UserForm from './pages/UserForm';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/CLASIFICACION-DE-APLICACIONES">
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <HomeRedirect />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['Master']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/form" element={
            <ProtectedRoute allowedRoles={['User', 'Master']}>
              <UserForm />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

const HomeRedirect = () => {
  const { user } = useAuth();
  if (user.role === 'Master') return <Navigate to="/admin" />;
  return <Navigate to="/form" />;
};

export default App;
