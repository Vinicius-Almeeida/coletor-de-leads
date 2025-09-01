import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SearchPage from "./pages/SearchPage";
import DashboardPage from "./pages/DashboardPage";
import WhatsAppLeadsPage from "./pages/WhatsAppLeadsPage";
import LeadsDashboardPage from "./pages/LeadsDashboardPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/whatsapp-leads" element={<WhatsAppLeadsPage />} />
          <Route path="/dashboard-leads" element={<LeadsDashboardPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
