'use client';

import { useState, useEffect } from 'react';
import { getServicos, salvarServico, atualizarServico, deletarServico } from '@/lib/db';
import { Servico } from '@/lib/types';
import { Plus, Edit2, Trash2, Clock, DollarSign, X, Sparkles } from 'lucide-react';

const categorias = [
  { value: 'alongamento', label: 'Alongamento' },
  { value: 'manutencao', label: 'Manutenção' },
  { value: 'esmaltacao', label: 'Esmaltação' },
  { value: 'decoracao', label: 'Decoração' },
  { value: 'outros', label: 'Outros' }
];

const categoriaCores = {
  alongamento: 'from-pink-500 to-rose-500',
  manutencao: 'from-blue-500 to-cyan-500',
  esmaltacao: 'from-purple-500 to-indigo-500',
  decoracao: 'from-amber-500 to-orange-500',
  outros: 'from-gray-500 to-slate-500'
};

export function ServicosTab() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    precoBase: '',
    duracaoMedia: '',
    categoria: 'alongamento' as Servico['categoria']
  });

  useEffect(() => {
    carregarServicos();
  }, []);

  const carregarServicos = () => {
    setServicos(getServicos());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dados = {
      nome: formData.nome,
      descricao: formData.descricao,
      precoBase: parseFloat(formData.precoBase),
      duracaoMedia: parseInt(formData.duracaoMedia),
      categoria: formData.categoria
    };

    if (editingServico) {
      atualizarServico(editingServico.id, dados);
    } else {
      salvarServico(dados);
    }
    
    carregarServicos();
    fecharModal();
  };

  const handleEditar = (servico: Servico) => {
    setEditingServico(servico);
    setFormData({
      nome: servico.nome,
      descricao: servico.descricao || '',
      precoBase: servico.precoBase.toString(),
      duracaoMedia: servico.duracaoMedia.toString(),
      categoria: servico.categoria
    });
    setShowModal(true);
  };

  const handleDeletar = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      deletarServico(id);
      carregarServicos();
    }
  };

  const fecharModal = () => {
    setShowModal(false);
    setEditingServico(null);
    setFormData({ nome: '', descricao: '', precoBase: '', duracaoMedia: '', categoria: 'alongamento' });
  };

  const totalServicos = servicos.length;
  const precoMedio = servicos.length > 0 
    ? servicos.reduce((sum, s) => sum + s.precoBase, 0) / servicos.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Serviços</h1>
          <p className="text-gray-600 mt-1">Configure seus serviços e preços</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Novo Serviço
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl p-6 text-white">
          <p className="text-pink-100 text-sm mb-1">Total de Serviços</p>
          <p className="text-3xl font-bold">{totalServicos}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
          <p className="text-purple-100 text-sm mb-1">Preço Médio</p>
          <p className="text-3xl font-bold">R$ {precoMedio.toFixed(2)}</p>
        </div>
      </div>

      {/* Lista de Serviços */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servicos.map(servico => (
          <div key={servico.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`px-3 py-1 bg-gradient-to-r ${categoriaCores[servico.categoria]} text-white text-xs font-semibold rounded-full`}>
                {categorias.find(c => c.value === servico.categoria)?.label}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditar(servico)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletar(servico.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="font-bold text-lg text-gray-900 mb-2">{servico.nome}</h3>
            {servico.descricao && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{servico.descricao}</p>
            )}

            <div className="space-y-2 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{servico.duracaoMedia} min</span>
                </div>
                <div className="flex items-center gap-1 text-green-600 font-bold text-lg">
                  <DollarSign className="w-5 h-5" />
                  <span>{servico.precoBase.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingServico ? 'Editar Serviço' : 'Novo Serviço'}
              </h2>
              <button onClick={fecharModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Serviço *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Alongamento em Gel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Descrição do serviço..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  required
                  value={formData.categoria}
                  onChange={e => setFormData({ ...formData, categoria: e.target.value as Servico['categoria'] })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {categorias.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.precoBase}
                    onChange={e => setFormData({ ...formData, precoBase: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="150.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duração (min) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.duracaoMedia}
                    onChange={e => setFormData({ ...formData, duracaoMedia: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="120"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  {editingServico ? 'Salvar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
