export interface WebsiteProfile {
  id: string;
  hospital_name: string;
  tagline: string;
  description: string;
  logo_url: string;
  address: string;
  phone: string;
  email: string;
  website_url: string;
  service_hours?: string;
  emergency_phone?: string;
  updated_at: string;
}

export interface SocialLink {
  id: string;
  platform: 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'whatsapp' | 'website';
  title: string;
  url: string;
  icon: string;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface HeroMedia {
  id: string;
  title: string;
  description?: string;
  media_type: 'image' | 'video' | 'slideshow';
  media_url: string;
  thumbnail_url?: string;
  display_order: number;
  is_active: boolean;
  overlay_opacity: number; // 0 to 100
  created_at: string;
  updated_at: string;
}

export type ApplicationStatus = 'aktif' | 'maintenance' | 'nonaktif';

export interface InternalApplication {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  app_url: string;
  category: string; // e.g. Manajemen, Pelayanan, Kepegawaian, Penunjang, Mutu, Humas, Pengaduan, Pelaporan, Administrasi
  unit: string; // e.g. Seksi Penunjang, Rekam Medis, Farmasi, Kepegawaian, Pelayanan Medis
  status: ApplicationStatus;
  display_order: number;
  is_featured: boolean;
  click_count?: number;
  created_at: string;
  updated_at: string;
}

export interface OfficialReportingApp {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  app_url: string;
  institution: string; // e.g. Kementerian Kesehatan RI, BPJS Kesehatan, Dinkes Kota Sukabumi, Dinkes Jawa Barat, KPK, BKN
  category: string; // e.g. Pelaporan Rutin, Rujukan, JKN & Klaim, Sarana & Alkes, Kepegawaian Negara
  status: ApplicationStatus;
  display_order: number;
  is_featured: boolean;
  click_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ApplicationClick {
  id: string;
  application_id: string;
  application_name: string;
  application_type: 'internal' | 'official';
  clicked_at: string;
  user_agent?: string;
  referrer?: string;
}

export type UserRole = 'superadmin' | 'admin' | 'operator' | 'super_admin' | 'seksi_penunjang' | 'admin_rs' | 'viewer';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  unit?: string;
  is_active?: boolean;
  last_login?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
  table_name: string;
  record_id?: string;
  old_data?: any;
  new_data?: any;
  created_at: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastChecked?: string;
}
