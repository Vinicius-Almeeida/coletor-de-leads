// Configuração da API
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const API_ENDPOINTS = {
  SEARCH: `${API_BASE_URL}/api/search`,
  STATUS: `${API_BASE_URL}/api/status`,
  STOP: `${API_BASE_URL}/api/stop`,
  DASHBOARD: `${API_BASE_URL}/api/dashboard-data`,
  WHATSAPP_LEADS: `${API_BASE_URL}/api/whatsapp-leads`,
  DOWNLOAD_WHATSAPP: `${API_BASE_URL}/api/download-whatsapp-leads`,
  DOWNLOAD: `${API_BASE_URL}/api/download`,
  HEALTH: `${API_BASE_URL}/api/health`,
};
