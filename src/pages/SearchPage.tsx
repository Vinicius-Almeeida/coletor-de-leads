import React, { useState, useEffect } from "react";
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
  const [nicho, setNicho] = useState(() => {
    return localStorage.getItem("lastNicho") || "";
  });
  const [cidade, setCidade] = useState(() => {
    return localStorage.getItem("lastCidade") || "";
  });
  const [searchStatus, setSearchStatus] = useState<SearchStatus>(() => {
    // Carregar dados salvos do localStorage
    const saved = localStorage.getItem("searchStatus");
    return saved
      ? JSON.parse(saved)
      : {
          running: false,
          phase: "",
          progress: 0,
          total: 0,
          found: 0,
          current_item: "",
          elapsed_time: 0,
          results: [],
        };
  });
  const [isSearching, setIsSearching] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>("");

  // Carregar dados do backend quando a página carregar
  useEffect(() => {
    const loadBackendData = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.STATUS);
        const status = await response.json();

        // Só atualizar se o backend tiver dados mais recentes
        if (status.results && status.results.length > 0) {
          setSearchStatus(status);
          localStorage.setItem("searchStatus", JSON.stringify(status));
        }
      } catch (error) {
        console.error("Erro ao carregar dados do backend:", error);
      }
    };

    loadBackendData();
  }, []);

  // Limpar inputs quando a página é atualizada (refresh) ou quando sai da página
  useEffect(() => {
    const handleBeforeUnload = () => {
      setNicho("");
      setCidade("");
      localStorage.removeItem("lastNicho");
      localStorage.removeItem("lastCidade");
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setNicho("");
        setCidade("");
        localStorage.removeItem("lastNicho");
        localStorage.removeItem("lastCidade");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const testConnection = async () => {
    setConnectionStatus("Testando conexão...");
    try {
      console.log("🔍 Testando conexão com:", API_ENDPOINTS.TEST);

      const response = await fetch(API_ENDPOINTS.TEST, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Conexão OK:", data);
        setConnectionStatus(
          `✅ Conectado! User-Agent: ${data.user_agent?.substring(0, 50)}...`
        );
      } else {
        const errorText = await response.text();
        console.error("❌ Erro na conexão:", response.status, errorText);
        setConnectionStatus(`❌ Erro ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error("❌ Erro de rede:", error);
      setConnectionStatus(
        `❌ Erro de rede: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    }
  };

  const startSearch = async () => {
    if (!nicho || !cidade) {
      alert("Por favor, preencha o nicho e a cidade");
      return;
    }

    // Salvar nicho e cidade no localStorage
    localStorage.setItem("lastNicho", nicho);
    localStorage.setItem("lastCidade", cidade);

    setIsSearching(true);
    try {
      console.log("🚀 Iniciando busca para:", { nicho, cidade });
      console.log("📡 URL da API:", API_ENDPOINTS.SEARCH);

      const response = await fetch(API_ENDPOINTS.SEARCH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ nicho, cidade }),
      });

      console.log("📊 Status da resposta:", response.status);
      console.log("📊 Headers da resposta:", response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Busca iniciada com sucesso:", data);
        // Iniciar polling do status
        pollStatus();
      } else {
        const errorText = await response.text();
        console.error("❌ Erro na resposta:", response.status, errorText);
        alert(`Erro ao iniciar busca: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("❌ Erro de rede:", error);
      alert(
        `Erro de conexão: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    } finally {
      // Se houver erro, parar o estado de busca
      if (!searchStatus.running) {
        setIsSearching(false);
      }
    }
  };

  const stopSearch = async () => {
    // Confirmação antes de parar
    if (!window.confirm("Tem certeza que deseja parar a busca atual?")) {
      return;
    }

    try {
      console.log("⏹️ Parando busca...");

      const response = await fetch(API_ENDPOINTS.STOP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Busca parada:", data);

        // Atualizar status local
        setSearchStatus((prev) => ({
          ...prev,
          running: false,
          phase: "Busca interrompida pelo usuário",
          progress: 0,
        }));

        setIsSearching(false);

        // Salvar status no localStorage
        localStorage.setItem(
          "searchStatus",
          JSON.stringify({
            ...searchStatus,
            running: false,
            phase: "Busca interrompida pelo usuário",
            progress: 0,
          })
        );
      } else {
        console.error("❌ Erro ao parar busca:", response.status);
        alert("Erro ao parar busca");
      }
    } catch (error) {
      console.error("❌ Erro ao parar busca:", error);
      alert("Erro ao parar busca");
    }
  };

  const pollStatus = async () => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(API_ENDPOINTS.STATUS, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          console.error("❌ Erro ao buscar status:", response.status);
          return;
        }

        const status = await response.json();
        setSearchStatus(status);

        // Salvar status no localStorage
        localStorage.setItem("searchStatus", JSON.stringify(status));

        if (!status.running) {
          setIsSearching(false);
          clearInterval(interval);

          // Limpar inputs quando a busca termina
          if (status.phase === "Busca concluída com sucesso!") {
            setNicho("");
            setCidade("");
            localStorage.removeItem("lastNicho");
            localStorage.removeItem("lastCidade");
          }
        }
      } catch (error) {
        console.error("❌ Erro ao buscar status:", error);
        clearInterval(interval);
        setIsSearching(false);
      }
    }, 2000); // Reduzido para 2 segundos para atualização mais rápida
  };

  const downloadResults = () => {
    window.location.href = API_ENDPOINTS.DOWNLOAD;
  };

  const clearInputs = () => {
    console.log("🧹 Limpando campos de entrada...");
    setNicho("");
    setCidade("");
    localStorage.removeItem("lastNicho");
    localStorage.removeItem("lastCidade");
    console.log("✅ Campos de entrada limpos");
  };

  const clearSearch = () => {
    // Confirmação antes de limpar
    if (
      !window.confirm(
        "Tem certeza que deseja limpar todos os dados da busca? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    console.log("🧹 Limpando dados da busca...");

    // Limpar status da busca
    const emptyStatus = {
      running: false,
      phase: "",
      progress: 0,
      total: 0,
      found: 0,
      current_item: "",
      elapsed_time: 0,
      results: [],
    };

    setSearchStatus(emptyStatus);
    setIsSearching(false);

    // Limpar campos de entrada
    setNicho("");
    setCidade("");

    // Limpar localStorage
    localStorage.removeItem("searchStatus");
    localStorage.removeItem("lastNicho");
    localStorage.removeItem("lastCidade");

    console.log("✅ Dados da busca limpos com sucesso");
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

          {/* Status da Conexão */}
          {connectionStatus && (
            <div className="mb-4 p-3 rounded-md text-sm">
              {connectionStatus.includes("✅") ? (
                <div className="bg-green-100 text-green-800 border border-green-200">
                  {connectionStatus}
                </div>
              ) : connectionStatus.includes("❌") ? (
                <div className="bg-red-100 text-red-800 border border-red-200">
                  {connectionStatus}
                </div>
              ) : (
                <div className="bg-blue-100 text-blue-800 border border-blue-200">
                  {connectionStatus}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              onClick={startSearch}
              disabled={isSearching}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSearching ? "🔍 Buscando..." : "🚀 Iniciar Busca"}
            </button>

            <button
              onClick={testConnection}
              className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors font-medium"
            >
              🔧 Testar Conexão
            </button>

            <button
              onClick={clearInputs}
              className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 transition-colors font-medium"
            >
              🗑️ Limpar Campos
            </button>

            {isSearching && (
              <button
                onClick={stopSearch}
                className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors font-medium shadow-lg"
              >
                ⏹️ Parar Busca
              </button>
            )}

            {(searchStatus.results.length > 0 || searchStatus.phase) && (
              <button
                onClick={clearSearch}
                className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 transition-colors font-medium"
              >
                🧹 Limpar Tudo
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

              <div className="flex space-x-2">
                <button
                  onClick={downloadResults}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  📥 Download Excel
                </button>

                <button
                  onClick={clearSearch}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  🧹 Limpar Tudo
                </button>
              </div>
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
