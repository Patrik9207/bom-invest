import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre o Bom Invest" },
      {
        name: "description",
        content:
          "O Bom Invest facilita o acesso a cotações e indicadores fundamentalistas das ações brasileiras, com finalidade informativa.",
      },
      { property: "og:title", content: "Sobre o Bom Invest" },
      {
        property: "og:description",
        content: "Plataforma informativa de consulta de ações brasileiras da B3.",
      },
    ],
  }),
  component: SobrePage,
});

function SobrePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Sobre o Bom Invest</h1>
      <p className="mt-5 text-sm leading-relaxed text-foreground/85">
        O Bom Invest foi desenvolvido para facilitar o acesso a informações de mercado e indicadores
        fundamentalistas das ações brasileiras.
      </p>

      <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-card">
        <h2 className="font-display text-lg font-semibold">O que você precisa saber</h2>
        <ul className="mt-4 flex flex-col gap-3 text-sm text-foreground/85">
          <li>Os dados são informativos e educacionais.</li>
          <li>As informações podem apresentar atraso em relação ao mercado.</li>
          <li>Nada aqui constitui recomendação de compra ou venda de ativos.</li>
          <li>O investidor deve sempre realizar sua própria análise antes de decidir.</li>
        </ul>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-display text-lg font-semibold">Fonte dos dados</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          As cotações, o histórico e os indicadores exibidos são obtidos no Yahoo Finance e
          armazenados na base do Bom Invest, sendo atualizados periodicamente. Quando um indicador
          não está disponível, exibimos "N/A" em vez de estimar valores.
        </p>
      </div>
    </div>
  );
}
