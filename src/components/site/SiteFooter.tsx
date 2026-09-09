import { Link } from "@tanstack/react-router";

const LINKS = [
  { to: "/", label: "Início" },
  { to: "/acoes", label: "Ações" },
  { to: "/rankings", label: "Rankings" },
  { to: "/setores", label: "Setores" },
  { to: "/sobre", label: "Sobre" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="font-display text-lg font-semibold">BOM INVEST</p>
          <p className="mt-1 text-sm text-primary-foreground/70">Informação para investir melhor.</p>
          <p className="mt-6 max-w-xl text-xs leading-relaxed text-primary-foreground/60">
            Os dados apresentados possuem finalidade exclusivamente informativa e educacional. A
            presença de um ativo na plataforma não constitui recomendação de compra ou venda.
          </p>
        </div>
        <nav className="flex flex-col gap-2 text-sm md:items-end">
          {LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-primary-foreground/75 transition-colors hover:text-primary-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-primary-foreground/10 py-4 text-center text-xs text-primary-foreground/50">
        © {new Date().getFullYear()} Bom Invest · Os dados de mercado podem apresentar atraso.
      </div>
    </footer>
  );
}
