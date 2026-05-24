import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../../Services/authService';

interface Props { children: React.ReactNode; }

/**
 * Protege rotas administrativas.
 * Se não autenticado → redireciona para /login preservando a rota atual como `from`.
 */
const PrivateRoute: React.FC<Props> = ({ children }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
