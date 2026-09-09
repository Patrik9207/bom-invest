export const NA = "N/A";

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return NA;
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatNumber(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return NA;
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatRatio(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return NA;
  return `${formatNumber(value)}x`;
}

export function formatPercent(value: number | null | undefined, sign = false): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return NA;
  const formatted = `${formatNumber(value)}%`;
  return sign && value > 0 ? `+${formatted}` : formatted;
}

export function formatSignedCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return NA;
  const formatted = formatCurrency(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

export function formatCompactCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return NA;
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000_000) return `R$ ${formatNumber(value / 1_000_000_000_000)} tri`;
  if (abs >= 1_000_000_000) return `R$ ${formatNumber(value / 1_000_000_000)} bi`;
  if (abs >= 1_000_000) return `R$ ${formatNumber(value / 1_000_000)} mi`;
  return formatCurrency(value);
}

export function formatVolume(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return NA;
  return Math.round(value).toLocaleString("pt-BR");
}

export function formatDateTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const d = date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const h = date.toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${d} às ${h}`;
}

export function formatShortDate(value: string): string {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export function variationClass(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "text-muted-foreground";
  if (value > 0) return "text-positive";
  if (value < 0) return "text-negative";
  return "text-muted-foreground";
}
