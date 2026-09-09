import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { DataNotice } from "@/components/site/DataNotice";
import { StocksTable } from "@/components/site/StocksTable";
import { useSectors, useStocks } from "@/hooks/useStocks";

export const Route = createFileRoute("/acoes/")({
  head: () => ({
    meta: [
      { title: "Ações da B3 — Bom Invest" },
      {
        name: "description",
        content:
          "Lista completa das ações acompanhadas pelo Bom Invest com cotação, variação, P/L, P/VPA e Dividend Yield.",
      },
      { property: "og:title", content: "Ações da B3 — Bom Invest" },
      {
        property: "og:description",
        content: "Busque, filtre por setor e ordene as ações brasileiras por indicador.",
      },
    ],
  }),
  component: AcoesPage,
});

function AcoesPage() {
  const { data: stocks, isLoading } = useStocks();
  const { data: setores } = useSectors();
  const [termo, setTermo] = useState("");
  const [setor, setSetor] = useState("");

  const filtradas = useMemo(() => {
    const t = termo.trim().toLowerCase();
    return (stocks ?? []).filter((s) => {
      const combinaTexto =
        !t || s.ticker.toLowerCase().includes(t) || s.nome.toLowerCase().includes(t);
      const combinaSetor = !setor || s.setor === setor;
      return combinaTexto && combinaSetor;
    });
  }, [stocks, termo, setor]);

  const ultimaAtualizacao =
    (stocks ?? [])
      .map((s) => s.data_atualizacao)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Ações</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {stocks?.length ?? 0} ativos da lista oficial do Bom Invest.
      </p>
      <div className="mt-3">
        <DataNotice atualizadoEm={ultimaAtualizacao} />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por ticker ou empresa"
          aria-label="Buscar por ticker ou empresa"
          className="h-11 flex-1 rounded-lg border border-border bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
        <select
          value={setor}
          onChange={(e) => setSetor(e.target.value)}
          aria-label="Filtrar por setor"
          className="h-11 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 sm:w-64"
        >
          <option value="">Todos os setores</option>
          {(setores ?? []).map((s) => (
            <option key={s.id} value={s.nome}>
              {s.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Carregando ações...
          </div>
        ) : (
          <StocksTable stocks={filtradas} porPagina={25} />
        )}
      </div>
    </div>
  );
}
