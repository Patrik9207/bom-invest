export type StatusDados = "ATIVO" | "PENDENTE" | "INDISPONIVEL" | "ERRO";

export type Stock = {
  id: string;
  ticker: string;
  yahoo_symbol: string;
  nome: string;
  razao_social: string | null;
  setor: string | null;
  subsetor: string | null;
  cotacao: number | null;
  variacao: number | null;
  variacao_percentual: number | null;
  pl: number | null;
  p_vpa: number | null;
  dy: number | null;
  valor_mercado: number | null;
  lucro_por_acao: number | null;
  patrimonio_por_acao: number | null;
  abertura: number | null;
  maxima: number | null;
  minima: number | null;
  volume: number | null;
  descricao: string | null;
  status_dados: StatusDados;
  ultima_consulta: string | null;
  data_atualizacao: string | null;
  mensagem_erro: string | null;
  ativo: boolean;
};

export type StockQuote = {
  cotacao: number | null;
  variacao: number | null;
  variacao_percentual: number | null;
  abertura: number | null;
  maxima: number | null;
  minima: number | null;
  volume: number | null;
  nome_longo: string | null;
  atualizado_em: string | null;
};

export type StockFundamentals = {
  pl: number | null;
  p_vpa: number | null;
  dy: number | null;
  valor_mercado: number | null;
  lucro_por_acao: number | null;
  patrimonio_por_acao: number | null;
  razao_social: string | null;
  descricao: string | null;
};

export type PriceHistoryPoint = {
  data: string;
  abertura: number | null;
  maxima: number | null;
  minima: number | null;
  fechamento: number | null;
  volume: number | null;
};

export type Sector = {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
};

export type MarketData = {
  id: string;
  indice: string;
  valor: number | null;
  variacao: number | null;
  variacao_percentual: number | null;
  data_atualizacao: string | null;
};

export type Periodo = "1M" | "6M" | "1A" | "5A" | "MAX";
