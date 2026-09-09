import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { formatDateTime } from "@/lib/format";
import { getUpdateStatus, updateStocks } from "@/lib/stocks.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administração — Bom Invest" },
      { name: "description", content: "Área interna de manutenção dos dados do Bom Invest." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Administração — Bom Invest" },
      { property: "og:description", content: "Área interna de manutenção dos dados." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const carregarStatus = useServerFn(getUpdateStatus);
  const atualizar = useServerFn(updateStocks);
  const queryClient = useQueryClient();

  const status = useQuery({ queryKey: ["admin-status"], queryFn: () => carregarStatus({}) });

  const mutation = useMutation({
    mutationFn: () => atualizar({ data: { limite: 40 } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-status"] });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      queryClient.invalidateQueries({ queryKey: ["market-data"] });
    },
  });

  const contagem = status.data?.contagem ?? {};

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-2xl font-semibold">Administração</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Área interna de manutenção. Executa a atualização dos dados de mercado em lotes.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {mutation.isPending ? "Atualizando..." : "Atualizar 40 ações"}
        </button>
        <span className="text-sm text-muted-foreground">
          Última consulta: {formatDateTime(status.data?.ultimaAtualizacao) ?? "—"}
        </span>
      </div>

      {mutation.data && (
        <p className="mt-4 rounded-lg border border-border bg-surface px-4 py-3 text-sm">
          {mutation.data.atualizados} atualizadas · {mutation.data.indisponiveis} indisponíveis ·{" "}
          {mutation.data.erros} erros · {mutation.data.restantes} ainda sem consulta.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        {["ATIVO", "PENDENTE", "INDISPONIVEL", "ERRO"].map((s) => (
          <div key={s} className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{s}</p>
            <p className="num mt-2 font-display text-xl font-semibold">{contagem[s] ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card shadow-card">
        <h2 className="border-b border-border px-5 py-4 font-display text-lg font-semibold">
          Ativos com problema
        </h2>
        <ul className="divide-y divide-border text-sm">
          {(status.data?.problemas ?? []).map((p) => (
            <li key={p.ticker} className="flex items-start justify-between gap-4 px-5 py-3">
              <span className="font-display font-semibold">{p.ticker}</span>
              <span className="text-right text-xs text-muted-foreground">
                {p.status} · {p.mensagem ?? "sem detalhes"}
              </span>
            </li>
          ))}
          {(status.data?.problemas ?? []).length === 0 && (
            <li className="px-5 py-6 text-center text-muted-foreground">Nenhum problema registrado.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
