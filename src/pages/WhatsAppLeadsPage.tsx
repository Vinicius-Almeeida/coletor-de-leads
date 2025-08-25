import React, { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import { API_ENDPOINTS } from "../config";

interface WhatsAppLead {
  segmento: string;
  empresa: string;
  whatsapp: string;
  telefone: string;
  email: string;
  site: string;
  endereco: string;
  linkedin: string;
  facebook: string;
}

interface WhatsAppData {
  total_whatsapp_leads: number;
  leads: WhatsAppLead[];
}

const WhatsAppLeadsPage: React.FC = () => {
  const [whatsappData, setWhatsappData] = useState<WhatsAppData>(() => {
    // Carregar dados salvos do localStorage
    const saved = localStorage.getItem("whatsappData");
    return saved
      ? JSON.parse(saved)
      : {
          total_whatsapp_leads: 0,
          leads: [],
        };
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWhatsAppLeads();
  }, []);

  const loadWhatsAppLeads = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.WHATSAPP_LEADS);
      const data = await response.json();
      setWhatsappData(data);

      // Salvar dados no localStorage
      localStorage.setItem("whatsappData", JSON.stringify(data));
    } catch (error) {
      console.error("Erro ao carregar leads com WhatsApp:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadWhatsAppLeads = () => {
    window.location.href = API_ENDPOINTS.DOWNLOAD_WHATSAPP;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            📞 WhatsApp Leads
          </h2>
          <p className="text-gray-600">Leads que possuem números de WhatsApp</p>
        </div>

        {/* Card de Estatísticas */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Leads com WhatsApp
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {whatsappData.total_whatsapp_leads}
                </p>
              </div>
            </div>

            {whatsappData.total_whatsapp_leads > 0 && (
              <button
                onClick={downloadWhatsAppLeads}
                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
              >
                📥 Download Excel
              </button>
            )}
          </div>
        </div>

        {/* Lista de Leads */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              📋 Lista de Leads com WhatsApp
            </h3>
          </div>

          {whatsappData.total_whatsapp_leads === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500">
                Nenhum lead com WhatsApp encontrado
              </p>
              <p className="text-sm text-gray-400">
                Faça uma busca primeiro para encontrar leads com WhatsApp
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Segmento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      WhatsApp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Website
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {whatsappData.leads.map((lead, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {lead.empresa || "Não informado"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.segmento || "Não informado"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.whatsapp ? (
                          <a
                            href={`https://wa.me/${lead.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            {lead.whatsapp}
                          </a>
                        ) : (
                          "Não informado"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.telefone || "Não informado"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.email || "Não informado"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.site ? (
                          <a
                            href={lead.site}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {lead.site}
                          </a>
                        ) : (
                          "Não informado"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppLeadsPage;
