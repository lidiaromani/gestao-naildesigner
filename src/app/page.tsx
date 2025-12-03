'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/custom/navigation';
import { DashboardCards, ProgressoMeta, AlertasEstoque } from '@/components/custom/dashboard-cards';
import { GraficoSemanal, GraficoServicos, TopClientes } from '@/components/custom/charts';
import { AtendimentosTab } from '@/components/custom/atendimentos-tab';
import { ClientesTab } from '@/components/custom/clientes-tab';
import { ServicosTab } from '@/components/custom/servicos-tab';
import { ProdutosTab } from '@/components/custom/produtos-tab';
import { calcularMetricas, getDadosGraficoSemanal, getServicosPopulares, getProdutosBaixoEstoque, getTopClientes } from '@/lib/db';
import { Calendar, TrendingUp } from 'lucide-react';
import type { MetricasDashboard, Produto, Cliente } from '@/lib/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metricas, setMetricas] = useState<MetricasDashboard>({
    faturamentoDiario: 0,
    faturamentoSemanal: 0,
    faturamentoMensal: 0,
    gastosMateriais: 0,
    lucroTotal: 0,
    ticketMedio: 0,
    atendimentosHoje: 0,
    atendimentosMes: 0,
    metaMensal: 5000,
    progressoMeta: 0
  });
  const [dadosGrafico, setDadosGrafico] = useState<Array<{ dia: string; faturamento: number; lucro: number }>>([]);
  const [servicosPopulares, setServicosPopulares] = useState<Array<{ nome: string; quantidade: number }>>([]);
  const [produtosBaixos, setProdutosBaixos] = useState<Produto[]>([]);
  const [topClientes, setTopClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      try {
        const [metricasData, graficoData, servicosData, produtosData, clientesData] = await Promise.all([
          calcularMetricas(),
          getDadosGraficoSemanal(),
          getServicosPopulares(),
          getProdutosBaixoEstoque(),
          getTopClientes()
        ]);

        setMetricas(metricasData);
        setDadosGrafico(graficoData);
        setServicosPopulares(servicosData);
        setProdutosBaixos(produtosData);
        setTopClientes(clientesData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [activeTab]);

  const renderContent = () => {
    if (loading && activeTab === 'dashboard') {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Cards de Métricas */}
            <DashboardCards metricas={metricas} />

            {/* Resumo Rápido */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6" />
                  <h3 className="text-lg font-semibold">Hoje</h3>
                </div>
                <p className="text-3xl font-bold mb-2">R$ {metricas.faturamentoDiario.toFixed(2)}</p>
                <p className="text-pink-100">{metricas.atendimentosHoje} atendimentos realizados</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6" />
                  <h3 className="text-lg font-semibold">Esta Semana</h3>
                </div>
                <p className="text-3xl font-bold mb-2">R$ {metricas.faturamentoSemanal.toFixed(2)}</p>
                <p className="text-blue-100">Faturamento acumulado</p>
              </div>
            </div>

            {/* Progresso da Meta e Alertas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProgressoMeta metricas={metricas} />
              <AlertasEstoque produtosBaixos={produtosBaixos} />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GraficoSemanal dados={dadosGrafico} />
              <GraficoServicos dados={servicosPopulares} />
            </div>

            {/* Top Clientes */}
            <TopClientes clientes={topClientes} />
          </div>
        );

      case 'atendimentos':
        return <AtendimentosTab />;

      case 'clientes':
        return <ClientesTab />;

      case 'servicos':
        return <ServicosTab />;

      case 'produtos':
        return <ProdutosTab />;

      case 'insights':
        return (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Insights com IA</h2>
            <p className="text-gray-600 mb-6">Receba sugestões personalizadas para melhorar seus resultados</p>
            <p className="text-sm text-gray-500">Módulo 3 - Em desenvolvimento</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}
