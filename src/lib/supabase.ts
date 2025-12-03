import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para o banco de dados
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          nome: string;
          telefone: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          nome: string;
          telefone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          nome?: string;
          telefone?: string | null;
          created_at?: string;
        };
      };
      clientes: {
        Row: {
          id: string;
          user_id: string;
          nome: string;
          telefone: string;
          email: string | null;
          data_cadastro: string;
          ultimo_atendimento: string | null;
          total_gasto: number;
          quantidade_atendimentos: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nome: string;
          telefone: string;
          email?: string | null;
          data_cadastro?: string;
          ultimo_atendimento?: string | null;
          total_gasto?: number;
          quantidade_atendimentos?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          nome?: string;
          telefone?: string;
          email?: string | null;
          data_cadastro?: string;
          ultimo_atendimento?: string | null;
          total_gasto?: number;
          quantidade_atendimentos?: number;
          created_at?: string;
        };
      };
      servicos: {
        Row: {
          id: string;
          user_id: string;
          nome: string;
          preco_base: number;
          duracao_media: number;
          categoria: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nome: string;
          preco_base: number;
          duracao_media: number;
          categoria: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          nome?: string;
          preco_base?: number;
          duracao_media?: number;
          categoria?: string;
          created_at?: string;
        };
      };
      produtos: {
        Row: {
          id: string;
          user_id: string;
          nome: string;
          categoria: string;
          custo_unitario: number;
          unidade_medida: string;
          estoque_atual: number;
          estoque_minimo: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nome: string;
          categoria: string;
          custo_unitario: number;
          unidade_medida: string;
          estoque_atual: number;
          estoque_minimo: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          nome?: string;
          categoria?: string;
          custo_unitario?: number;
          unidade_medida?: string;
          estoque_atual?: number;
          estoque_minimo?: number;
          created_at?: string;
        };
      };
      atendimentos: {
        Row: {
          id: string;
          user_id: string;
          cliente_id: string;
          servico_id: string;
          data: string;
          valor_cobrado: number;
          forma_pagamento: string;
          custo_material: number;
          lucro: number;
          observacoes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          cliente_id: string;
          servico_id: string;
          data: string;
          valor_cobrado: number;
          forma_pagamento: string;
          custo_material: number;
          lucro: number;
          observacoes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          cliente_id?: string;
          servico_id?: string;
          data?: string;
          valor_cobrado?: number;
          forma_pagamento?: string;
          custo_material?: number;
          lucro?: number;
          observacoes?: string | null;
          created_at?: string;
        };
      };
      produtos_usados: {
        Row: {
          id: string;
          atendimento_id: string;
          produto_id: string;
          quantidade: number;
          custo_total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          atendimento_id: string;
          produto_id: string;
          quantidade: number;
          custo_total: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          atendimento_id?: string;
          produto_id?: string;
          quantidade?: number;
          custo_total?: number;
          created_at?: string;
        };
      };
    };
  };
};
