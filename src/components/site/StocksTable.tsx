import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";

import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatRatio,
  variationClass,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Stock } from "@/types/stock";

type Coluna = "ticker" | "nome" | "setor" | "cotacao" | "variacao_percentual" | "pl" | "p_vpa" | "dy";

const COLUNAS: { key: Coluna; label: string; numeric?: boolean }[] = [
  { key: "ticker", label: "Ticker" },
  { key: "nome", label: "Empresa" },
  { key: "setor", label: "Setor" },
  { key: "cotacao", label: "Cotação", numeric: true },
  { key: "variacao_percentual", label: "Variação", numeric: true },
  { key: "pl", label: "P/L", numeric: true },
  { key: "p_vpa", label: "P/VPA", numeric: true },
  { key: "dy", label: "DY", numeric: true },
];

type Props = {
  stocks: Stock[];
  porPagina?: number;
  paginar?: boolean;
};

export function StocksTable({ stocks, porPagina = 25, paginar = true }: Props) {
  const [ordem, setOrdem] = useState<{ coluna: Coluna; asc: boolean }>({
    coluna: "ticker",
    asc: true,
  });
  const [pagina, setPagina] = useState(0);

  const ordenadas = useMemo(() => {
    const copia = [...stocks];
    copia.sort((a, b) => {
      const va = a[ordem.coluna];
      const vb = b[ordem.coluna];
      if (va === null || va === undefined) return 1;
      if (vb === null || vb === undefined) return -1;
      if (typeof va === "number" && typeof vb === "number") return ordem.asc ? va - vb : vb - va;
      return ordem.asc
        ? String(va).localeCompare(String(vb), "pt-BR")
        : String(vb).localeCompare(String(va), "pt-BR");
    });
    return copia;
  }, [stocks, ordem]);

  const totalPaginas = paginar ? Math.max(1, Math.ceil(ordenadas.length / porPagina)) : 1;
  const paginaAtual = Math.min(pagina, totalPaginas - 1);
  const visiveis = paginar
    ? ordenadas.slice(paginaAtual * porPagina, paginaAtual * porPagina + porPagina)
    : ordenadas;

  function alternar(coluna: Coluna) {
    setPagina(0);
    setOrdem((atual) =>
      atual.coluna === coluna ? { coluna, asc: !atual.asc } : { coluna, asc: true },
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/70 text-left">
              {COLUNAS.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={cn("px-4 py-3 font-medium", c.numeric && "text-right")}
                >
                  <button
                    type="button"
                    onClick={() => alternar(c.key)}
                    className={cn(
                      "inline-flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground",
                      c.numeric && "flex-row-reverse",
                    )}
                  >
                    {c.label}
                    {ordem.coluna === c.key ? (
                      ordem.asc ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )
                    ) : (
                      <ChevronsUpDown className="h-3 w-3 opacity-50" />
                    )}
                  </button>
                </th>
              ))}
              <th scope="col" className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {visiveis.map((s) => (
              <tr key={s.ticker} className="border-b border-border/60 last:border-0 hover:bg-muted/50">
                <td className="px-4 py-3">
                  <Link
                    to="/acoes/$ticker"
                    params={{ ticker: s.ticker }}
                    className="font-display font-semibold text-primary hover:underline"
                  >
                    {s.ticker}
                  </Link>
                </td>
                <td className="max-w-[220px] truncate px-4 py-3">{s.nome}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.setor ?? "—"}</td>
                <td className="num px-4 py-3 text-right">{formatCurrency(s.cotacao)}</td>
                <td className={cn("num px-4 py-3 text-right", variationClass(s.variacao_percentual))}>
                  {formatPercent(s.variacao_percentual, true)}
                </td>
                <td className="num px-4 py-3 text-right">{formatNumber(s.pl)}</td>
                <td className="num px-4 py-3 text-right">{formatRatio(s.p_vpa)}</td>
                <td className="num px-4 py-3 text-right">{formatPercent(s.dy)}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to="/acoes/$ticker"
                    params={{ ticker: s.ticker }}
                    className="whitespace-nowrap rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    Ver análise
                  </Link>
                </td>
              </tr>
            ))}
            {visiveis.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                  Nenhuma ação encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {paginar && totalPaginas > 1 && (
        <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            Página {paginaAtual + 1} de {totalPaginas} · {ordenadas.length} ações
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={paginaAtual === 0}
              onClick={() => setPagina(paginaAtual - 1)}
              className="rounded-md border border-border px-3 py-1.5 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={paginaAtual >= totalPaginas - 1}
              onClick={() => setPagina(paginaAtual + 1)}
              className="rounded-md border border-border px-3 py-1.5 disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
