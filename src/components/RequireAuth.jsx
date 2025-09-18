// components/RequireAuth.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireAuth({ children }) {
  const { token, isLoading } = useAuth();

  if (isLoading) return null;

  return token ? children : <Navigate to="/" replace />;
}
