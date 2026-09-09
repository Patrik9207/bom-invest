import { createFileRoute } from "@tanstack/react-router";

import { updateStocks } from "@/lib/stocks.functions";

export const Route = createFileRoute("/api/public/hooks/update-stocks")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apikey = request.headers.get("apikey");
        if (!apikey || apikey !== process.env["VITE_SUPABASE_PUBLISHABLE_KEY"]) {
          return new Response(JSON.stringify({ error: "Não autorizado" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        const resultado = await updateStocks({ data: { limite: 60 } });

        return new Response(JSON.stringify({ ok: true, ...resultado }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
