import React, { useState } from "react";
import Navigation from "../components/Navigation";
import { API_ENDPOINTS } from "../config";

interface SearchStatus {
  running: boolean;
  phase: string;
  progress: number;
  total: number;
  found: number;
  current_item: string;
  elapsed_time: number;
  results: any[];
}

const SearchPage: React.FC = () => {
  const [nicho, setNicho] = useState("");
  const [cidade, setCidade] = useState("");
  const [searchStatus, setSearchStatus] = useState<SearchStatus>({
    running: false,
    phase: "",
    progress: 0,
    total: 0,
    found: 0,
    current_item: "",
    elapsed_time: 0,
    results: [],
  });
  const [isSearching, setIsSearching] = useState(false);

  const startSearch = async () => {
    if (!nicho || !cidade) {
      alert("Por favor, preencha o nicho e a cidade");
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(API_ENDPOINTS.SEARCH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nicho, cidade }),
      });

      if (response.ok) {
        // Iniciar polling do status
        pollStatus();
      } else {
        alert("Erro ao iniciar busca");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao iniciar busca");
    }
  };

  const stopSearch = async () => {
    try {
      await fetch(API_ENDPOINTS.STOP, {
        method: "POST",
      });
      setIsSearching(false);
    } catch (error) {
      console.error("Erro ao parar busca:", error);
    }
  };

  const pollStatus = async () => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(API_ENDPOINTS.STATUS);
        const status = await response.json();
        setSearchStatus(status);

        if (!status.running) {
          setIsSearching(false);
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Erro ao buscar status:", error);
        clearInterval(interval);
      }
    }, 1000);
  };

  const downloadResults = () => {
    window.location.href = API_ENDPOINTS.DOWNLOAD;
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            🔍 Nova Busca de Leads
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nicho/Setor
              </label>
              <input
                type="text"
                value={nicho}
                onChange={(e) => setNicho(e.target.value)}
                placeholder="Ex: rolamentos, informática, construção"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cidade
              </label>
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Ex: São Paulo, Rio de Janeiro"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={startSearch}
              disabled={isSearching}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? "🔍 Buscando..." : "🚀 Iniciar Busca"}
            </button>

            {isSearching && (
              <button
                onClick={stopSearch}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
              >
                ⏹️ Parar Busca
              </button>
            )}
          </div>
        </div>

        {/* Status da Busca */}
        {searchStatus.phase && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📊 Status da Busca
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fase:</span>
                <span className="font-medium">{searchStatus.phase}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Progresso:</span>
                <span className="font-medium">{searchStatus.progress}%</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${searchStatus.progress}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Encontrados:</span>
                <span className="font-medium text-green-600">
                  {searchStatus.found} leads
                </span>
              </div>

              {searchStatus.current_item && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Processando:</span>
                  <span className="font-medium text-sm">
                    {searchStatus.current_item}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resultados */}
        {searchStatus.results.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                📋 Resultados ({searchStatus.results.length})
              </h3>

              <button
                onClick={downloadResults}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                📥 Download Excel
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      WhatsApp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searchStatus.results.map((result, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {result.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.telefone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.whatsapp ? (
                          <a
                            href={`https://wa.me/${result.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800"
                          >
                            {result.whatsapp}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
