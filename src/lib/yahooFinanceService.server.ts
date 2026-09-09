// Camada de serviço do Yahoo Finance. Executa exclusivamente no servidor.
import type {
  PriceHistoryPoint,
  Periodo,
  StockFundamentals,
  StockQuote,
} from "@/types/stock";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36";

export function getYahooSymbol(ticker: string): string {
  return `${ticker.trim().toUpperCase()}.SA`;
}

function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value && typeof value === "object" && "raw" in (value as Record<string, unknown>)) {
    const raw = (value as { raw?: unknown }).raw;
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  }
  return null;
}

let crumbCache: { crumb: string; cookie: string; expiresAt: number } | null = null;

async function getCrumb(): Promise<{ crumb: string; cookie: string } | null> {
  if (crumbCache && crumbCache.expiresAt > Date.now()) {
    return { crumb: crumbCache.crumb, cookie: crumbCache.cookie };
  }
  try {
    const seed = await fetch("https://fc.yahoo.com", { headers: { "User-Agent": UA } });
    const setCookie = seed.headers.get("set-cookie") ?? "";
    const cookie = setCookie
      .split(/,(?=[^;]+?=)/)
      .map((part) => (part.split(";")[0] ?? "").trim())
      .filter(Boolean)
      .join("; ");
    if (!cookie) return null;

    const res = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", {
      headers: { "User-Agent": UA, Cookie: cookie },
    });
    const crumb = (await res.text()).trim();
    if (!crumb || crumb.includes("<")) return null;

    crumbCache = { crumb, cookie, expiresAt: Date.now() + 30 * 60 * 1000 };
    return { crumb, cookie };
  } catch {
    return null;
  }
}

type ChartMeta = Record<string, unknown>;

async function fetchChart(
  symbol: string,
  range: string,
  interval: string,
): Promise<{ meta: ChartMeta; timestamps: number[]; quote: Record<string, (number | null)[]> } | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol,
  )}?interval=${interval}&range=${range}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Yahoo respondeu ${res.status}`);
  const json = (await res.json()) as {
    chart?: { result?: Array<Record<string, unknown>> | null; error?: { description?: string } | null };
  };
  if (json.chart?.error) throw new Error(json.chart.error.description ?? "Erro do Yahoo Finance");
  const result = json.chart?.result?.[0];
  if (!result) return null;
  const indicators = (result["indicators"] as { quote?: Array<Record<string, (number | null)[]>> }) ?? {};
  return {
    meta: (result["meta"] as ChartMeta) ?? {},
    timestamps: (result["timestamp"] as number[]) ?? [],
    quote: indicators.quote?.[0] ?? {},
  };
}

export function normalizeQuote(meta: ChartMeta): StockQuote {
  const price = num(meta["regularMarketPrice"]);
  const previous = num(meta["chartPreviousClose"]) ?? num(meta["previousClose"]);
  const percent = num(meta["regularMarketChangePercent"]);
  const variacao =
    price !== null && previous !== null ? Number((price - previous).toFixed(4)) : null;
  const time = num(meta["regularMarketTime"]);

  return {
    cotacao: price,
    variacao,
    variacao_percentual:
      percent !== null
        ? Number(percent.toFixed(4))
        : price !== null && previous
          ? Number((((price - previous) / previous) * 100).toFixed(4))
          : null,
    abertura: num(meta["regularMarketOpen"]) ?? num(meta["open"]),
    maxima: num(meta["regularMarketDayHigh"]),
    minima: num(meta["regularMarketDayLow"]),
    volume: num(meta["regularMarketVolume"]),
    nome_longo: (meta["longName"] as string) ?? (meta["shortName"] as string) ?? null,
    atualizado_em: time ? new Date(time * 1000).toISOString() : new Date().toISOString(),
  };
}

export async function getQuote(symbol: string): Promise<StockQuote | null> {
  const chart = await fetchChart(symbol, "5d", "1d");
  if (!chart) return null;
  return normalizeQuote(chart.meta);
}

export function normalizeFundamentals(modules: Record<string, Record<string, unknown>>): StockFundamentals {
  const summary = modules["summaryDetail"] ?? {};
  const keyStats = modules["defaultKeyStatistics"] ?? {};
  const price = modules["price"] ?? {};
  const profile = modules["assetProfile"] ?? {};

  const pl = num(summary["trailingPE"]) ?? num(keyStats["trailingPE"]);
  const pvpa = num(keyStats["priceToBook"]);

  let dy = num(summary["dividendYield"]);
  if (dy !== null && dy > 0 && dy <= 1) dy = dy * 100;
  if (dy !== null) dy = Number(dy.toFixed(4));

  return {
    pl: pl !== null ? Number(pl.toFixed(4)) : null,
    p_vpa: pvpa !== null ? Number(pvpa.toFixed(4)) : null,
    dy,
    valor_mercado: num(price["marketCap"]) ?? num(summary["marketCap"]),
    lucro_por_acao: num(keyStats["trailingEps"]),
    patrimonio_por_acao: num(keyStats["bookValue"]),
    razao_social: (price["longName"] as string) ?? null,
    descricao: (profile["longBusinessSummary"] as string) ?? null,
  };
}

export async function getFundamentals(symbol: string): Promise<StockFundamentals | null> {
  const auth = await getCrumb();
  if (!auth) return null;
  const modules = "summaryDetail,defaultKeyStatistics,price,assetProfile";
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(
    symbol,
  )}?modules=${modules}&crumb=${encodeURIComponent(auth.crumb)}`;
  const res = await fetch(url, { headers: { "User-Agent": UA, Cookie: auth.cookie } });
  if (!res.ok) {
    crumbCache = null;
    return null;
  }
  const json = (await res.json()) as {
    quoteSummary?: { result?: Array<Record<string, Record<string, unknown>>> | null; error?: unknown };
  };
  if (json.quoteSummary?.error) {
    crumbCache = null;
    return null;
  }
  const result = json.quoteSummary?.result?.[0];
  if (!result) return null;
  return normalizeFundamentals(result);
}

const PERIODO_MAP: Record<Periodo, { range: string; interval: string }> = {
  "1M": { range: "1mo", interval: "1d" },
  "6M": { range: "6mo", interval: "1d" },
  "1A": { range: "1y", interval: "1d" },
  "5A": { range: "5y", interval: "1wk" },
  MAX: { range: "max", interval: "1mo" },
};

export function normalizeHistory(
  timestamps: number[],
  quote: Record<string, (number | null)[]>,
): PriceHistoryPoint[] {
  const points: PriceHistoryPoint[] = [];
  for (let i = 0; i < timestamps.length; i += 1) {
    const close = quote["close"]?.[i] ?? null;
    if (close === null || !Number.isFinite(close)) continue;
    points.push({
      data: new Date((timestamps[i] ?? 0) * 1000).toISOString().slice(0, 10),
      abertura: quote["open"]?.[i] ?? null,
      maxima: quote["high"]?.[i] ?? null,
      minima: quote["low"]?.[i] ?? null,
      fechamento: close,
      volume: quote["volume"]?.[i] ?? null,
    });
  }
  return points;
}

export async function getPriceHistory(
  symbol: string,
  periodo: Periodo,
): Promise<PriceHistoryPoint[]> {
  const { range, interval } = PERIODO_MAP[periodo];
  const chart = await fetchChart(symbol, range, interval);
  if (!chart) return [];
  return normalizeHistory(chart.timestamps, chart.quote);
}

export async function getIndexQuote(symbol: string): Promise<StockQuote | null> {
  return getQuote(symbol);
}
