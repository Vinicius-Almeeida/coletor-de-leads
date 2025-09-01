import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, token } = useAuth();

  // Se o token ainda está sendo carregado do localStorage, podemos mostrar um loader
  // Para simplificar, vamos assumir que se não há token, não está autenticado.

  if (!isAuthenticated) {
    // Redireciona o usuário para a página de login se não estiver autenticado
    return <Navigate to="/login" replace />;
  }

  // Se estiver autenticado, renderiza a página que a rota está protegendo
  return <Outlet />;
};

export default ProtectedRoute;
