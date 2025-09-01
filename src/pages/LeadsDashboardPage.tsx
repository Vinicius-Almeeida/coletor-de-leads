import React, { useState, useEffect } from "react";
import Navigation from "../components/Navigation";

// Componente do logo oficial do WhatsApp
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    className={`w-4 h-4 ${className}`}
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
  </svg>
);

// Define a "forma" de um objeto Lead, para usarmos com TypeScript
interface Lead {
  id: number;
  nome: string;
  nicho: string | null;
  telefone: string | null;
  email: string | null;
  whatsapp: string | null;
  site: string | null;
  // Adicione outros campos que desejar exibir
}

const LeadsDashboardPage: React.FC = () => {
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [niches, setNiches] = useState<string[]>([]);
  const [activeNiche, setActiveNiche] = useState<string>("Todos");
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Efeito para buscar os dados da API quando a página carrega
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        setError(null);
        // ATENÇÃO: Use a URL do seu backend. Para desenvolvimento, é esta:
        const response = await fetch("http://localhost:3001/api/leads");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const leadsData: Lead[] = await response.json();

        setAllLeads(leadsData);

        // Extrai os nichos únicos dos leads para criar as abas
        const uniqueNiches = Array.from(
          new Set(leadsData.map((lead) => lead.nicho).filter((n) => n !== null))
        ) as string[];
        setNiches(["Todos", ...uniqueNiches]);
      } catch (err) {
        setError("Falha ao buscar os leads. O servidor backend está rodando?");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  // Efeito para filtrar os leads quando o usuário clica em uma aba
  useEffect(() => {
    if (activeNiche === "Todos") {
      setFilteredLeads(allLeads);
    } else {
      setFilteredLeads(allLeads.filter((lead) => lead.nicho === activeNiche));
    }
  }, [activeNiche, allLeads]);

  return (
    <div>
      <Navigation />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard de Leads</h1>

        {/* Abas de Nicho */}
        <div className="flex border-b mb-4">
          {niches.map((niche) => (
            <button
              key={niche}
              onClick={() => setActiveNiche(niche)}
              className={`py-2 px-4 -mb-px ${
                activeNiche === niche
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {niche}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div>
          {loading && <p>Carregando leads...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <h2 className="text-xl font-semibold mb-2">
                Mostrando {filteredLeads.length} leads do nicho: {activeNiche}
              </h2>
              <table className="min-w-full bg-white border text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="py-2 px-3 border-b text-left w-1/4">Nome</th>
                    <th className="py-2 px-3 border-b text-left w-1/4">
                      Email
                    </th>
                    <th className="py-2 px-3 border-b text-left w-1/4">
                      WhatsApp
                    </th>
                    <th className="py-2 px-3 border-b text-left w-1/4">Site</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-100">
                      <td className="py-2 px-3 border-b truncate max-w-0">
                        <div className="truncate" title={lead.nome}>
                          {lead.nome}
                        </div>
                      </td>
                      <td className="py-2 px-3 border-b truncate max-w-0">
                        <div className="truncate" title={lead.email || "-"}>
                          {lead.email || "-"}
                        </div>
                      </td>
                      <td className="py-2 px-3 border-b truncate max-w-0">
                        {lead.whatsapp ? (
                          <a
                            href={`https://wa.me/${lead.whatsapp.replace(
                              /\D/g,
                              ""
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800 hover:underline font-medium whitespace-nowrap flex items-center gap-1"
                            title="Abrir conversa no WhatsApp"
                          >
                            <WhatsAppIcon className="text-green-600" />
                            {lead.whatsapp}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-2 px-3 border-b truncate max-w-0">
                        <a
                          href={lead.site || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline truncate block"
                          title={lead.site || "-"}
                        >
                          {lead.site || "-"}
                        </a>
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

export default LeadsDashboardPage;
