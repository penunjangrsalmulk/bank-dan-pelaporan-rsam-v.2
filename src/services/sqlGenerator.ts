/**
 * Complete SQL Migration & Seed Script for Supabase PostgreSQL
 * RSUD Al-Mulk Kota Sukabumi - Bank Aplikasi dan Pelaporan Hub
 */
export function generateSupabaseSchemaSQL(): string {
  return `-- ==========================================================
-- BANK APLIKASI DAN PELAPORAN RSUD AL-MULK KOTA SUKABUMI
-- SUPABASE POSTGRESQL COMPLETE DATABASE SCHEMA, RLS & SEED DATA
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
    click_count INTEGER DEFAULT 0,
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
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. CREATE TABLE: application_clicks
CREATE TABLE IF NOT EXISTS public.application_clicks (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    application_id TEXT NOT NULL,
    application_name TEXT NOT NULL,
    application_type TEXT NOT NULL CHECK (application_type IN ('internal', 'official')),
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_agent TEXT,
    referrer TEXT
);

-- 8. CREATE TABLE: audit_logs
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
-- AUTO-MIGRATE COLUMNS (Ensures compatibility with existing tables)
-- ==========================================================
ALTER TABLE public.internal_applications ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;
ALTER TABLE public.internal_applications ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'Seksi Penunjang RS';
ALTER TABLE public.internal_applications ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.internal_applications ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'aktif';

ALTER TABLE public.official_reporting_apps ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;
ALTER TABLE public.official_reporting_apps ADD COLUMN IF NOT EXISTS institution TEXT DEFAULT 'Kementerian Kesehatan RI';
ALTER TABLE public.official_reporting_apps ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.official_reporting_apps ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'aktif';

ALTER TABLE public.website_profile ADD COLUMN IF NOT EXISTS emergency_phone TEXT;
ALTER TABLE public.website_profile ADD COLUMN IF NOT EXISTS service_hours TEXT;

ALTER TABLE public.hero_media ADD COLUMN IF NOT EXISTS overlay_opacity INTEGER DEFAULT 65;
ALTER TABLE public.hero_media ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE public.hero_media ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE public.website_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.official_reporting_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Website Profile Policies
DROP POLICY IF EXISTS "Public can view website profile" ON public.website_profile;
DROP POLICY IF EXISTS "Allow all website profile" ON public.website_profile;
CREATE POLICY "Public can view website profile" ON public.website_profile FOR SELECT USING (true);
CREATE POLICY "Allow all website profile" ON public.website_profile FOR ALL USING (true) WITH CHECK (true);

-- Social Links Policies
DROP POLICY IF EXISTS "Public can view active social links" ON public.social_links;
DROP POLICY IF EXISTS "Allow all social links" ON public.social_links;
CREATE POLICY "Public can view active social links" ON public.social_links FOR SELECT USING (true);
CREATE POLICY "Allow all social links" ON public.social_links FOR ALL USING (true) WITH CHECK (true);

-- Hero Media Policies
DROP POLICY IF EXISTS "Public can view active hero media" ON public.hero_media;
DROP POLICY IF EXISTS "Allow all hero media" ON public.hero_media;
CREATE POLICY "Public can view active hero media" ON public.hero_media FOR SELECT USING (true);
CREATE POLICY "Allow all hero media" ON public.hero_media FOR ALL USING (true) WITH CHECK (true);

-- Internal Applications Policies
DROP POLICY IF EXISTS "Public can view active internal apps" ON public.internal_applications;
DROP POLICY IF EXISTS "Allow all internal apps" ON public.internal_applications;
CREATE POLICY "Public can view active internal apps" ON public.internal_applications FOR SELECT USING (true);
CREATE POLICY "Allow all internal apps" ON public.internal_applications FOR ALL USING (true) WITH CHECK (true);

-- Official Reporting Apps Policies
DROP POLICY IF EXISTS "Public can view active official apps" ON public.official_reporting_apps;
DROP POLICY IF EXISTS "Allow all official apps" ON public.official_reporting_apps;
CREATE POLICY "Public can view active official apps" ON public.official_reporting_apps FOR SELECT USING (true);
CREATE POLICY "Allow all official apps" ON public.official_reporting_apps FOR ALL USING (true) WITH CHECK (true);

-- Application Clicks Policies
DROP POLICY IF EXISTS "Public can log application clicks" ON public.application_clicks;
DROP POLICY IF EXISTS "Allow all application clicks" ON public.application_clicks;
CREATE POLICY "Public can log application clicks" ON public.application_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all application clicks" ON public.application_clicks FOR ALL USING (true);

-- Audit Logs Policies
DROP POLICY IF EXISTS "Allow all audit logs" ON public.audit_logs;
CREATE POLICY "Allow all audit logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- ==========================================================
-- SEED DATA INSERTION (RSUD AL-MULK OFFICIAL DATASET)
-- ==========================================================

-- 1. Seed Website Profile
INSERT INTO public.website_profile (
    id, hospital_name, tagline, description, logo_url, address, phone, emergency_phone, email, website_url, service_hours, updated_at
) VALUES (
    'profile-rsud-almulk-001',
    'RSUD Al-Mulk Kota Sukabumi',
    'Satu Pintu Menuju Ekosistem Digital RSUD Al-Mulk',
    'Satu Pintu Menuju Ekosistem Digital RSUD Al-Mulk - Portal terpusat akses seluruh aplikasi operasional internal rumah sakit dan sistem pelaporan resmi pemerintah.',
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=300&auto=format&fit=crop&q=80',
    'Jl. Pelabuhan II No. 175, Cikondang, Kec. Citamiang, Kota Sukabumi, Jawa Barat 43142',
    '(0266) 243224',
    '(0266) 243225 / IGD 24 Jam',
    'info@rsudalmulk.sukabumikota.go.id',
    'https://rsudalmulk.sukabumikota.go.id',
    'IGD & Rawat Inap: 24 Jam | Rawat Jalan: Senin - Sabtu (07.30 - 14.00 WIB)',
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    hospital_name = EXCLUDED.hospital_name,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    emergency_phone = EXCLUDED.emergency_phone,
    email = EXCLUDED.email,
    website_url = EXCLUDED.website_url,
    service_hours = EXCLUDED.service_hours,
    updated_at = NOW();

-- 2. Seed Social Links
INSERT INTO public.social_links (id, platform, title, url, icon, is_active, display_order) VALUES
('soc-1', 'instagram', 'Instagram Resmi', 'https://instagram.com/rsud_almulk_kotasukabumi', 'Instagram', true, 1),
('soc-2', 'facebook', 'Facebook Fanpage', 'https://facebook.com/rsudalmulkkotasukabumi', 'Facebook', true, 2),
('soc-3', 'youtube', 'YouTube Channel', 'https://youtube.com/@rsudalmulkofficial', 'Youtube', true, 3),
('soc-4', 'tiktok', 'TikTok Edukasi Kesehatan', 'https://tiktok.com/@rsudalmulk', 'Video', true, 4),
('soc-5', 'whatsapp', 'Layanan Informasi & Pengaduan (WhatsApp)', 'https://wa.me/6281234567890', 'MessageCircle', true, 5),
('soc-6', 'website', 'Portal Utama RSUD Al-Mulk', 'https://rsudalmulk.sukabumikota.go.id', 'Globe', true, 6)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    url = EXCLUDED.url,
    icon = EXCLUDED.icon,
    is_active = EXCLUDED.is_active,
    display_order = EXCLUDED.display_order;

-- 3. Seed Hero Media
INSERT INTO public.hero_media (id, title, description, media_type, media_url, thumbnail_url, display_order, is_active, overlay_opacity) VALUES
('hero-1', 'Gedung Pelayanan Terpadu RSUD Al-Mulk', 'Fasilitas kesehatan modern dan humanis untuk masyarakat Kota Sukabumi dan sekitarnya.', 'image', 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=1920&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=300&auto=format&fit=crop&q=80', 1, true, 65),
('hero-2', 'Pelayanan Medis & Laboratorium Canggih', 'Transformasi digital kesehatan untuk percepatan penegakan diagnosis dan efisiensi pelaporan.', 'image', 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1920&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300&auto=format&fit=crop&q=80', 2, true, 70),
('hero-3', 'Digitalisasi Rumah Sakit RSUD Al-Mulk', 'Integrasi penuh rekam medis elektronik (RME) dan ekosistem satu data kesehatan.', 'image', 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1920&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=300&auto=format&fit=crop&q=80', 3, true, 65)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    media_url = EXCLUDED.media_url,
    thumbnail_url = EXCLUDED.thumbnail_url,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    overlay_opacity = EXCLUDED.overlay_opacity;

-- 4. Seed Internal Applications
INSERT INTO public.internal_applications (id, name, slug, description, logo_url, app_url, category, unit, status, display_order, is_featured, click_count) VALUES
('app-int-1', 'SIPAKAR', 'sipakar', 'Sistem Pelaporan Kinerja Seksi Penunjang Rumah Sakit untuk monitoring dan evaluasi layanan penunjang medis & non-medis.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&auto=format&fit=crop&q=80', 'https://sipakar.rsudalmulk.sukabumikota.go.id', 'Pelayanan Penunjang', 'Seksi Penunjang RS', 'aktif', 1, true, 342),
('app-int-2', 'SIMRS Khanza Al-Mulk', 'simrs-khanza-almulk', 'Sistem Informasi Manajemen Rumah Sakit Utama (SIMRS) mencakup Rawat Jalan, Rawat Inap, IGD, Radiologi, Laboratorium, dan Billing.', 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=200&auto=format&fit=crop&q=80', 'https://simrs.rsudalmulk.sukabumikota.go.id', 'Pelayanan Medis dan Keperawatan', 'Instalasi TI & SIMRS', 'aktif', 2, true, 512),
('app-int-3', 'E-RESEP & FARMASI DIGITAL', 'e-resep-farmasi-digital', 'Modul resep elektronik terpadu dokter, telaah obat apoteker, dan monitoring ketersediaan obat depo farmasi secara real-time.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&auto=format&fit=crop&q=80', 'https://farmasi.rsudalmulk.sukabumikota.go.id', 'Pelayanan Penunjang', 'Instalasi Farmasi', 'aktif', 3, false, 289),
('app-int-4', 'SI-MUTU AL-MULK', 'si-mutu-almulk', 'Sistem Pengukuran & Pelaporan Indikator Mutu Nasional (INM) dan Indikator Mutu Unit Kerja RSUD Al-Mulk.', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&auto=format&fit=crop&q=80', 'https://mutu.rsudalmulk.sukabumikota.go.id', 'Pelayanan Medis dan Keperawatan', 'Komite Mutu & Keselamatan Pasien', 'aktif', 4, false, 178),
('app-int-5', 'SI-KEP RSAM (Kepegawaian)', 'si-kep-rsam', 'Sistem Informasi Kepegawaian, Presensi Digital Geotagging, Logbook Harian Pegawai, dan Manajemen Cuti ASN & Non-ASN.', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop&q=80', 'https://kepegawaian.rsudalmulk.sukabumikota.go.id', 'Penatausahaan, Kepegawaian, Perencanaan, dan Keuangan', 'Subbag Kepegawaian & Tata Usaha', 'aktif', 5, false, 420),
('app-int-6', 'E-LOGISTIK & BMHP', 'e-logistik-bmhp', 'Pengelolaan stok persediaan barang farmasi, bahan medis habis pakai (BMHP), dan inventaris barang non-medis.', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&auto=format&fit=crop&q=80', 'https://logistik.rsudalmulk.sukabumikota.go.id', 'Pelayanan Penunjang', 'Gudang Farmasi & Logistik', 'aktif', 6, false, 145),
('app-int-7', 'LAPOR-MULK (SI-ADU)', 'lapor-mulk-si-adu', 'Portal Pelayanan dan Pengaduan Pasien / Masyarakat Terpadu RSUD Al-Mulk untuk respon cepat komplain dan survei kepuasan.', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&auto=format&fit=crop&q=80', 'https://pengaduan.rsudalmulk.sukabumikota.go.id', 'Penatausahaan, Kepegawaian, Perencanaan, dan Keuangan', 'Humas & Pengaduan', 'aktif', 7, false, 198),
('app-int-8', 'SI-BED REALTIME AL-MULK', 'si-bed-realtime', 'Dashboard informasi ketersediaan tempat tidur (bed occupancy rate) ruang rawat inap dan isolasi secara realtime.', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200&auto=format&fit=crop&q=80', 'https://bed.rsudalmulk.sukabumikota.go.id', 'Pelayanan Medis dan Keperawatan', 'Admission & Rawat Inap', 'aktif', 8, false, 310),
('app-int-9', 'E-SURAT & ARSIP DINAS', 'e-surat-arsip-dinas', 'Aplikasi pengelolaan naskah dinas elektronik, penomoran surat otomatis, disposisi digital pimpinan, dan kearsipan.', 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=200&auto=format&fit=crop&q=80', 'https://surat.rsudalmulk.sukabumikota.go.id', 'Penatausahaan, Kepegawaian, Perencanaan, dan Keuangan', 'Bagian Tata Usaha', 'aktif', 9, false, 165),
('app-int-10', 'SIP-JALAN (Daftar Pasien)', 'sip-jalan-daftar-online', 'Sistem Informasi Pendaftaran Online Pasien Poliklinik Rawat Jalan dan Anjungan Pasien Mandiri (APM).', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=200&auto=format&fit=crop&q=80', 'https://daftar.rsudalmulk.sukabumikota.go.id', 'Pelayanan Medis dan Keperawatan', 'Instalasi Rawat Jalan', 'aktif', 10, false, 489)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    logo_url = EXCLUDED.logo_url,
    app_url = EXCLUDED.app_url,
    category = EXCLUDED.category,
    unit = EXCLUDED.unit,
    status = EXCLUDED.status,
    display_order = EXCLUDED.display_order,
    is_featured = EXCLUDED.is_featured;

-- 5. Seed Official Reporting Apps
INSERT INTO public.official_reporting_apps (id, name, slug, description, logo_url, app_url, institution, category, status, display_order, is_featured, click_count) VALUES
('app-off-1', 'SIRS Online (R1 - R5 Kemenkes)', 'sirs-online-kemenkes', 'Sistem Informasi Rumah Sakit Kemenkes RI untuk pelaporan data dasar, ketenagaan, fasilitas tempat tidur, dan morbiditas/mortalitas pasien.', 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200&auto=format&fit=crop&q=80', 'https://sirs.kemkes.go.id', 'Kementerian Kesehatan RI', 'Pelaporan Rutin', 'aktif', 1, true, 388),
('app-off-2', 'SISRUTE (Rujukan Terintegrasi)', 'sisrute-kemenkes', 'Sistem Informasi Rujukan Terintegrasi berbasis internet yang menghubungkan data pasien dari tingkat pertama ke tingkat lanjutan dan antar faskes.', 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=200&auto=format&fit=crop&q=80', 'https://sisrute.kemkes.go.id', 'Kementerian Kesehatan RI', 'Rujukan & Transfer', 'aktif', 1, true, 412),
('app-off-3', 'BPJS V-Claim & SEP', 'bpjs-vclaim-sep', 'Aplikasi Penerbitan Surat Eligibilitas Peserta (SEP) dan verifikasi klaim BPJS Kesehatan secara daring untuk pasien rawat jalan & inap.', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&auto=format&fit=crop&q=80', 'https://vclaim.bpjs-kesehatan.go.id', 'BPJS Kesehatan', 'JKN & Klaim', 'aktif', 3, true, 670),
('app-off-4', 'ASPAK Kemenkes', 'aspak-kemenkes', 'Aplikasi Sarana, Prasarana dan Alat Kesehatan untuk pemetaan fasilitas dan kelayakan izin operasional rumah sakit.', 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=200&auto=format&fit=crop&q=80', 'https://aspak.kemkes.go.id', 'Kementerian Kesehatan RI', 'Sarana & Alkes', 'aktif', 4, false, 215),
('app-off-5', 'E-Klaim INA-CBGs', 'e-klaim-ina-cbgs', 'Sistem pengelompokan tarif pelayanan kesehatan berbasis casemix untuk penagihan pembiayaan Jaminan Kesehatan Nasional.', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=200&auto=format&fit=crop&q=80', 'https://inacbg.kemkes.go.id', 'Kementerian Kesehatan RI', 'JKN & Klaim', 'aktif', 5, false, 340),
('app-off-6', 'SPGDT 119 Kota Sukabumi', 'spgdt-119-sukabumi', 'Sistem Penanggulangan Gawat Darurat Terpadu Dinas Kesehatan Kota Sukabumi untuk koordinasi ambulans dan penanganan darurat pra-faskes.', 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=200&auto=format&fit=crop&q=80', 'https://spgdt.sukabumikota.go.id', 'Dinas Kesehatan Kota Sukabumi', 'Kegawatdaruratan', 'aktif', 6, false, 185),
('app-off-7', 'SKDR Jabar (Kewaspadaan Dini)', 'skdr-dinkes-jabar', 'Sistem Kewaspadaan Dini dan Respon Penyakit Berpotensi KLB (Kejadian Luar Biasa) Dinas Kesehatan Provinsi Jawa Barat.', 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=200&auto=format&fit=crop&q=80', 'https://skdr.surveilans.org', 'Dinas Kesehatan Provinsi Jawa Barat', 'Surveilans Penyakit', 'aktif', 7, false, 132),
('app-off-8', 'HFIS BPJS Kesehatan', 'hfis-bpjs-kesehatan', 'Health Facilities Information System untuk profil faskes, updating dokter spesialis, jadwal poli, dan sarana kredensialing BPJS.', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&auto=format&fit=crop&q=80', 'https://hfis.bpjs-kesehatan.go.id', 'BPJS Kesehatan', 'Kredensialing & Profil', 'aktif', 8, false, 220),
('app-off-9', 'SATUSEHAT Kemenkes RI', 'satusehat-kemenkes', 'Platform integrasi data rekam medis elektronik (RME) faskes dengan Ekosistem Satu Data Kesehatan Nasional Kementerian Kesehatan RI.', 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200&auto=format&fit=crop&q=80', 'https://satusehat.kemkes.go.id', 'Kementerian Kesehatan RI', 'Integrasi RME Nasional', 'aktif', 9, true, 530),
('app-off-10', 'SIASN BKN', 'siasn-bkn', 'Sistem Informasi Aparatur Sipil Negara Badan Kepegawaian Negara untuk kenaikan pangkat, mutasi, dan pensiun pegawai RSUD Al-Mulk.', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&auto=format&fit=crop&q=80', 'https://siasn.bkn.go.id', 'Kementerian / Lembaga Lain', 'Kepegawaian Negara', 'aktif', 10, false, 195)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    logo_url = EXCLUDED.logo_url,
    app_url = EXCLUDED.app_url,
    institution = EXCLUDED.institution,
    category = EXCLUDED.category,
    status = EXCLUDED.status,
    display_order = EXCLUDED.display_order,
    is_featured = EXCLUDED.is_featured;

-- ==========================================================
-- SUPABASE REALTIME REPLICATION SETUP
-- ==========================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'website_profile'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.website_profile;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'social_links'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.social_links;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'hero_media'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.hero_media;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'internal_applications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.internal_applications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'official_reporting_apps'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.official_reporting_apps;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'application_clicks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.application_clicks;
  END IF;
END $$;
`;
}
