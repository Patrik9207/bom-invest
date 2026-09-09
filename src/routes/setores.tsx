import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { StocksTable } from "@/components/site/StocksTable";
import { useSectors, useStocks } from "@/hooks/useStocks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/setores")({
  head: () => ({
    meta: [
      { title: "Setores da bolsa brasileira — Bom Invest" },
      {
        name: "description",
        content:
          "Veja as ações da B3 organizadas por setor: bancos, energia, petróleo, mineração, varejo, saúde e mais.",
      },
      { property: "og:title", content: "Setores da bolsa brasileira — Bom Invest" },
      {
        property: "og:description",
        content: "Selecione um setor e veja apenas as ações que pertencem a ele.",
      },
    ],
  }),
  component: SetoresPage,
});

function SetoresPage() {
  const { data: setores } = useSectors();
  const { data: stocks } = useStocks();
  const [selecionado, setSelecionado] = useState<string | null>(null);

  const lista = stocks ?? [];
  const contagem = (nome: string) => lista.filter((s) => s.setor === nome).length;
  const filtradas = selecionado ? lista.filter((s) => s.setor === selecionado) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Setores</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Selecione um setor para ver apenas as ações daquele segmento.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(setores ?? []).map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelecionado(selecionado === s.nome ? null : s.nome)}
            className={cn(
              "rounded-xl border border-border bg-card p-4 text-left shadow-card transition-colors hover:border-primary/40",
              selecionado === s.nome && "border-primary bg-secondary",
            )}
          >
            <p className="font-display text-sm font-semibold">{s.nome}</p>
            <p className="mt-1 text-xs text-muted-foreground">{contagem(s.nome)} ações</p>
          </button>
        ))}
      </div>

      {selecionado && (
        <div className="mt-10">
          <h2 className="mb-4 font-display text-xl font-semibold">{selecionado}</h2>
          <StocksTable stocks={filtradas} porPagina={25} />
        </div>
      )}
    </div>
  );
}
