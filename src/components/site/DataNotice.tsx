import { Info } from "lucide-react";

import { formatDateTime } from "@/lib/format";

export function DataNotice({ atualizadoEm }: { atualizadoEm?: string | null }) {
  const quando = formatDateTime(atualizadoEm);
  return (
    <p className="flex items-start gap-2 text-xs text-muted-foreground">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        {quando ? `Dados atualizados em ${quando}. ` : "Dados ainda não atualizados. "}
        Os dados de mercado podem apresentar atraso.
      </span>
    </p>
  );
}
