/**
 * Complete SQL Migration Script for Supabase PostgreSQL
 * RSUD Al-Mulk Kota Sukabumi - Bank Aplikasi dan Pelaporan Hub
 */
export const SUPABASE_SQL_SCHEMA = `-- ==========================================================
-- BANK APLIKASI DAN PELAPORAN RSUD AL-MULK KOTA SUKABUMI
-- SUPABASE POSTGRESQL COMPLETE DATABASE SCHEMA & RLS POLICIES
-- ==========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE TABLE: website_profile
CREATE TABLE IF NOT EXISTS public.website_profile (
    id TEXT PRIMARY KEY DEFAULT 'profile-rsud-almulk-001',
    hospital_name TEXT NOT NULL DEFAULT 'RSUD Al-Mulk Kota Sukabumi',
    tagline TEXT NOT NULL DEFAULT 'Melayani dengan Hati, Ikhlas dan Profesional',
    description TEXT NOT NULL DEFAULT 'Portal terpadu bank aplikasi digital internal dan sistem pelaporan resmi pemerintah.',
    logo_url TEXT,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    emergency_phone TEXT,
    email TEXT NOT NULL,
    website_url TEXT NOT NULL,
    service_hours TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CREATE TABLE: social_links
CREATE TABLE IF NOT EXISTS public.social_links (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'youtube', 'tiktok', 'whatsapp', 'website')),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CREATE TABLE: hero_media
CREATE TABLE IF NOT EXISTS public.hero_media (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    title TEXT NOT NULL,
    description TEXT,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'slideshow')),
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    display_order INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    overlay_opacity INTEGER DEFAULT 65 NOT NULL CHECK (overlay_opacity >= 0 AND overlay_opacity <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CREATE TABLE: internal_applications
CREATE TABLE IF NOT EXISTS public.internal_applications (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    app_url TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'maintenance', 'nonaktif')),
    display_order INTEGER DEFAULT 0 NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CREATE TABLE: official_reporting_apps
CREATE TABLE IF NOT EXISTS public.official_reporting_apps (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    app_url TEXT NOT NULL,
    institution TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'maintenance', 'nonaktif')),
    display_order INTEGER DEFAULT 0 NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. CREATE TABLE: application_clicks (Tracking & Analytics)
CREATE TABLE IF NOT EXISTS public.application_clicks (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    application_id TEXT NOT NULL,
    application_name TEXT NOT NULL,
    application_type TEXT NOT NULL CHECK (application_type IN ('internal', 'official')),
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_agent TEXT,
    referrer TEXT
);

-- 8. CREATE TABLE: users (App Profiles)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin', 'operator')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. CREATE TABLE: audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT,
    user_email TEXT,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE public.website_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.official_reporting_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Website Profile: Public can read, authenticated can modify
CREATE POLICY "Public can view website profile" ON public.website_profile FOR SELECT USING (true);
CREATE POLICY "Admins can update website profile" ON public.website_profile FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Social Links: Public can view active links, admins have full CRUD
CREATE POLICY "Public can view active social links" ON public.social_links FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');
CREATE POLICY "Admins can manage social links" ON public.social_links FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Hero Media: Public can view active media, admins have full CRUD
CREATE POLICY "Public can view active hero media" ON public.hero_media FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');
CREATE POLICY "Admins can manage hero media" ON public.hero_media FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Internal Applications: Public can view active apps, admins have full CRUD
CREATE POLICY "Public can view active internal apps" ON public.internal_applications FOR SELECT USING (status != 'nonaktif' OR auth.role() = 'authenticated');
CREATE POLICY "Admins can manage internal apps" ON public.internal_applications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Official Reporting Apps: Public can view active apps, admins have full CRUD
CREATE POLICY "Public can view active official apps" ON public.official_reporting_apps FOR SELECT USING (status != 'nonaktif' OR auth.role() = 'authenticated');
CREATE POLICY "Admins can manage official apps" ON public.official_reporting_apps FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Application Clicks: Anyone (public anon) can insert click event, admins can read analytics
CREATE POLICY "Public can log application clicks" ON public.application_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read application clicks" ON public.application_clicks FOR SELECT TO authenticated USING (true);

-- Users: Authenticated can view & modify user profiles
CREATE POLICY "Authenticated users can view profiles" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Audit Logs: Authenticated can view & insert audit logs
CREATE POLICY "Admins can read audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "System/Admins can write audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- ==========================================================
-- SUPABASE STORAGE BUCKETS
-- ==========================================================
-- Insert storage buckets (if not exists)
INSERT INTO storage.buckets (id, name, public) VALUES 
('website-assets', 'website-assets', true),
('application-logos', 'application-logos', true),
('hero-media', 'hero-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies: Public read access
CREATE POLICY "Public read website-assets" ON storage.objects FOR SELECT USING (bucket_id = 'website-assets');
CREATE POLICY "Public read application-logos" ON storage.objects FOR SELECT USING (bucket_id = 'application-logos');
CREATE POLICY "Public read hero-media" ON storage.objects FOR SELECT USING (bucket_id = 'hero-media');

-- Storage RLS Policies: Authenticated write access
CREATE POLICY "Authenticated insert website-assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'website-assets');
CREATE POLICY "Authenticated insert application-logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'application-logos');
CREATE POLICY "Authenticated insert hero-media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'hero-media');
CREATE POLICY "Authenticated update/delete storage" ON storage.objects FOR ALL TO authenticated USING (bucket_id IN ('website-assets', 'application-logos', 'hero-media'));

-- ==========================================================
-- SUPABASE REALTIME REPLICATION SETUP
-- ==========================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.website_profile;
ALTER PUBLICATION supabase_realtime ADD TABLE public.social_links;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hero_media;
ALTER PUBLICATION supabase_realtime ADD TABLE public.internal_applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.official_reporting_apps;
ALTER PUBLICATION supabase_realtime ADD TABLE public.application_clicks;
`;

export function generateSupabaseSchemaSQL(): string {
  return SUPABASE_SQL_SCHEMA;
}

