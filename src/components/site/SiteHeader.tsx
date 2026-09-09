import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/acoes", label: "Ações" },
  { to: "/rankings", label: "Rankings" },
  { to: "/setores", label: "Setores" },
  { to: "/sobre", label: "Sobre" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-primary text-primary-foreground">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-foreground/12 font-display text-sm font-bold">
            BI
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-base font-semibold tracking-tight">BOM INVEST</span>
            <span className="text-[11px] text-primary-foreground/70">
              Informação para investir melhor.
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
              activeProps={{ className: "bg-primary-foreground/15 text-primary-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 transition-colors hover:bg-primary-foreground/10 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className={cn("border-t border-primary-foreground/10 md:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto flex max-w-6xl flex-col px-4 py-2">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-3 text-sm font-medium text-primary-foreground/85"
              activeProps={{ className: "text-primary-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
