'use client';

import { useState, useEffect } from 'react';
import { getAtendimentos, getClientes, getServicos, getProdutos, salvarAtendimento, deletarAtendimento } from '@/lib/db';
import { Atendimento, Cliente, Servico, Produto, ProdutoUsado } from '@/lib/types';
import { Plus, Trash2, Calendar, DollarSign, CreditCard, Package, X, User, Sparkles } from 'lucide-react';

const formasPagamento = [
  { value: 'dinheiro', label: 'Dinheiro', icon: '💵' },
  { value: 'pix', label: 'PIX', icon: '📱' },
  { value: 'cartao_debito', label: 'Cartão Débito', icon: '💳' },
  { value: 'cartao_credito', label: 'Cartão Crédito', icon: '💳' }
];

export function AtendimentosTab() {
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    clienteId: '',
    servicoId: '',
    data: new Date().toISOString().slice(0, 16),
    valorCobrado: '',
    formaPagamento: 'pix' as Atendimento['formaPagamento'],
    observacoes: ''
  });

  const [produtosUsados, setProdutosUsados] = useState<Array<{ produtoId: string; quantidade: string }>>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    setAtendimentos(getAtendimentos().sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()));
    setClientes(getClientes());
    setServicos(getServicos());
    setProdutos(getProdutos());
  };

  const adicionarProduto = () => {
    setProdutosUsados([...produtosUsados, { produtoId: '', quantidade: '' }]);
  };

  const removerProduto = (index: number) => {
    setProdutosUsados(produtosUsados.filter((_, i) => i !== index));
  };

  const atualizarProduto = (index: number, campo: 'produtoId' | 'quantidade', valor: string) => {
    const novos = [...produtosUsados];
    novos[index][campo] = valor;
    setProdutosUsados(novos);
  };

  const calcularCustoMaterial = (): number => {
    return produtosUsados.reduce((total, pu) => {
      if (!pu.produtoId || !pu.quantidade) return total;
      const produto = produtos.find(p => p.id === pu.produtoId);
      if (!produto) return total;
      return total + (produto.custoUnitario * parseFloat(pu.quantidade));
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const custoMaterial = calcularCustoMaterial();
    const valorCobrado = parseFloat(formData.valorCobrado);
    const lucro = valorCobrado - custoMaterial;

    const produtosFormatados: ProdutoUsado[] = produtosUsados
      .filter(pu => pu.produtoId && pu.quantidade)
      .map(pu => {
        const produto = produtos.find(p => p.id === pu.produtoId)!;
        const quantidade = parseFloat(pu.quantidade);
        return {
          produtoId: pu.produtoId,
          quantidade,
          custoTotal: produto.custoUnitario * quantidade
        };
      });

    const novoAtendimento = {
      clienteId: formData.clienteId,
      servicoId: formData.servicoId,
      data: formData.data,
      valorCobrado,
      formaPagamento: formData.formaPagamento,
      produtosUsados: produtosFormatados,
      custoMaterial,
      lucro,
      observacoes: formData.observacoes
    };

    salvarAtendimento(novoAtendimento);
    carregarDados();
    fecharModal();
  };

  const handleDeletar = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este atendimento?')) {
      deletarAtendimento(id);
      carregarDados();
    }
  };

  const fecharModal = () => {
    setShowModal(false);
    setFormData({
      clienteId: '',
      servicoId: '',
      data: new Date().toISOString().slice(0, 16),
      valorCobrado: '',
      formaPagamento: 'pix',
      observacoes: ''
    });
    setProdutosUsados([]);
  };

  const abrirModal = () => {
    // Pré-selecionar primeiro cliente e serviço se existirem
    if (clientes.length > 0 && !formData.clienteId) {
      setFormData(prev => ({ ...prev, clienteId: clientes[0].id }));
    }
    if (servicos.length > 0 && !formData.servicoId) {
      const servico = servicos[0];
      setFormData(prev => ({ 
        ...prev, 
        servicoId: servico.id,
        valorCobrado: servico.precoBase.toString()
      }));
    }
    setShowModal(true);
  };

  const handleServicoChange = (servicoId: string) => {
    const servico = servicos.find(s => s.id === servicoId);
    setFormData({
      ...formData,
      servicoId,
      valorCobrado: servico ? servico.precoBase.toString() : ''
    });
  };

  const totalAtendimentos = atendimentos.length;
  const faturamentoTotal = atendimentos.reduce((sum, a) => sum + a.valorCobrado, 0);
  const lucroTotal = atendimentos.reduce((sum, a) => sum + a.lucro, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Atendimentos</h1>
          <p className="text-gray-600 mt-1">Registre e acompanhe todos os seus atendimentos</p>
        </div>
        <button
          onClick={abrirModal}
          className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Novo Atendimento
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <p className="text-blue-100 text-sm mb-1">Total de Atendimentos</p>
          <p className="text-3xl font-bold">{totalAtendimentos}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <p className="text-green-100 text-sm mb-1">Faturamento Total</p>
          <p className="text-3xl font-bold">R$ {faturamentoTotal.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
          <p className="text-purple-100 text-sm mb-1">Lucro Total</p>
          <p className="text-3xl font-bold">R$ {lucroTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Lista de Atendimentos */}
      <div className="space-y-4">
        {atendimentos.map(atendimento => {
          const cliente = clientes.find(c => c.id === atendimento.clienteId);
          const servico = servicos.find(s => s.id === atendimento.servicoId);
          const formaPag = formasPagamento.find(f => f.value === atendimento.formaPagamento);
          
          return (
            <div key={atendimento.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {cliente?.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{cliente?.nome}</h3>
                          <p className="text-sm text-gray-500">{servico?.nome}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletar(atendimento.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{new Date(atendimento.data).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-lg">{formaPag?.icon}</span>
                      <span className="text-sm">{formaPag?.label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 font-semibold">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">R$ {atendimento.valorCobrado.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-600 font-semibold">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm">Lucro: R$ {atendimento.lucro.toFixed(2)}</span>
                    </div>
                  </div>

                  {atendimento.produtosUsados.length > 0 && (
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Package className="w-4 h-4" />
                        <span className="text-sm font-medium">Produtos Utilizados:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {atendimento.produtosUsados.map((pu, idx) => {
                          const produto = produtos.find(p => p.id === pu.produtoId);
                          return (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                              {produto?.nome} ({pu.quantidade} {produto?.unidadeMedida})
                            </span>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Custo de material: R$ {atendimento.custoMaterial.toFixed(2)}
                      </p>
                    </div>
                  )}

                  {atendimento.observacoes && (
                    <p className="text-sm text-gray-600 italic pt-2 border-t border-gray-100">
                      {atendimento.observacoes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {atendimentos.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum atendimento registrado</h3>
            <p className="text-gray-600 mb-4">Comece registrando seu primeiro atendimento</p>
            <button
              onClick={abrirModal}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Novo Atendimento
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Novo Atendimento</h2>
              <button onClick={fecharModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cliente e Serviço */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cliente *
                  </label>
                  <select
                    required
                    value={formData.clienteId}
                    onChange={e => setFormData({ ...formData, clienteId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serviço *
                  </label>
                  <select
                    required
                    value={formData.servicoId}
                    onChange={e => handleServicoChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Selecione um serviço</option>
                    {servicos.map(servico => (
                      <option key={servico.id} value={servico.id}>
                        {servico.nome} - R$ {servico.precoBase.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Data, Valor e Forma de Pagamento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data e Hora *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.data}
                    onChange={e => setFormData({ ...formData, data: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor Cobrado (R$) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.valorCobrado}
                    onChange={e => setFormData({ ...formData, valorCobrado: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="150.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forma de Pagamento *
                  </label>
                  <select
                    required
                    value={formData.formaPagamento}
                    onChange={e => setFormData({ ...formData, formaPagamento: e.target.value as Atendimento['formaPagamento'] })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    {formasPagamento.map(forma => (
                      <option key={forma.value} value={forma.value}>
                        {forma.icon} {forma.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Produtos Usados */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Produtos Utilizados
                  </label>
                  <button
                    type="button"
                    onClick={adicionarProduto}
                    className="text-sm text-pink-600 hover:text-pink-700 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Produto
                  </button>
                </div>

                <div className="space-y-3">
                  {produtosUsados.map((pu, index) => (
                    <div key={index} className="flex gap-3">
                      <select
                        value={pu.produtoId}
                        onChange={e => atualizarProduto(index, 'produtoId', e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      >
                        <option value="">Selecione um produto</option>
                        {produtos.map(produto => (
                          <option key={produto.id} value={produto.id}>
                            {produto.nome} - R$ {produto.custoUnitario.toFixed(2)}/{produto.unidadeMedida}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={pu.quantidade}
                        onChange={e => atualizarProduto(index, 'quantidade', e.target.value)}
                        placeholder="Qtd"
                        className="w-24 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => removerProduto(index)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                {produtosUsados.length > 0 && (
                  <div className="mt-3 p-4 bg-purple-50 rounded-xl">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Custo de Material:</span>
                      <span className="font-bold text-purple-600">R$ {calcularCustoMaterial().toFixed(2)}</span>
                    </div>
                    {formData.valorCobrado && (
                      <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-purple-200">
                        <span className="text-gray-700">Lucro Estimado:</span>
                        <span className="font-bold text-green-600">
                          R$ {(parseFloat(formData.valorCobrado) - calcularCustoMaterial()).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Detalhes do atendimento..."
                  rows={3}
                />
              </div>

              {/* Botões */}
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
                  Registrar Atendimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
