// Integração com Supabase para dados reais
import { supabase } from './supabase';
import { Cliente, Servico, Produto, Atendimento, MetricasDashboard } from './types';

// ==================== FUNÇÕES DE LEITURA ====================

export const getClientes = async (): Promise<Cliente[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }

  return (data || []).map(c => ({
    id: c.id,
    nome: c.nome,
    telefone: c.telefone,
    email: c.email || undefined,
    dataCadastro: c.data_cadastro,
    ultimoAtendimento: c.ultimo_atendimento || undefined,
    totalGasto: Number(c.total_gasto),
    quantidadeAtendimentos: c.quantidade_atendimentos,
  }));
};

export const getServicos = async (): Promise<Servico[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('servicos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar serviços:', error);
    return [];
  }

  return (data || []).map(s => ({
    id: s.id,
    nome: s.nome,
    precoBase: Number(s.preco_base),
    duracaoMedia: s.duracao_media,
    categoria: s.categoria,
  }));
};

export const getProdutos = async (): Promise<Produto[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }

  return (data || []).map(p => ({
    id: p.id,
    nome: p.nome,
    categoria: p.categoria,
    custoUnitario: Number(p.custo_unitario),
    unidadeMedida: p.unidade_medida,
    estoqueAtual: Number(p.estoque_atual),
    estoqueMinimo: Number(p.estoque_minimo),
  }));
};

export const getAtendimentos = async (): Promise<Atendimento[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('atendimentos')
    .select(`
      *,
      produtos_usados (
        produto_id,
        quantidade,
        custo_total
      )
    `)
    .eq('user_id', user.id)
    .order('data', { ascending: false });

  if (error) {
    console.error('Erro ao buscar atendimentos:', error);
    return [];
  }

  return (data || []).map(a => ({
    id: a.id,
    clienteId: a.cliente_id,
    servicoId: a.servico_id,
    data: a.data,
    valorCobrado: Number(a.valor_cobrado),
    formaPagamento: a.forma_pagamento,
    produtosUsados: (a.produtos_usados || []).map((pu: { produto_id: string; quantidade: number; custo_total: number }) => ({
      produtoId: pu.produto_id,
      quantidade: Number(pu.quantidade),
      custoTotal: Number(pu.custo_total),
    })),
    custoMaterial: Number(a.custo_material),
    lucro: Number(a.lucro),
    observacoes: a.observacoes || undefined,
  }));
};

// ==================== FUNÇÕES CRUD - CLIENTES ====================

export const salvarCliente = async (cliente: Omit<Cliente, 'id' | 'dataCadastro' | 'totalGasto' | 'quantidadeAtendimentos'>): Promise<Cliente | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('clientes')
    .insert({
      user_id: user.id,
      nome: cliente.nome,
      telefone: cliente.telefone,
      email: cliente.email || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar cliente:', error);
    return null;
  }

  return {
    id: data.id,
    nome: data.nome,
    telefone: data.telefone,
    email: data.email || undefined,
    dataCadastro: data.data_cadastro,
    ultimoAtendimento: data.ultimo_atendimento || undefined,
    totalGasto: Number(data.total_gasto),
    quantidadeAtendimentos: data.quantidade_atendimentos,
  };
};

export const atualizarCliente = async (id: string, dados: Partial<Cliente>): Promise<void> => {
  const updateData: Record<string, string | number | null | undefined> = {};
  if (dados.nome) updateData.nome = dados.nome;
  if (dados.telefone) updateData.telefone = dados.telefone;
  if (dados.email !== undefined) updateData.email = dados.email || null;
  if (dados.ultimoAtendimento) updateData.ultimo_atendimento = dados.ultimoAtendimento;
  if (dados.totalGasto !== undefined) updateData.total_gasto = dados.totalGasto;
  if (dados.quantidadeAtendimentos !== undefined) updateData.quantidade_atendimentos = dados.quantidadeAtendimentos;

  const { error } = await supabase
    .from('clientes')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar cliente:', error);
  }
};

export const deletarCliente = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar cliente:', error);
  }
};

// ==================== FUNÇÕES CRUD - SERVIÇOS ====================

export const salvarServico = async (servico: Omit<Servico, 'id'>): Promise<Servico | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('servicos')
    .insert({
      user_id: user.id,
      nome: servico.nome,
      preco_base: servico.precoBase,
      duracao_media: servico.duracaoMedia,
      categoria: servico.categoria,
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar serviço:', error);
    return null;
  }

  return {
    id: data.id,
    nome: data.nome,
    precoBase: Number(data.preco_base),
    duracaoMedia: data.duracao_media,
    categoria: data.categoria,
  };
};

export const atualizarServico = async (id: string, dados: Partial<Servico>): Promise<void> => {
  const updateData: Record<string, string | number> = {};
  if (dados.nome) updateData.nome = dados.nome;
  if (dados.precoBase !== undefined) updateData.preco_base = dados.precoBase;
  if (dados.duracaoMedia !== undefined) updateData.duracao_media = dados.duracaoMedia;
  if (dados.categoria) updateData.categoria = dados.categoria;

  const { error } = await supabase
    .from('servicos')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar serviço:', error);
  }
};

export const deletarServico = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('servicos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar serviço:', error);
  }
};

// ==================== FUNÇÕES CRUD - PRODUTOS ====================

export const salvarProduto = async (produto: Omit<Produto, 'id'>): Promise<Produto | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('produtos')
    .insert({
      user_id: user.id,
      nome: produto.nome,
      categoria: produto.categoria,
      custo_unitario: produto.custoUnitario,
      unidade_medida: produto.unidadeMedida,
      estoque_atual: produto.estoqueAtual,
      estoque_minimo: produto.estoqueMinimo,
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar produto:', error);
    return null;
  }

  return {
    id: data.id,
    nome: data.nome,
    categoria: data.categoria,
    custoUnitario: Number(data.custo_unitario),
    unidadeMedida: data.unidade_medida,
    estoqueAtual: Number(data.estoque_atual),
    estoqueMinimo: Number(data.estoque_minimo),
  };
};

export const atualizarProduto = async (id: string, dados: Partial<Produto>): Promise<void> => {
  const updateData: Record<string, string | number> = {};
  if (dados.nome) updateData.nome = dados.nome;
  if (dados.categoria) updateData.categoria = dados.categoria;
  if (dados.custoUnitario !== undefined) updateData.custo_unitario = dados.custoUnitario;
  if (dados.unidadeMedida) updateData.unidade_medida = dados.unidadeMedida;
  if (dados.estoqueAtual !== undefined) updateData.estoque_atual = dados.estoqueAtual;
  if (dados.estoqueMinimo !== undefined) updateData.estoque_minimo = dados.estoqueMinimo;

  const { error } = await supabase
    .from('produtos')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar produto:', error);
  }
};

export const deletarProduto = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('produtos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar produto:', error);
  }
};

export const atualizarEstoque = async (id: string, quantidade: number): Promise<void> => {
  const { data: produto } = await supabase
    .from('produtos')
    .select('estoque_atual')
    .eq('id', id)
    .single();

  if (produto) {
    const novoEstoque = Number(produto.estoque_atual) + quantidade;
    await supabase
      .from('produtos')
      .update({ estoque_atual: novoEstoque })
      .eq('id', id);
  }
};

// ==================== FUNÇÕES CRUD - ATENDIMENTOS ====================

export const salvarAtendimento = async (atendimento: Omit<Atendimento, 'id'>): Promise<Atendimento | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Inserir atendimento
  const { data: atendimentoData, error: atendimentoError } = await supabase
    .from('atendimentos')
    .insert({
      user_id: user.id,
      cliente_id: atendimento.clienteId,
      servico_id: atendimento.servicoId,
      data: atendimento.data,
      valor_cobrado: atendimento.valorCobrado,
      forma_pagamento: atendimento.formaPagamento,
      custo_material: atendimento.custoMaterial,
      lucro: atendimento.lucro,
      observacoes: atendimento.observacoes || null,
    })
    .select()
    .single();

  if (atendimentoError || !atendimentoData) {
    console.error('Erro ao salvar atendimento:', atendimentoError);
    return null;
  }

  // Inserir produtos usados
  if (atendimento.produtosUsados.length > 0) {
    const produtosUsadosData = atendimento.produtosUsados.map(pu => ({
      atendimento_id: atendimentoData.id,
      produto_id: pu.produtoId,
      quantidade: pu.quantidade,
      custo_total: pu.custoTotal,
    }));

    await supabase.from('produtos_usados').insert(produtosUsadosData);

    // Atualizar estoque dos produtos
    for (const pu of atendimento.produtosUsados) {
      await atualizarEstoque(pu.produtoId, -pu.quantidade);
    }
  }

  // Atualizar dados do cliente
  const { data: cliente } = await supabase
    .from('clientes')
    .select('total_gasto, quantidade_atendimentos')
    .eq('id', atendimento.clienteId)
    .single();

  if (cliente) {
    await supabase
      .from('clientes')
      .update({
        total_gasto: Number(cliente.total_gasto) + atendimento.valorCobrado,
        quantidade_atendimentos: cliente.quantidade_atendimentos + 1,
        ultimo_atendimento: atendimento.data.split('T')[0],
      })
      .eq('id', atendimento.clienteId);
  }

  return {
    id: atendimentoData.id,
    clienteId: atendimentoData.cliente_id,
    servicoId: atendimentoData.servico_id,
    data: atendimentoData.data,
    valorCobrado: Number(atendimentoData.valor_cobrado),
    formaPagamento: atendimentoData.forma_pagamento,
    produtosUsados: atendimento.produtosUsados,
    custoMaterial: Number(atendimentoData.custo_material),
    lucro: Number(atendimentoData.lucro),
    observacoes: atendimentoData.observacoes || undefined,
  };
};

export const atualizarAtendimento = async (id: string, dados: Partial<Atendimento>): Promise<void> => {
  const updateData: Record<string, string | number | null | undefined> = {};
  if (dados.clienteId) updateData.cliente_id = dados.clienteId;
  if (dados.servicoId) updateData.servico_id = dados.servicoId;
  if (dados.data) updateData.data = dados.data;
  if (dados.valorCobrado !== undefined) updateData.valor_cobrado = dados.valorCobrado;
  if (dados.formaPagamento) updateData.forma_pagamento = dados.formaPagamento;
  if (dados.custoMaterial !== undefined) updateData.custo_material = dados.custoMaterial;
  if (dados.lucro !== undefined) updateData.lucro = dados.lucro;
  if (dados.observacoes !== undefined) updateData.observacoes = dados.observacoes || null;

  const { error } = await supabase
    .from('atendimentos')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar atendimento:', error);
  }
};

export const deletarAtendimento = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('atendimentos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar atendimento:', error);
  }
};

// ==================== MÉTRICAS E RELATÓRIOS ====================

export const calcularMetricas = async (): Promise<MetricasDashboard> => {
  const atendimentos = await getAtendimentos();
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - hoje.getDay());
  
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  
  const atendimentosHoje = atendimentos.filter(a => {
    const dataAtend = new Date(a.data);
    dataAtend.setHours(0, 0, 0, 0);
    return dataAtend.getTime() === hoje.getTime();
  });
  
  const atendimentosSemana = atendimentos.filter(a => new Date(a.data) >= inicioSemana);
  const atendimentosMes = atendimentos.filter(a => new Date(a.data) >= inicioMes);
  
  const faturamentoDiario = atendimentosHoje.reduce((sum, a) => sum + a.valorCobrado, 0);
  const faturamentoSemanal = atendimentosSemana.reduce((sum, a) => sum + a.valorCobrado, 0);
  const faturamentoMensal = atendimentosMes.reduce((sum, a) => sum + a.valorCobrado, 0);
  const gastosMateriais = atendimentosMes.reduce((sum, a) => sum + a.custoMaterial, 0);
  const lucroTotal = atendimentosMes.reduce((sum, a) => sum + a.lucro, 0);
  
  const ticketMedio = atendimentosMes.length > 0 ? faturamentoMensal / atendimentosMes.length : 0;
  const metaMensal = 5000;
  const progressoMeta = (faturamentoMensal / metaMensal) * 100;
  
  return {
    faturamentoDiario,
    faturamentoSemanal,
    faturamentoMensal,
    gastosMateriais,
    lucroTotal,
    ticketMedio,
    atendimentosHoje: atendimentosHoje.length,
    atendimentosMes: atendimentosMes.length,
    metaMensal,
    progressoMeta: Math.min(progressoMeta, 100)
  };
};

export const getDadosGraficoSemanal = async () => {
  const atendimentos = await getAtendimentos();
  const hoje = new Date();
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  const dados = diasSemana.map((dia, index) => {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() - hoje.getDay() + index);
    data.setHours(0, 0, 0, 0);
    
    const atendimentosDia = atendimentos.filter(a => {
      const dataAtend = new Date(a.data);
      dataAtend.setHours(0, 0, 0, 0);
      return dataAtend.getTime() === data.getTime();
    });
    
    const faturamento = atendimentosDia.reduce((sum, a) => sum + a.valorCobrado, 0);
    const lucro = atendimentosDia.reduce((sum, a) => sum + a.lucro, 0);
    
    return { dia, faturamento, lucro };
  });
  
  return dados;
};

export const getServicosPopulares = async () => {
  const atendimentos = await getAtendimentos();
  const servicos = await getServicos();
  
  const contagem = atendimentos.reduce((acc, a) => {
    acc[a.servicoId] = (acc[a.servicoId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return servicos
    .map(s => ({
      nome: s.nome,
      quantidade: contagem[s.id] || 0
    }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 4);
};

export const getProdutosBaixoEstoque = async () => {
  const produtos = await getProdutos();
  return produtos.filter(p => p.estoqueAtual <= p.estoqueMinimo);
};

export const getTopClientes = async () => {
  const clientes = await getClientes();
  return clientes
    .sort((a, b) => b.totalGasto - a.totalGasto)
    .slice(0, 5);
};
