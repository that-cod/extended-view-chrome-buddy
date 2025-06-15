
-- 1. Create table for storing uploaded trading statements/files
CREATE TABLE public.uploaded_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  upload_date TIMESTAMPTZ DEFAULT timezone('utc', now()),
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 2. Create table for storing individual trades from CSV processing
CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  statement_id UUID REFERENCES public.uploaded_statements(id) ON DELETE CASCADE,
  trade_date TIMESTAMPTZ NOT NULL,
  symbol TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('buy', 'sell')),
  volume DECIMAL(15,4) NOT NULL,
  price DECIMAL(15,4) NOT NULL,
  profit DECIMAL(15,4) NOT NULL,
  emotion TEXT,
  confidence DECIMAL(5,2) DEFAULT 50.0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 3. Create table for storing analysis results
CREATE TABLE public.trading_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  statement_id UUID REFERENCES public.uploaded_statements(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL,
  analysis_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 4. Enable RLS on all tables
ALTER TABLE public.uploaded_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_analysis ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for uploaded_statements
CREATE POLICY "Users can view their own statements"
  ON public.uploaded_statements
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own statements"
  ON public.uploaded_statements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own statements"
  ON public.uploaded_statements
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own statements"
  ON public.uploaded_statements
  FOR DELETE
  USING (auth.uid() = user_id);

-- 6. RLS Policies for trades
CREATE POLICY "Users can view their own trades"
  ON public.trades
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades"
  ON public.trades
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades"
  ON public.trades
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades"
  ON public.trades
  FOR DELETE
  USING (auth.uid() = user_id);

-- 7. RLS Policies for trading_analysis
CREATE POLICY "Users can view their own analysis"
  ON public.trading_analysis
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analysis"
  ON public.trading_analysis
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analysis"
  ON public.trading_analysis
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analysis"
  ON public.trading_analysis
  FOR DELETE
  USING (auth.uid() = user_id);

-- 8. Create indexes for better performance
CREATE INDEX idx_trades_user_id ON public.trades(user_id);
CREATE INDEX idx_trades_date ON public.trades(trade_date);
CREATE INDEX idx_trades_symbol ON public.trades(symbol);
CREATE INDEX idx_uploaded_statements_user_id ON public.uploaded_statements(user_id);
CREATE INDEX idx_trading_analysis_user_id ON public.trading_analysis(user_id);

-- 9. Add updated_at triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_uploaded_statements_updated_at
BEFORE UPDATE ON public.uploaded_statements
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_trades_updated_at
BEFORE UPDATE ON public.trades
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_trading_analysis_updated_at
BEFORE UPDATE ON public.trading_analysis
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
