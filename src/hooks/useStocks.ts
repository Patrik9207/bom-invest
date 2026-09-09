import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { MarketData, Sector, Stock } from "@/types/stock";

const STOCK_COLUMNS =
  "id, ticker, yahoo_symbol, nome, razao_social, setor, subsetor, cotacao, variacao, variacao_percentual, pl, p_vpa, dy, valor_mercado, lucro_por_acao, patrimonio_por_acao, abertura, maxima, minima, volume, descricao, status_dados, ultima_consulta, data_atualizacao, mensagem_erro, ativo";

export function useStocks() {
  return useQuery({
    queryKey: ["stocks"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Stock[]> => {
      const { data, error } = await supabase
        .from("stocks")
        .select(STOCK_COLUMNS)
        .eq("ativo", true)
        .order("ticker", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Stock[];
    },
  });
}

export function useStock(ticker: string) {
  return useQuery({
    queryKey: ["stock", ticker],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Stock | null> => {
      const { data, error } = await supabase
        .from("stocks")
        .select(STOCK_COLUMNS)
        .eq("ticker", ticker.toUpperCase())
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as Stock | null;
    },
  });
}

export function useSectors() {
  return useQuery({
    queryKey: ["sectors"],
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<Sector[]> => {
      const { data, error } = await supabase
        .from("sectors")
        .select("id, nome, descricao, ativo")
        .eq("ativo", true)
        .order("nome", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Sector[];
    },
  });
}

export function useMarketData() {
  return useQuery({
    queryKey: ["market-data"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<MarketData | null> => {
      const { data, error } = await supabase
        .from("market_data")
        .select("id, indice, valor, variacao, variacao_percentual, data_atualizacao")
        .eq("indice", "IBOVESPA")
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as MarketData | null;
    },
  });
}
