'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Sparkles } from 'lucide-react';

interface GraficoSemanalProps {
  dados: Array<{ dia: string; valor: number }>;
}

export function GraficoSemanal({ dados }: GraficoSemanalProps) {
  const maxValor = Math.max(...dados.map(d => d.valor));

  return (
    <Card className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-pink-200 dark:border-pink-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <TrendingUp className="w-5 h-5 text-pink-500" />
          Faturamento Semanal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {dados.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{item.dia}</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  R$ {item.valor.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(item.valor / maxValor) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface GraficoServicosProps {
  dados: Array<{ nome: string; quantidade: number; cor: string }>;
}

export function GraficoServicos({ dados }: GraficoServicosProps) {
  const total = dados.reduce((acc, s) => acc + s.quantidade, 0);

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 border-purple-200 dark:border-purple-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Serviços Mais Populares
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dados.map((servico, index) => {
            const percentual = ((servico.quantidade / total) * 100).toFixed(1);
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {servico.nome}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {servico.quantidade} ({percentual}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${percentual}%`,
                      backgroundColor: servico.cor,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface TopClientesProps {
  clientes: Array<{ nome: string; total: number; atendimentos: number }>;
}

export function TopClientes({ clientes }: TopClientesProps) {
  return (
    <Card className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-gray-800 dark:to-gray-900 border-rose-200 dark:border-rose-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <Users className="w-5 h-5 text-rose-500" />
          Top 5 Clientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clientes.map((cliente, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {cliente.nome}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {cliente.atendimentos} atendimentos
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-rose-600 dark:text-rose-400">
                  R$ {cliente.total.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
