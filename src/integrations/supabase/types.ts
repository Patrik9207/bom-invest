export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      market_data: {
        Row: {
          data_atualizacao: string | null
          id: string
          indice: string
          valor: number | null
          variacao: number | null
          variacao_percentual: number | null
        }
        Insert: {
          data_atualizacao?: string | null
          id?: string
          indice: string
          valor?: number | null
          variacao?: number | null
          variacao_percentual?: number | null
        }
        Update: {
          data_atualizacao?: string | null
          id?: string
          indice?: string
          valor?: number | null
          variacao?: number | null
          variacao_percentual?: number | null
        }
        Relationships: []
      }
      price_history: {
        Row: {
          abertura: number | null
          created_at: string
          data: string
          fechamento: number | null
          id: string
          maxima: number | null
          minima: number | null
          stock_id: string | null
          ticker: string
          volume: number | null
        }
        Insert: {
          abertura?: number | null
          created_at?: string
          data: string
          fechamento?: number | null
          id?: string
          maxima?: number | null
          minima?: number | null
          stock_id?: string | null
          ticker: string
          volume?: number | null
        }
        Update: {
          abertura?: number | null
          created_at?: string
          data?: string
          fechamento?: number | null
          id?: string
          maxima?: number | null
          minima?: number | null
          stock_id?: string | null
          ticker?: string
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "price_history_stock_id_fkey"
            columns: ["stock_id"]
            isOneToOne: false
            referencedRelation: "stocks"
            referencedColumns: ["id"]
          },
        ]
      }
      sectors: {
        Row: {
          ativo: boolean
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      stocks: {
        Row: {
          abertura: number | null
          ativo: boolean
          cotacao: number | null
          created_at: string
          data_atualizacao: string | null
          descricao: string | null
          dy: number | null
          id: string
          lucro_por_acao: number | null
          maxima: number | null
          mensagem_erro: string | null
          minima: number | null
          nome: string
          p_vpa: number | null
          patrimonio_por_acao: number | null
          pl: number | null
          razao_social: string | null
          setor: string | null
          status_dados: string
          subsetor: string | null
          ticker: string
          ultima_consulta: string | null
          updated_at: string
          valor_mercado: number | null
          variacao: number | null
          variacao_percentual: number | null
          volume: number | null
          yahoo_symbol: string
        }
        Insert: {
          abertura?: number | null
          ativo?: boolean
          cotacao?: number | null
          created_at?: string
          data_atualizacao?: string | null
          descricao?: string | null
          dy?: number | null
          id?: string
          lucro_por_acao?: number | null
          maxima?: number | null
          mensagem_erro?: string | null
          minima?: number | null
          nome: string
          p_vpa?: number | null
          patrimonio_por_acao?: number | null
          pl?: number | null
          razao_social?: string | null
          setor?: string | null
          status_dados?: string
          subsetor?: string | null
          ticker: string
          ultima_consulta?: string | null
          updated_at?: string
          valor_mercado?: number | null
          variacao?: number | null
          variacao_percentual?: number | null
          volume?: number | null
          yahoo_symbol: string
        }
        Update: {
          abertura?: number | null
          ativo?: boolean
          cotacao?: number | null
          created_at?: string
          data_atualizacao?: string | null
          descricao?: string | null
          dy?: number | null
          id?: string
          lucro_por_acao?: number | null
          maxima?: number | null
          mensagem_erro?: string | null
          minima?: number | null
          nome?: string
          p_vpa?: number | null
          patrimonio_por_acao?: number | null
          pl?: number | null
          razao_social?: string | null
          setor?: string | null
          status_dados?: string
          subsetor?: string | null
          ticker?: string
          ultima_consulta?: string | null
          updated_at?: string
          valor_mercado?: number | null
          variacao?: number | null
          variacao_percentual?: number | null
          volume?: number | null
          yahoo_symbol?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
