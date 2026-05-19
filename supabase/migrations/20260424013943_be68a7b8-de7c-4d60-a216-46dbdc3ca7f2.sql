-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users view own roles" ON public.user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('residential','commercial','interior','concept')),
  year INTEGER,
  location TEXT,
  short_description TEXT,
  concept TEXT,
  materials TEXT,
  map_url TEXT,
  hero_image TEXT,
  gallery TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Projects readable by everyone" ON public.projects
FOR SELECT USING (true);

CREATE POLICY "Admins insert projects" ON public.projects
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update projects" ON public.projects
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete projects" ON public.projects
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_projects_featured ON public.projects(featured, display_order);
CREATE INDEX idx_projects_category ON public.projects(category);

-- Site settings (single row)
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title TEXT NOT NULL DEFAULT 'RAAR Architecture',
  hero_tagline TEXT NOT NULL DEFAULT 'Designing Space, Shaping Emotion',
  hero_subtext TEXT NOT NULL DEFAULT 'By Rabeb Chekir',
  about_text TEXT,
  contact_email TEXT NOT NULL DEFAULT 'contact@raararchitecture.com',
  facebook_url TEXT,
  instagram_url TEXT,
  map_url TEXT DEFAULT 'https://maps.app.goo.gl/G2h3vXR9f7CzDPeq5',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings readable" ON public.site_settings
FOR SELECT USING (true);

CREATE POLICY "Admins update site settings" ON public.site_settings
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_settings (hero_title, hero_tagline, hero_subtext, about_text)
VALUES (
  'RAAR Architecture',
  'Designing Space, Shaping Emotion',
  'By Rabeb Chekir',
  'RAAR is the architectural practice of Rabeb Chekir — a studio dedicated to designing spaces that breathe, narrate, and endure. We approach each project as a dialogue between landscape, light, and human experience, weaving raw materiality with quiet luxury.'
);

-- Storage bucket for project images
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true);

CREATE POLICY "Project images public read" ON storage.objects
FOR SELECT USING (bucket_id = 'project-images');

CREATE POLICY "Admins upload project images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update project images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete project images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin'));