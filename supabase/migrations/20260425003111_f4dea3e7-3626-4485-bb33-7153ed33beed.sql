-- 1) Tighten quotation_requests INSERT policy
DROP POLICY IF EXISTS "Anyone can submit quotation requests" ON public.quotation_requests;

CREATE POLICY "Public can submit valid quotation requests"
  ON public.quotation_requests
  FOR INSERT
  TO public
  WITH CHECK (
    -- Required, sane name
    char_length(btrim(client_name)) BETWEEN 2 AND 120
    -- Required, basic email shape, length-capped
    AND char_length(client_email) BETWEEN 5 AND 255
    AND client_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    -- Optional phone with cap
    AND (client_phone IS NULL OR char_length(client_phone) <= 40)
    -- Optional message with cap to prevent payload bloat
    AND (message IS NULL OR char_length(message) <= 4000)
    -- Optional project fields capped
    AND (project_type IS NULL OR char_length(project_type) <= 120)
    AND (project_size IS NULL OR char_length(project_size) <= 120)
    AND (project_style IS NULL OR char_length(project_style) <= 120)
    AND (project_location IS NULL OR char_length(project_location) <= 200)
    -- Anonymous submitters cannot pre-fill internal fields
    AND ai_draft IS NULL
    AND admin_notes IS NULL
    AND final_quotation IS NULL
    AND status = 'pending'
  );

-- 2) Lock pricing_config: admins only for reads (existing admin ALL policy stays)
DROP POLICY IF EXISTS "Pricing readable by everyone" ON public.pricing_config;

-- 3) Public catalog without prices, for the estimator wizard
CREATE OR REPLACE VIEW public.pricing_catalog
WITH (security_invoker = true) AS
SELECT id, kind, key, label, display_order
FROM public.pricing_config;

-- Allow anon + authenticated to read the safe catalog (no values exposed)
GRANT SELECT ON public.pricing_catalog TO anon, authenticated;