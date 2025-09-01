import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Tipagem para os dados que esperamos da API
interface Segmento {
  segmento: string;
  total: number;
}

interface DashboardData {
  total_leads: number;
  total_segments: number;
  segments: Segmento[];
  total_searches: number;
}

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Usamos a variável de ambiente para a URL da API
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        const response = await axios.get<DashboardData>(`${apiUrl}/api/dashboard-data`);
        setData(response.data);
      } catch (err) {
        setError('Falha ao carregar os dados do dashboard.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-4">Carregando dados do dashboard...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total de Leads</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{data?.total_leads || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Segmentos Distintos</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{data?.total_segments || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total de Buscas</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{data?.total_searches || 0}</p>
        </div>
      </div>

      {/* Tabela de Segmentos */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Leads por Segmento</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segmento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total de Leads</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.segments && data.segments.length > 0 ? (
                data.segments.map((seg) => (
                  <tr key={seg.segmento}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{seg.segmento}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{seg.total}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">Nenhum segmento encontrado. Faça uma busca para ver os dados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
