import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { useStocks } from "@/hooks/useStocks";
import { cn } from "@/lib/utils";

type Props = {
  size?: "lg" | "md";
  placeholder?: string;
};

export function StockSearch({ size = "md", placeholder }: Props) {
  const [termo, setTermo] = useState("");
  const [aberto, setAberto] = useState(false);
  const { data: stocks } = useStocks();
  const navigate = useNavigate();

  const resultados = useMemo(() => {
    const t = termo.trim().toLowerCase();
    if (t.length < 1 || !stocks) return [];
    return stocks
      .filter((s) => s.ticker.toLowerCase().includes(t) || s.nome.toLowerCase().includes(t))
      .slice(0, 8);
  }, [termo, stocks]);

  function abrir(ticker: string) {
    setTermo("");
    setAberto(false);
    navigate({ to: "/acoes/$ticker", params: { ticker } });
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={termo}
          onChange={(e) => {
            setTermo(e.target.value);
            setAberto(true);
          }}
          onFocus={() => setAberto(true)}
          onBlur={() => window.setTimeout(() => setAberto(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && resultados[0]) abrir(resultados[0].ticker);
          }}
          placeholder={placeholder ?? "Digite o ticker ou nome da empresa"}
          aria-label="Buscar ação"
          className={cn(
            "w-full rounded-lg border border-border bg-card pl-11 pr-4 text-foreground shadow-card outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40",
            size === "lg" ? "h-14 text-base" : "h-11 text-sm",
          )}
        />
      </div>

      {aberto && resultados.length > 0 && (
        <ul className="absolute z-30 mt-2 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-card">
          {resultados.map((s) => (
            <li key={s.ticker}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => abrir(s.ticker)}
                className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-muted"
              >
                <span className="flex flex-col">
                  <span className="font-display text-sm font-semibold">{s.ticker}</span>
                  <span className="text-xs text-muted-foreground">{s.nome}</span>
                </span>
                <span className="text-xs text-muted-foreground">{s.setor}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {aberto && termo.trim().length > 0 && resultados.length === 0 && (
        <div className="absolute z-30 mt-2 w-full rounded-lg border border-border bg-popover px-4 py-3 text-sm text-muted-foreground shadow-card">
          Ação não encontrada.
        </div>
      )}
    </div>
  );
}
