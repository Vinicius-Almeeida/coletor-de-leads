import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SearchPage from "./pages/SearchPage";
import DashboardPage from "./pages/DashboardPage";
import WhatsAppLeadsPage from "./pages/WhatsAppLeadsPage";
import LeadsDashboardPage from "./pages/LeadsDashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Routes>
            {/* === ROTAS PÚBLICAS === */}
            {/* Todos podem acessar o login e o registro */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* === ROTAS PROTEGIDAS === */}
            {/* Apenas usuários logados podem acessar o que estiver aqui dentro */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<SearchPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/whatsapp-leads" element={<WhatsAppLeadsPage />} />
              <Route path="/dashboard-leads" element={<LeadsDashboardPage />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
