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

export function getSupabaseCredentials(): { url: string; anonKey: string; isConfigured: boolean } {
  const customUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_URL_KEY) || '' : '';
  const customKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) || '' : '';

  const url = customUrl.trim() || ENV_SUPABASE_URL.trim();
  const anonKey = customKey.trim() || ENV_SUPABASE_ANON_KEY.trim();

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

export function saveCustomSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem(STORAGE_URL_KEY, url.trim());
    } else {
      localStorage.removeItem(STORAGE_URL_KEY);
    }

    if (anonKey.trim()) {
      localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_KEY);
    }
  }
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
