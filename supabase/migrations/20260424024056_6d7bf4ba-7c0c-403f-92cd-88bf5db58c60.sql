
-- Pricing configuration: base price per type + style multipliers
CREATE TABLE public.pricing_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('type', 'style', 'size')),
  key text NOT NULL,
  label text NOT NULL,
  -- For 'type': base price per m² in TND. For 'style': multiplier (e.g. 1.8). For 'size': midpoint m².
  value numeric NOT NULL DEFAULT 0,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(kind, key)
);

ALTER TABLE public.pricing_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pricing readable by everyone"
  ON public.pricing_config FOR SELECT
  USING (true);

CREATE POLICY "Admins manage pricing"
  ON public.pricing_config FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER pricing_config_updated_at
  BEFORE UPDATE ON public.pricing_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Currency rates (1 TND = X currency)
CREATE TABLE public.currency_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  currency text NOT NULL UNIQUE CHECK (currency IN ('USD', 'EUR', 'TND')),
  rate_per_tnd numeric NOT NULL,
  source text NOT NULL DEFAULT 'manual',
  fetched_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.currency_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Currency rates readable by everyone"
  ON public.currency_rates FOR SELECT
  USING (true);

CREATE POLICY "Admins manage currency rates"
  ON public.currency_rates FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER currency_rates_updated_at
  BEFORE UPDATE ON public.currency_rates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Quotation requests
CREATE TABLE public.quotation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text,
  project_type text,
  project_size text,
  project_style text,
  project_location text,
  message text,
  estimated_min numeric,
  estimated_max numeric,
  currency text NOT NULL DEFAULT 'TND' CHECK (currency IN ('TND', 'USD', 'EUR')),
  ai_draft text,
  admin_notes text,
  final_quotation text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'sent', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quotation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit quotation requests"
  ON public.quotation_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins view quotation requests"
  ON public.quotation_requests FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update quotation requests"
  ON public.quotation_requests FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete quotation requests"
  ON public.quotation_requests FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER quotation_requests_updated_at
  BEFORE UPDATE ON public.quotation_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default pricing values (TND per m²)
INSERT INTO public.pricing_config (kind, key, label, value, display_order) VALUES
  ('type', 'villa',     'Villa',              150, 1),
  ('type', 'apartment', 'Apartment',          120, 2),
  ('type', 'office',    'Office',             140, 3),
  ('type', 'hotel',     'Hotel',              200, 4),
  ('type', 'interior',  'Interior',           100, 5),
  ('type', 'cultural',  'Cultural',           220, 6),
  ('style', 'modern',        'Modern',         1.0, 1),
  ('style', 'minimal',       'Minimal',        1.1, 2),
  ('style', 'luxury',        'Luxury',         1.8, 3),
  ('style', 'brutalist',     'Brutalist',      1.2, 4),
  ('style', 'mediterranean', 'Mediterranean',  1.15, 5),
  ('size', 'xs', '< 100 m²',        80, 1),
  ('size', 's',  '100–250 m²',      175, 2),
  ('size', 'm',  '250–500 m²',      375, 3),
  ('size', 'l',  '500–1000 m²',     750, 4),
  ('size', 'xl', '> 1000 m²',       1500, 5);

-- Seed initial currency rates (will be updated live)
INSERT INTO public.currency_rates (currency, rate_per_tnd, source) VALUES
  ('TND', 1.0,    'fixed'),
  ('USD', 0.32,   'manual'),
  ('EUR', 0.30,   'manual');
