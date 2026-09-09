import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, LineChart, Layers } from "lucide-react";

import { DataNotice } from "@/components/site/DataNotice";
import { StockSearch } from "@/components/site/StockSearch";
import { StocksTable } from "@/components/site/StocksTable";
import { useMarketData, useStocks } from "@/hooks/useStocks";
import { formatNumber, formatPercent, variationClass } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bom Invest — Cotações e indicadores das ações da B3" },
      {
        name: "description",
        content:
          "Consulte cotação, P/L, P/VPA e Dividend Yield das ações brasileiras em uma plataforma simples e objetiva.",
      },
      { property: "og:title", content: "Bom Invest — Informação para investir melhor" },
      {
        property: "og:description",
        content: "Cotações e indicadores fundamentalistas das ações brasileiras da B3.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: stocks, isLoading } = useStocks();
  const { data: mercado } = useMarketData();

  const lista = stocks ?? [];
  const destaques = lista
    .filter((s) => s.cotacao !== null)
    .sort((a, b) => (b.valor_mercado ?? 0) - (a.valor_mercado ?? 0))
    .slice(0, 10);

  const ultimaAtualizacao =
    lista
      .map((s) => s.data_atualizacao)
      .filter(Boolean)
      .sort()
      .at(-1) ?? mercado?.data_atualizacao ?? null;

  return (
    <div>
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <h1 className="max-w-2xl font-display text-3xl font-semibold leading-tight md:text-5xl">
            Encontre boas empresas para investir.
          </h1>
          <p className="mt-4 max-w-xl text-sm text-primary-foreground/75 md:text-base">
            Consulte cotações e indicadores fundamentalistas das ações brasileiras.
          </p>
          <div className="mt-8 max-w-2xl">
            <StockSearch size="lg" />
            <p className="mt-3 text-xs text-primary-foreground/60">Exemplo: PETR4</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <LineChart className="h-4 w-4" /> Ibovespa
            </div>
            <p className="num mt-3 font-display text-2xl font-semibold">
              {mercado?.valor !== null && mercado?.valor !== undefined
                ? formatNumber(mercado.valor, 0)
                : "N/A"}
            </p>
            <p className={cn("num mt-1 text-sm", variationClass(mercado?.variacao_percentual))}>
              {formatPercent(mercado?.variacao_percentual, true)}
            </p>
          </article>

          <article className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <BarChart3 className="h-4 w-4" /> Ações acompanhadas
            </div>
            <p className="num mt-3 font-display text-2xl font-semibold">{lista.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">Lista oficial do Bom Invest</p>
          </article>

          <article className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <Layers className="h-4 w-4" /> Atualização
            </div>
            <p className="mt-3 text-sm">
              <DataNotice atualizadoEm={ultimaAtualizacao} />
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold">Ações em destaque</h2>
            <p className="text-sm text-muted-foreground">
              Maiores empresas da lista por valor de mercado.
            </p>
          </div>
          <Link
            to="/acoes"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Ver todas as ações <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Carregando ações...
          </div>
        ) : destaques.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Dados temporariamente indisponíveis.
          </div>
        ) : (
          <StocksTable stocks={destaques} paginar={false} />
        )}
      </section>
    </div>
  );
}
