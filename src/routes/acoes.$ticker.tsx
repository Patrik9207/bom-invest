import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DataNotice } from "@/components/site/DataNotice";
import { useStock } from "@/hooks/useStocks";
import {
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
  formatPercent,
  formatRatio,
  formatShortDate,
  formatSignedCurrency,
  formatVolume,
  variationClass,
} from "@/lib/format";
import { fetchPriceHistory } from "@/lib/stocks.functions";
import { cn } from "@/lib/utils";
import type { Periodo } from "@/types/stock";

export const Route = createFileRoute("/acoes/$ticker")({
  head: ({ params }) => {
    const ticker = params.ticker?.toUpperCase() ?? "Ação";
    return {
      meta: [
        { title: `${ticker} — cotação e indicadores | Bom Invest` },
        {
          name: "description",
          content: `Cotação, variação, P/L, P/VPA, Dividend Yield e histórico de preços de ${ticker} na B3.`,
        },
        { property: "og:title", content: `${ticker} — cotação e indicadores | Bom Invest` },
        {
          property: "og:description",
          content: `Acompanhe ${ticker}: cotação atual, variação e indicadores fundamentalistas.`,
        },
      ],
    };
  },
  component: AcaoPage,
});

const PERIODOS: Periodo[] = ["1M", "6M", "1A", "5A", "MAX"];

function AcaoPage() {
  const { ticker } = Route.useParams();
  const tickerNormalizado = ticker.toUpperCase();
  const { data: stock, isLoading } = useStock(tickerNormalizado);
  const [periodo, setPeriodo] = useState<Periodo>("6M");

  const buscarHistorico = useServerFn(fetchPriceHistory);
  const historico = useQuery({
    queryKey: ["history", tickerNormalizado, periodo],
    staleTime: 10 * 60 * 1000,
    queryFn: () => buscarHistorico({ data: { ticker: tickerNormalizado, periodo } }),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-muted-foreground">
        Carregando dados da ação...
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold">Ação não encontrada.</h1>
        <Link to="/acoes" className="mt-4 inline-block text-sm text-primary hover:underline">
          Ver todas as ações
        </Link>
      </div>
    );
  }

  const semDados = stock.status_dados !== "ATIVO" || stock.cotacao === null;
  const pontos = historico.data?.pontos ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to="/acoes"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Ações
      </Link>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-6 border-b border-border pb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">{stock.ticker}</h1>
          <p className="mt-1 text-base text-foreground/80">{stock.nome}</p>
          <p className="mt-1 text-sm text-muted-foreground">{stock.setor ?? "Setor não informado"}</p>
        </div>
        <div className="text-right">
          <p className="num font-display text-3xl font-semibold">{formatCurrency(stock.cotacao)}</p>
          <p className={cn("num mt-1 text-sm", variationClass(stock.variacao_percentual))}>
            {formatSignedCurrency(stock.variacao)} ({formatPercent(stock.variacao_percentual, true)})
          </p>
        </div>
      </header>

      {semDados && (
        <p className="mt-4 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
          Dados temporariamente indisponíveis para este ativo.
        </p>
      )}

      <div className="mt-4">
        <DataNotice atualizadoEm={stock.data_atualizacao} />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Cotação", valor: formatCurrency(stock.cotacao) },
          { label: "P/L", valor: formatNumber(stock.pl) },
          { label: "P/VPA", valor: formatRatio(stock.p_vpa) },
          { label: "Dividend Yield", valor: formatPercent(stock.dy) },
        ].map((card) => (
          <article key={card.label} className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.label}</p>
            <p className="num mt-2 font-display text-xl font-semibold">{card.valor}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">Histórico de preços</h2>
          <div className="flex flex-wrap gap-1">
            {PERIODOS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriodo(p)}
                className={cn(
                  "rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary",
                  periodo === p && "border-primary bg-primary text-primary-foreground hover:bg-primary",
                )}
              >
                {p === "MAX" ? "Máx." : p}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 h-[320px]">
          {historico.isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Carregando gráfico...
            </div>
          ) : pontos.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Dados temporariamente indisponíveis.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pontos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradPreco" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="data"
                  tickFormatter={formatShortDate}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={32}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  width={64}
                  tickFormatter={(v: number) => formatNumber(v)}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    fontSize: 12,
                  }}
                  labelFormatter={(label: string) => formatShortDate(label)}
                  formatter={(value: number) => [formatCurrency(value), "Fechamento"]}
                />
                <Area
                  type="monotone"
                  dataKey="fechamento"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#gradPreco)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card shadow-card">
          <h2 className="border-b border-border px-5 py-4 font-display text-lg font-semibold">
            Indicadores Fundamentalistas
          </h2>
          <table className="w-full text-sm">
            <tbody>
              {[
                ["P/L", formatNumber(stock.pl)],
                ["P/VPA", formatRatio(stock.p_vpa)],
                ["Dividend Yield", formatPercent(stock.dy)],
                ["Valor de Mercado", formatCompactCurrency(stock.valor_mercado)],
                ["Lucro por Ação", formatCurrency(stock.lucro_por_acao)],
                ["Patrimônio por Ação", formatCurrency(stock.patrimonio_por_acao)],
              ].map(([label, valor]) => (
                <tr key={label} className="border-b border-border/60 last:border-0">
                  <th scope="row" className="px-5 py-3 text-left font-normal text-muted-foreground">
                    {label}
                  </th>
                  <td className="num px-5 py-3 text-right font-medium">{valor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-card">
          <h2 className="border-b border-border px-5 py-4 font-display text-lg font-semibold">
            Cotação do dia
          </h2>
          <table className="w-full text-sm">
            <tbody>
              {[
                ["Abertura", formatCurrency(stock.abertura)],
                ["Máxima", formatCurrency(stock.maxima)],
                ["Mínima", formatCurrency(stock.minima)],
                ["Volume", formatVolume(stock.volume)],
                ["Variação (R$)", formatSignedCurrency(stock.variacao)],
                ["Variação (%)", formatPercent(stock.variacao_percentual, true)],
              ].map(([label, valor]) => (
                <tr key={label} className="border-b border-border/60 last:border-0">
                  <th scope="row" className="px-5 py-3 text-left font-normal text-muted-foreground">
                    {label}
                  </th>
                  <td className="num px-5 py-3 text-right font-medium">{valor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {stock.descricao && (
        <section className="mt-8 rounded-xl border border-border bg-surface p-6">
          <h2 className="font-display text-lg font-semibold">Sobre a empresa</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{stock.descricao}</p>
        </section>
      )}
    </div>
  );
}
