'use client';

import { useState, useEffect } from 'react';
import { getProdutos, salvarProduto, atualizarProduto, deletarProduto } from '@/lib/db';
import { Produto } from '@/lib/types';
import { Plus, Edit2, Trash2, Package, AlertTriangle, TrendingUp, X } from 'lucide-react';

const categorias = [
  { value: 'gel', label: 'Gel' },
  { value: 'tips', label: 'Tips' },
  { value: 'lixa', label: 'Lixa' },
  { value: 'primer', label: 'Primer' },
  { value: 'esmalte', label: 'Esmalte' },
  { value: 'removedor', label: 'Removedor' },
  { value: 'outros', label: 'Outros' }
];

const unidades = [
  { value: 'ml', label: 'ml' },
  { value: 'g', label: 'g' },
  { value: 'unidade', label: 'unidade' }
];

export function ProdutosTab() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    categoria: 'gel' as Produto['categoria'],
    custoUnitario: '',
    unidadeMedida: 'ml' as Produto['unidadeMedida'],
    estoqueAtual: '',
    estoqueMinimo: ''
  });

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = () => {
    setProdutos(getProdutos());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dados = {
      nome: formData.nome,
      categoria: formData.categoria,
      custoUnitario: parseFloat(formData.custoUnitario),
      unidadeMedida: formData.unidadeMedida,
      estoqueAtual: parseFloat(formData.estoqueAtual),
      estoqueMinimo: parseFloat(formData.estoqueMinimo)
    };

    if (editingProduto) {
      atualizarProduto(editingProduto.id, dados);
    } else {
      salvarProduto(dados);
    }
    
    carregarProdutos();
    fecharModal();
  };

  const handleEditar = (produto: Produto) => {
    setEditingProduto(produto);
    setFormData({
      nome: produto.nome,
      categoria: produto.categoria,
      custoUnitario: produto.custoUnitario.toString(),
      unidadeMedida: produto.unidadeMedida,
      estoqueAtual: produto.estoqueAtual.toString(),
      estoqueMinimo: produto.estoqueMinimo.toString()
    });
    setShowModal(true);
  };

  const handleDeletar = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      deletarProduto(id);
      carregarProdutos();
    }
  };

  const fecharModal = () => {
    setShowModal(false);
    setEditingProduto(null);
    setFormData({ 
      nome: '', 
      categoria: 'gel', 
      custoUnitario: '', 
      unidadeMedida: 'ml', 
      estoqueAtual: '', 
      estoqueMinimo: '' 
    });
  };

  const produtosBaixoEstoque = produtos.filter(p => p.estoqueAtual <= p.estoqueMinimo);
  const valorTotalEstoque = produtos.reduce((sum, p) => sum + (p.custoUnitario * p.estoqueAtual), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600 mt-1">Controle seu estoque e custos de materiais</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <p className="text-blue-100 text-sm mb-1">Total de Produtos</p>
          <p className="text-3xl font-bold">{produtos.length}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white">
          <p className="text-amber-100 text-sm mb-1">Alertas de Estoque</p>
          <p className="text-3xl font-bold">{produtosBaixoEstoque.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <p className="text-green-100 text-sm mb-1">Valor em Estoque</p>
          <p className="text-3xl font-bold">R$ {valorTotalEstoque.toFixed(0)}</p>
        </div>
      </div>

      {/* Alertas de Estoque Baixo */}
      {produtosBaixoEstoque.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-amber-900">Produtos com Estoque Baixo</h3>
          </div>
          <div className="space-y-2">
            {produtosBaixoEstoque.map(produto => (
              <div key={produto.id} className="flex justify-between items-center text-sm">
                <span className="text-amber-800">{produto.nome}</span>
                <span className="font-semibold text-amber-900">
                  {produto.estoqueAtual} {produto.unidadeMedida} (mín: {produto.estoqueMinimo})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {produtos.map(produto => {
          const estoqueBaixo = produto.estoqueAtual <= produto.estoqueMinimo;
          const percentualEstoque = (produto.estoqueAtual / produto.estoqueMinimo) * 100;
          
          return (
            <div key={produto.id} className={`bg-white rounded-xl p-6 border ${estoqueBaixo ? 'border-amber-300 bg-amber-50/30' : 'border-gray-100'} shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${estoqueBaixo ? 'bg-amber-500' : 'bg-gradient-to-br from-blue-400 to-indigo-500'} rounded-xl flex items-center justify-center text-white`}>
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{produto.nome}</h3>
                    <p className="text-xs text-gray-500 capitalize">{produto.categoria}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditar(produto)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletar(produto.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Custo Unitário</span>
                  <span className="font-semibold text-gray-900">R$ {produto.custoUnitario.toFixed(2)}/{produto.unidadeMedida}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Estoque Atual</span>
                    <span className={`font-bold ${estoqueBaixo ? 'text-amber-600' : 'text-green-600'}`}>
                      {produto.estoqueAtual} {produto.unidadeMedida}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        percentualEstoque > 100 ? 'bg-green-500' :
                        percentualEstoque > 50 ? 'bg-blue-500' :
                        percentualEstoque > 25 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(percentualEstoque, 100)}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Mínimo: {produto.estoqueMinimo}</span>
                    {estoqueBaixo && (
                      <span className="text-amber-600 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Repor!
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Valor Total</span>
                    <span className="font-bold text-green-600">
                      R$ {(produto.custoUnitario * produto.estoqueAtual).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProduto ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button onClick={fecharModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Gel UV"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    required
                    value={formData.categoria}
                    onChange={e => setFormData({ ...formData, categoria: e.target.value as Produto['categoria'] })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    {categorias.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unidade *
                  </label>
                  <select
                    required
                    value={formData.unidadeMedida}
                    onChange={e => setFormData({ ...formData, unidadeMedida: e.target.value as Produto['unidadeMedida'] })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    {unidades.map(un => (
                      <option key={un.value} value={un.value}>{un.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custo Unitário (R$) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.custoUnitario}
                  onChange={e => setFormData({ ...formData, custoUnitario: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="45.00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estoque Atual *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.estoqueAtual}
                    onChange={e => setFormData({ ...formData, estoqueAtual: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="250"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estoque Mínimo *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.estoqueMinimo}
                    onChange={e => setFormData({ ...formData, estoqueMinimo: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="50"
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
                  {editingProduto ? 'Salvar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
