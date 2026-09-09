import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { PriceHistoryPoint, Periodo } from "@/types/stock";

const periodoSchema = z.enum(["1M", "6M", "1A", "5A", "MAX"]);

async function loadDeps() {
  const [{ supabaseAdmin }, yahoo] = await Promise.all([
    import("@/integrations/supabase/client.server"),
    import("./yahooFinanceService.server"),
  ]);
  return { supabaseAdmin, yahoo };
}

/** Histórico de preços de uma ação (com cache no banco). */
export const fetchPriceHistory = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ ticker: z.string().min(3).max(10), periodo: periodoSchema }).parse(data),
  )
  .handler(async ({ data }): Promise<{ pontos: PriceHistoryPoint[]; erro: string | null }> => {
    const { supabaseAdmin, yahoo } = await loadDeps();
    const ticker = data.ticker.toUpperCase();
    const symbol = yahoo.getYahooSymbol(ticker);

    try {
      const pontos = await yahoo.getPriceHistory(symbol, data.periodo as Periodo);
      if (pontos.length === 0) return { pontos: [], erro: "Dados temporariamente indisponíveis." };

      const { data: stock } = await supabaseAdmin
        .from("stocks")
        .select("id")
        .eq("ticker", ticker)
        .maybeSingle();

      if (stock) {
        const recentes = pontos.slice(-260).map((p) => ({
          stock_id: stock.id,
          ticker,
          data: p.data,
          abertura: p.abertura,
          maxima: p.maxima,
          minima: p.minima,
          fechamento: p.fechamento,
          volume: p.volume,
        }));
        await supabaseAdmin.from("price_history").upsert(recentes, { onConflict: "ticker,data" });
      }

      return { pontos, erro: null };
    } catch (error) {
      console.error("[fetchPriceHistory]", ticker, error);
      const { data: cache } = await supabaseAdmin
        .from("price_history")
        .select("data, abertura, maxima, minima, fechamento, volume")
        .eq("ticker", ticker)
        .order("data", { ascending: true });
      if (cache && cache.length > 0) {
        return { pontos: cache as PriceHistoryPoint[], erro: null };
      }
      return { pontos: [], erro: "Dados temporariamente indisponíveis." };
    }
  });

type UpdateResult = {
  processados: number;
  atualizados: number;
  indisponiveis: number;
  erros: number;
};

async function updateTickers(tickers: string[]): Promise<UpdateResult> {
  const { supabaseAdmin, yahoo } = await loadDeps();
  const result: UpdateResult = { processados: 0, atualizados: 0, indisponiveis: 0, erros: 0 };

  const CHUNK = 6;
  for (let i = 0; i < tickers.length; i += CHUNK) {
    const chunk = tickers.slice(i, i + CHUNK);
    await Promise.all(
      chunk.map(async (ticker) => {
        result.processados += 1;
        const symbol = yahoo.getYahooSymbol(ticker);
        const agora = new Date().toISOString();
        try {
          const quote = await yahoo.getQuote(symbol);
          if (!quote || quote.cotacao === null) {
            result.indisponiveis += 1;
            await supabaseAdmin
              .from("stocks")
              .update({
                status_dados: "INDISPONIVEL",
                ultima_consulta: agora,
                mensagem_erro: `Ticker ${symbol} não encontrado no Yahoo Finance.`,
              })
              .eq("ticker", ticker);
            return;
          }

          const fundamentals = await yahoo.getFundamentals(symbol);

          await supabaseAdmin
            .from("stocks")
            .update({
              cotacao: quote.cotacao,
              variacao: quote.variacao,
              variacao_percentual: quote.variacao_percentual,
              abertura: quote.abertura,
              maxima: quote.maxima,
              minima: quote.minima,
              volume: quote.volume,
              pl: fundamentals?.pl ?? null,
              p_vpa: fundamentals?.p_vpa ?? null,
              dy: fundamentals?.dy ?? null,
              valor_mercado: fundamentals?.valor_mercado ?? null,
              lucro_por_acao: fundamentals?.lucro_por_acao ?? null,
              patrimonio_por_acao: fundamentals?.patrimonio_por_acao ?? null,
              razao_social: fundamentals?.razao_social ?? null,
              descricao: fundamentals?.descricao ?? null,
              status_dados: "ATIVO",
              ultima_consulta: agora,
              data_atualizacao: quote.atualizado_em ?? agora,
              mensagem_erro: null,
            })
            .eq("ticker", ticker);
          result.atualizados += 1;
        } catch (error) {
          result.erros += 1;
          console.error("[updateStocks]", ticker, error);
          await supabaseAdmin
            .from("stocks")
            .update({
              status_dados: "ERRO",
              ultima_consulta: agora,
              mensagem_erro: error instanceof Error ? error.message : "Erro desconhecido",
            })
            .eq("ticker", ticker);
        }
      }),
    );
  }

  return result;
}

async function updateIbovespa() {
  const { supabaseAdmin, yahoo } = await loadDeps();
  try {
    const quote = await yahoo.getIndexQuote("^BVSP");
    if (!quote || quote.cotacao === null) return;
    await supabaseAdmin
      .from("market_data")
      .upsert(
        {
          indice: "IBOVESPA",
          valor: quote.cotacao,
          variacao: quote.variacao,
          variacao_percentual: quote.variacao_percentual,
          data_atualizacao: quote.atualizado_em ?? new Date().toISOString(),
        },
        { onConflict: "indice" },
      );
  } catch (error) {
    console.error("[updateIbovespa]", error);
  }
}

/** Atualiza um lote de ações (as mais desatualizadas primeiro). */
export const updateStocks = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        limite: z.number().int().min(1).max(80).optional(),
        tickers: z.array(z.string()).optional(),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data }): Promise<UpdateResult & { restantes: number }> => {
    const { supabaseAdmin } = await loadDeps();
    const limite = data.limite ?? 40;

    let tickers = data.tickers?.map((t) => t.toUpperCase()) ?? [];
    if (tickers.length === 0) {
      const { data: rows } = await supabaseAdmin
        .from("stocks")
        .select("ticker")
        .eq("ativo", true)
        .order("ultima_consulta", { ascending: true, nullsFirst: true })
        .limit(limite);
      tickers = (rows ?? []).map((r) => r.ticker);
    }

    const result = await updateTickers(tickers);
    await updateIbovespa();

    const { count } = await supabaseAdmin
      .from("stocks")
      .select("ticker", { count: "exact", head: true })
      .is("ultima_consulta", null);

    return { ...result, restantes: count ?? 0 };
  });

/** Resumo operacional para a área administrativa. */
export const getUpdateStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await loadDeps();
  const { data: rows } = await supabaseAdmin
    .from("stocks")
    .select("status_dados, ultima_consulta, ticker, mensagem_erro")
    .order("ultima_consulta", { ascending: false, nullsFirst: false });

  const lista = rows ?? [];
  const contagem = lista.reduce<Record<string, number>>((acc, row) => {
    acc[row.status_dados] = (acc[row.status_dados] ?? 0) + 1;
    return acc;
  }, {});

  return {
    total: lista.length,
    contagem,
    ultimaAtualizacao: lista.find((r) => r.ultima_consulta)?.ultima_consulta ?? null,
    problemas: lista
      .filter((r) => r.status_dados === "INDISPONIVEL" || r.status_dados === "ERRO")
      .slice(0, 40)
      .map((r) => ({ ticker: r.ticker, status: r.status_dados, mensagem: r.mensagem_erro })),
  };
});
