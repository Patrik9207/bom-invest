import { createFileRoute, Link } from "@tanstack/react-router";

import { DataNotice } from "@/components/site/DataNotice";
import { useStocks } from "@/hooks/useStocks";
import { formatCurrency, formatNumber, formatPercent, formatRatio } from "@/lib/format";
import type { Stock } from "@/types/stock";

export const Route = createFileRoute("/rankings")({
  head: () => ({
    meta: [
      { title: "Rankings de ações — Bom Invest" },
      {
        name: "description",
        content:
          "Rankings das ações brasileiras por maior Dividend Yield, menor P/L e menor P/VPA, com dados do mercado.",
      },
      { property: "og:title", content: "Rankings de ações — Bom Invest" },
      {
        property: "og:description",
        content: "Maior Dividend Yield, menor P/L e menor P/VPA entre as ações acompanhadas.",
      },
    ],
  }),
  component: RankingsPage,
});

function valido(valor: number | null | undefined): valor is number {
  return valor !== null && valor !== undefined && Number.isFinite(valor) && valor > 0;
}

function RankingTable({ titulo, descricao, stocks }: { titulo: string; descricao: string; stocks: Stock[] }) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-card">
      <header className="border-b border-border px-5 py-4">
        <h2 className="font-display text-lg font-semibold">{titulo}</h2>
        <p className="text-sm text-muted-foreground">{descricao}</p>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Ticker</th>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">Setor</th>
              <th className="px-4 py-3 text-right">Cotação</th>
              <th className="px-4 py-3 text-right">P/L</th>
              <th className="px-4 py-3 text-right">P/VPA</th>
              <th className="px-4 py-3 text-right">DY</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((s, i) => (
              <tr key={s.ticker} className="border-b border-border/60 last:border-0 hover:bg-muted/50">
                <td className="num px-4 py-3 text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-3">
                  <Link
                    to="/acoes/$ticker"
                    params={{ ticker: s.ticker }}
                    className="font-display font-semibold text-primary hover:underline"
                  >
                    {s.ticker}
                  </Link>
                </td>
                <td className="max-w-[200px] truncate px-4 py-3">{s.nome}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.setor ?? "—"}</td>
                <td className="num px-4 py-3 text-right">{formatCurrency(s.cotacao)}</td>
                <td className="num px-4 py-3 text-right">{formatNumber(s.pl)}</td>
                <td className="num px-4 py-3 text-right">{formatRatio(s.p_vpa)}</td>
                <td className="num px-4 py-3 text-right">{formatPercent(s.dy)}</td>
              </tr>
            ))}
            {stocks.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  Sem dados suficientes para este ranking.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RankingsPage() {
  const { data: stocks, isLoading } = useStocks();
  const lista = stocks ?? [];

  const maiorDY = lista.filter((s) => valido(s.dy)).sort((a, b) => (b.dy ?? 0) - (a.dy ?? 0)).slice(0, 10);
  const menorPL = lista.filter((s) => valido(s.pl)).sort((a, b) => (a.pl ?? 0) - (b.pl ?? 0)).slice(0, 10);
  const menorPVPA = lista
    .filter((s) => valido(s.p_vpa))
    .sort((a, b) => (a.p_vpa ?? 0) - (b.p_vpa ?? 0))
    .slice(0, 10);

  const ultimaAtualizacao = lista.map((s) => s.data_atualizacao).filter(Boolean).sort().at(-1) ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Rankings</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Listas ordenadas por indicador. Valores indisponíveis ou negativos são ignorados. Estes
        rankings não constituem recomendação de compra ou venda.
      </p>
      <div className="mt-3">
        <DataNotice atualizadoEm={ultimaAtualizacao} />
      </div>

      {isLoading ? (
        <div className="mt-8 rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Carregando rankings...
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-8">
          <RankingTable
            titulo="Maior Dividend Yield"
            descricao="Dez ações com maior DY informado."
            stocks={maiorDY}
          />
          <RankingTable
            titulo="Menor P/L"
            descricao="Dez ações com menor P/L positivo."
            stocks={menorPL}
          />
          <RankingTable
            titulo="Menor P/VPA"
            descricao="Dez ações com menor P/VPA positivo."
            stocks={menorPVPA}
          />
        </div>
      )}
    </div>
  );
}
