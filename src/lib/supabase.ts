import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables support for Vite & Next.js
const metaEnv = (import.meta as any).env || {};
const ENV_SUPABASE_URL = 
  metaEnv.VITE_SUPABASE_URL || 
  metaEnv.NEXT_PUBLIC_SUPABASE_URL || 
  '';

const ENV_SUPABASE_ANON_KEY = 
  metaEnv.VITE_SUPABASE_ANON_KEY || 
  metaEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  '';


// Local storage keys for custom runtime configuration in Admin UI
const STORAGE_URL_KEY = 'rsud_almulk_supabase_url';
const STORAGE_KEY_KEY = 'rsud_almulk_supabase_anon_key';

/**
 * Normalizes user-inputted Supabase URL:
 * - Strips quotes, spaces, trailing slashes
 * - Strips invalid subpaths like /rest/v1, /rest, /auth/v1, etc.
 * - Extracts project URL if user accidentally pasted dashboard URL (supabase.com/dashboard/project/...)
 * - Guarantees format: https://<ref>.supabase.co
 */
export function normalizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let cleaned = rawUrl.trim();

  // Strip wrapping quotes
  cleaned = cleaned.replace(/^['"]+|['"]+$/g, '').trim();

  // Handle Supabase Dashboard URL: https://supabase.com/dashboard/project/xyz/...
  const dashboardMatch = cleaned.match(/supabase\.com\/dashboard\/project\/([a-zA-Z0-9_-]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // Ensure protocol is present
  if (cleaned && !/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }

  try {
    const parsed = new URL(cleaned);
    // Standard Supabase endpoint host: <ref>.supabase.co
    if (parsed.hostname.endsWith('.supabase.co')) {
      return `https://${parsed.hostname}`;
    }
    
    // For custom domain or local self-hosted instance:
    let pathname = parsed.pathname.replace(/\/+(rest|auth|storage|graphql)?(\/v\d+)?\/?$/i, '');
    pathname = pathname.replace(/\/+$/, '');
    return `${parsed.protocol}//${parsed.host}${pathname}`;
  } catch {
    // Fallback regex cleanup if URL constructor throws
    cleaned = cleaned.replace(/\/+(rest|auth|storage|graphql)?(\/v\d+)?\/?$/i, '');
    cleaned = cleaned.replace(/\/+$/, '');
    return cleaned;
  }
}

/**
 * Normalizes Supabase API key:
 * - Strips quotes, spaces, and accidental Bearer prefix
 */
export function normalizeSupabaseKey(rawKey: string): string {
  if (!rawKey || typeof rawKey !== 'string') return '';
  let cleaned = rawKey.trim();
  cleaned = cleaned.replace(/^['"]+|['"]+$/g, '').trim();
  cleaned = cleaned.replace(/^Bearer\s+/i, '').trim();
  return cleaned;
}

/**
 * Extracts the Supabase project reference id (if using standard supabase.co host)
 */
export function getSupabaseProjectRef(): string | null {
  const { url } = getSupabaseCredentials();
  const match = url.match(/https?:\/\/([a-zA-Z0-9_-]+)\.supabase\.co/i);
  return match ? match[1] : null;
}

export function getSupabaseCredentials(): { url: string; anonKey: string; isConfigured: boolean } {
  const customUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_URL_KEY) || '' : '';
  const customKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) || '' : '';

  const rawUrl = customUrl || ENV_SUPABASE_URL || '';
  const rawKey = customKey || ENV_SUPABASE_ANON_KEY || '';

  const url = normalizeSupabaseUrl(rawUrl);
  const anonKey = normalizeSupabaseKey(rawKey);

  // Auto-heal dirty localStorage values on-the-fly
  if (typeof window !== 'undefined') {
    if (customUrl && customUrl !== url) {
      localStorage.setItem(STORAGE_URL_KEY, url);
    }
    if (customKey && customKey !== anonKey) {
      localStorage.setItem(STORAGE_KEY_KEY, anonKey);
    }
  }

  // Basic validation that looks like a real Supabase endpoint
  const isConfigured = Boolean(
    url && 
    anonKey && 
    url.startsWith('http') && 
    !url.includes('your-project.supabase.co') &&
    anonKey.length > 20
  );

  return { url, anonKey, isConfigured };
}

export function isSupabaseConfigured(): boolean {
  const { isConfigured } = getSupabaseCredentials();
  return isConfigured;
}

export function saveCustomSupabaseCredentials(rawUrl: string, rawKey: string): void {
  const url = normalizeSupabaseUrl(rawUrl);
  const anonKey = normalizeSupabaseKey(rawKey);

  if (typeof window !== 'undefined') {
    if (url) {
      localStorage.setItem(STORAGE_URL_KEY, url);
    } else {
      localStorage.removeItem(STORAGE_URL_KEY);
    }

    if (anonKey) {
      localStorage.setItem(STORAGE_KEY_KEY, anonKey);
    } else {
      localStorage.removeItem(STORAGE_KEY_KEY);
    }
  }

  // Invalidate cache so subsequent calls use fresh client
  cachedClient = null;
  lastUrl = '';
  lastKey = '';
}

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();

  if (!isConfigured) {
    return null;
  }

  if (cachedClient && lastUrl === url && lastKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    lastUrl = url;
    lastKey = anonKey;
    return cachedClient;
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
    return null;
  }
}

export interface SupabaseConnectionTestResult {
  connected: boolean;
  tablesReady: boolean;
  message: string;
  counts?: {
    website_profile: number;
    internal_applications: number;
    official_reporting_apps: number;
    hero_media: number;
    social_links: number;
  };
  details?: string;
}

export async function testSupabaseConnection(): Promise<SupabaseConnectionTestResult> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      tablesReady: false,
      message: 'Supabase belum terkonfigurasi. Masukkan URL dan Anon Key terlebih dahulu.'
    };
  }

  try {
    // 1. Test basic table access
    const [profileRes, intRes, offRes, heroRes, socRes] = await Promise.all([
      client.from('website_profile').select('id', { count: 'exact', head: false }).limit(1),
      client.from('internal_applications').select('id', { count: 'exact', head: false }),
      client.from('official_reporting_apps').select('id', { count: 'exact', head: false }),
      client.from('hero_media').select('id', { count: 'exact', head: false }),
      client.from('social_links').select('id', { count: 'exact', head: false })
    ]);

    if (profileRes.error) {
      const errMsg = profileRes.error.message || '';
      const isInvalidPath = errMsg.includes('Invalid path') || profileRes.error.code === 'PGRST126';
      const isTableMissing = errMsg.includes('does not exist') || profileRes.error.code === 'PGRST205' || isInvalidPath;

      return {
        connected: !isInvalidPath,
        tablesReady: false,
        message: isTableMissing
          ? `Tabel database di Supabase belum dibuat (${errMsg}). Jalankan Skrip SQL di SQL Editor Supabase terlebih dahulu.`
          : `Koneksi Supabase aktif, namun tabel belum siap: ${errMsg}`,
        details: 'Salin Skrip SQL di menu "Supabase Database & SQL", lalu jalankan di Supabase Dashboard → SQL Editor.'
      };
    }

    const counts = {
      website_profile: profileRes.data ? profileRes.data.length : (profileRes.count || 0),
      internal_applications: intRes.data ? intRes.data.length : (intRes.count || 0),
      official_reporting_apps: offRes.data ? offRes.data.length : (offRes.count || 0),
      hero_media: heroRes.data ? heroRes.data.length : (heroRes.count || 0),
      social_links: socRes.data ? socRes.data.length : (socRes.count || 0)
    };

    const isTablesEmpty = counts.internal_applications === 0 && counts.official_reporting_apps === 0;

    return {
      connected: true,
      tablesReady: true,
      message: isTablesEmpty 
        ? 'Terkoneksi ke Supabase, namun tabel masih kosong (0 data). Lakukan sinkronisasi data sekarang.'
        : 'Terkoneksi dan terintegrasi penuh ke Cloud Database Supabase!',
      counts
    };
  } catch (err: any) {
    return {
      connected: false,
      tablesReady: false,
      message: `Gagal terhubung ke Supabase: ${err.message || 'Network error'}`
    };
  }
}

/**
 * Validates URL safety (Prevents javascript:, data:, vbscript: XSS vectors)
 */
export function isSafeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return true;
  }
  // Allow internal anchors or root paths
  if (trimmed.startsWith('#') || trimmed.startsWith('/')) {
    return true;
  }
  return false;
}
