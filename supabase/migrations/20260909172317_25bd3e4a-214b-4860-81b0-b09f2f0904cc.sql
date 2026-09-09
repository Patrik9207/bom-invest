CREATE TABLE public.sectors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true
);
GRANT SELECT ON public.sectors TO anon, authenticated;
GRANT ALL ON public.sectors TO service_role;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Setores sao publicos" ON public.sectors FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.stocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticker TEXT NOT NULL UNIQUE,
  yahoo_symbol TEXT NOT NULL,
  nome TEXT NOT NULL,
  razao_social TEXT,
  setor TEXT,
  subsetor TEXT,
  cotacao NUMERIC,
  variacao NUMERIC,
  variacao_percentual NUMERIC,
  pl NUMERIC,
  p_vpa NUMERIC,
  dy NUMERIC,
  valor_mercado NUMERIC,
  lucro_por_acao NUMERIC,
  patrimonio_por_acao NUMERIC,
  abertura NUMERIC,
  maxima NUMERIC,
  minima NUMERIC,
  volume NUMERIC,
  descricao TEXT,
  status_dados TEXT NOT NULL DEFAULT 'PENDENTE',
  ultima_consulta TIMESTAMPTZ,
  data_atualizacao TIMESTAMPTZ,
  mensagem_erro TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX stocks_setor_idx ON public.stocks (setor);
CREATE INDEX stocks_status_idx ON public.stocks (status_dados);
GRANT SELECT ON public.stocks TO anon, authenticated;
GRANT ALL ON public.stocks TO service_role;
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acoes sao publicas" ON public.stocks FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stock_id UUID REFERENCES public.stocks(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  data DATE NOT NULL,
  abertura NUMERIC,
  maxima NUMERIC,
  minima NUMERIC,
  fechamento NUMERIC,
  volume NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (ticker, data)
);
CREATE INDEX price_history_ticker_data_idx ON public.price_history (ticker, data);
GRANT SELECT ON public.price_history TO anon, authenticated;
GRANT ALL ON public.price_history TO service_role;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Historico e publico" ON public.price_history FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.market_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  indice TEXT NOT NULL UNIQUE,
  valor NUMERIC,
  variacao NUMERIC,
  variacao_percentual NUMERIC,
  data_atualizacao TIMESTAMPTZ
);
GRANT SELECT ON public.market_data TO anon, authenticated;
GRANT ALL ON public.market_data TO service_role;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mercado e publico" ON public.market_data FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER update_stocks_updated_at BEFORE UPDATE ON public.stocks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.market_data (indice) VALUES ('IBOVESPA') ON CONFLICT (indice) DO NOTHING;

INSERT INTO public.sectors (nome) VALUES
  ('Agronegócio'),
  ('Alimentos e Bebidas'),
  ('Bancos'),
  ('Construção'),
  ('Educação'),
  ('Energia Elétrica'),
  ('Holdings'),
  ('Indústria'),
  ('Mineração'),
  ('Papel e Celulose'),
  ('Petróleo e Gás'),
  ('Química'),
  ('Saneamento'),
  ('Saúde'),
  ('Seguros'),
  ('Serviços'),
  ('Serviços Financeiros'),
  ('Siderurgia'),
  ('Tecnologia'),
  ('Telecomunicações'),
  ('Transportes'),
  ('Varejo')
ON CONFLICT (nome) DO NOTHING;