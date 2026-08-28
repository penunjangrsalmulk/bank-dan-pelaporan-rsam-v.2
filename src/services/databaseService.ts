import { getSupabaseClient, getSupabaseCredentials } from '../lib/supabase';
import {
  WebsiteProfile,
  SocialLink,
  HeroMedia,
  InternalApplication,
  OfficialReportingApp,
  ApplicationClick,
  AppUser,
  AuditLog
} from '../types/database';
import {
  INITIAL_WEBSITE_PROFILE,
  INITIAL_SOCIAL_LINKS,
  INITIAL_HERO_MEDIA,
  INITIAL_INTERNAL_APPS,
  INITIAL_OFFICIAL_APPS,
  INITIAL_ADMIN_USERS
} from './seedData';
import {
  saveHeroMediaToIndexedDB,
  getHeroMediaFromIndexedDB,
  deleteHeroMediaFromIndexedDB,
  saveMediaBlobToIndexedDB,
  getMediaBlobFromIndexedDB
} from '../lib/indexedDbStorage';

// Local storage backup keys
const KEYS = {
  PROFILE: 'rsud_almulk_data_profile',
  SOCIAL: 'rsud_almulk_data_social',
  HERO: 'rsud_almulk_data_hero',
  INTERNAL: 'rsud_almulk_data_internal',
  OFFICIAL: 'rsud_almulk_data_official',
  CLICKS: 'rsud_almulk_data_clicks',
  USERS: 'rsud_almulk_data_users',
  AUDIT: 'rsud_almulk_data_audit',
  INITIALIZED: 'rsud_almulk_initialized_v2'
};

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB strictly enforced

// In-memory runtime cache for large media (e.g. video files / high-res assets) to bypass browser localStorage 5MB limit
const RUNTIME_MEDIA_STORE = new Map<string, string>();

// Helper for broadcasting updates locally when offline/hybrid
export const DATA_UPDATED_EVENT = 'rsud_almulk_data_updated';
export function notifyDataChange(entity: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DATA_UPDATED_EVENT, { detail: { entity } }));
  }
}

export function subscribeToDataChanges(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback();
  window.addEventListener(DATA_UPDATED_EVENT, handler);
  return () => window.removeEventListener(DATA_UPDATED_EVENT, handler);
}

/**
 * Safe local storage setter to prevent QuotaExceededError crashes with large videos/images
 */
export function safeSetLocalStorage(key: string, data: any): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`LocalStorage quota reached for key: ${key}. Storing lightweight references:`, err);
    try {
      if (Array.isArray(data)) {
        const optimized = data.map((item: any) => {
          if (item && item.id && item.media_url && item.media_url.length > 50000) {
            RUNTIME_MEDIA_STORE.set(item.id, item.media_url);
            return {
              ...item,
              media_url: item.media_url.startsWith('http') || item.media_url.startsWith('blob:') 
                ? item.media_url 
                : item.media_url.substring(0, 100)
            };
          }
          return item;
        });
        localStorage.setItem(key, JSON.stringify(optimized));
      }
    } catch (fallbackErr) {
      console.warn('Fallback storage warning:', fallbackErr);
    }
  }
}

// Local storage init
function initLocalStorage() {
  if (typeof window === 'undefined') return;
  const isInit = localStorage.getItem(KEYS.INITIALIZED);
  if (!isInit) {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(INITIAL_WEBSITE_PROFILE));
    localStorage.setItem(KEYS.SOCIAL, JSON.stringify(INITIAL_SOCIAL_LINKS));
    localStorage.setItem(KEYS.HERO, JSON.stringify(INITIAL_HERO_MEDIA));
    localStorage.setItem(KEYS.INTERNAL, JSON.stringify(INITIAL_INTERNAL_APPS));
    localStorage.setItem(KEYS.OFFICIAL, JSON.stringify(INITIAL_OFFICIAL_APPS));
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_ADMIN_USERS));
    localStorage.setItem(KEYS.CLICKS, JSON.stringify([]));
    localStorage.setItem(KEYS.AUDIT, JSON.stringify([
      {
        id: 'audit-001',
        action: 'CREATE',
        table_name: 'website_profile',
        user_email: 'admin.rsam@sukabumikota.go.id',
        created_at: new Date().toISOString(),
        new_data: { note: 'Inisialisasi sistem portal RSUD Al-Mulk' }
      }
    ]));
    localStorage.setItem(KEYS.INITIALIZED, 'true');
  }
}

initLocalStorage();

// Helper to log audit
export async function logAudit(
  action: AuditLog['action'],
  tableName: string,
  recordId?: string,
  oldData?: any,
  newData?: any,
  userEmail: string = 'admin.rsam@sukabumikota.go.id'
) {
  const auditEntry: AuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    user_email: userEmail,
    action,
    table_name: tableName,
    record_id: recordId,
    old_data: oldData,
    new_data: newData,
    created_at: new Date().toISOString()
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('audit_logs').insert([auditEntry]);
    } catch (e) {
      console.warn('Failed to push audit log to Supabase:', e);
    }
  }

  // Always save in local history
  try {
    const raw = localStorage.getItem(KEYS.AUDIT);
    const list: AuditLog[] = raw ? JSON.parse(raw) : [];
    list.unshift(auditEntry);
    safeSetLocalStorage(KEYS.AUDIT, list.slice(0, 100));
  } catch (e) {
    console.error('Audit local log error', e);
  }
}

// ----------------------------------------------------
// 1. WEBSITE PROFILE SERVICE
// ----------------------------------------------------
export async function getWebsiteProfile(): Promise<WebsiteProfile> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('website_profile')
        .select('*')
        .eq('id', 'profile-rsud-almulk-001')
        .single();
      if (!error && data) {
        safeSetLocalStorage(KEYS.PROFILE, data);
        return data as WebsiteProfile;
      }
    } catch (e) {
      console.warn('Supabase getWebsiteProfile fallback to local', e);
    }
  }

  const raw = localStorage.getItem(KEYS.PROFILE);
  return raw ? JSON.parse(raw) : INITIAL_WEBSITE_PROFILE;
}

export async function updateWebsiteProfile(profile: WebsiteProfile, userEmail?: string): Promise<WebsiteProfile> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('website_profile').upsert(profile);
    } catch (e) {
      console.warn('Failed to update Supabase website profile', e);
    }
  }

  safeSetLocalStorage(KEYS.PROFILE, profile);
  await logAudit('UPDATE', 'website_profile', profile.id, null, profile, userEmail);
  notifyDataChange('profile');
  return profile;
}

// ----------------------------------------------------
// 2. SOCIAL LINKS SERVICE
// ----------------------------------------------------
export async function getSocialLinks(): Promise<SocialLink[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('social_links')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) {
        safeSetLocalStorage(KEYS.SOCIAL, data);
        return data as SocialLink[];
      }
    } catch (e) {
      console.warn('Supabase getSocialLinks fallback to local', e);
    }
  }

  const raw = localStorage.getItem(KEYS.SOCIAL);
  return raw ? JSON.parse(raw) : INITIAL_SOCIAL_LINKS;
}

export async function saveSocialLinks(links: SocialLink[], userEmail?: string): Promise<SocialLink[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('social_links').upsert(links);
    } catch (e) {
      console.warn('Failed to upsert social links', e);
    }
  }

  safeSetLocalStorage(KEYS.SOCIAL, links);
  await logAudit('UPDATE', 'social_links', 'bulk', null, { count: links.length }, userEmail);
  notifyDataChange('social');
  return links;
}

// ----------------------------------------------------
// 3. HERO MEDIA SERVICE & SUPABASE STORAGE UPLOAD
// ----------------------------------------------------
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload application logo with 5MB strict limit
 */
export async function uploadApplicationLogoFile(file: File, userEmail?: string): Promise<string> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`Ukuran file logo (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas maksimal 5 MB.`);
  }

  const client = getSupabaseClient();
  let logoUrl = '';

  // 1. Try Supabase Storage upload if bucket exists
  if (client) {
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
      const safeName = file.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 15);
      const filePath = `logos/${Date.now()}_${safeName}.${fileExt}`;

      const { data, error } = await client.storage
        .from('application-logos')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (!error && data) {
        const { data: publicUrlData } = client.storage.from('application-logos').getPublicUrl(filePath);
        if (publicUrlData?.publicUrl) {
          logoUrl = publicUrlData.publicUrl;
        }
      }
    } catch (e) {
      console.warn('Supabase logo storage notice, using data URL fallback:', e);
    }
  }

  // 2. Data URL fallback
  if (!logoUrl) {
    logoUrl = await readFileAsDataUrl(file);
  }

  return logoUrl;
}

/**
 * Upload Hero Media (Photo or MP4/WebM Video) with 5 MB strict limit, IndexedDB persistence & Supabase sync
 */
export async function uploadHeroMediaFile(
  file: File, 
  title: string, 
  mediaType: 'image' | 'video' = 'image', 
  overlayOpacity: number = 65,
  userEmail?: string
): Promise<HeroMedia> {
  // Enforce 5 MB maximum size limit
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`Ukuran file media (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas maksimal 5 MB. Harap pilih file di bawah 5 MB.`);
  }

  const client = getSupabaseClient();
  let mediaUrl = '';
  const newId = `hero-${Date.now()}`;

  // 1. Read the full file as Data URL to guarantee offline/refresh persistence
  const fileDataUrl = await readFileAsDataUrl(file);

  // 2. Attempt Supabase Storage Upload if connected
  if (client) {
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || (mediaType === 'video' ? 'mp4' : 'jpg');
      const safeName = file.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
      const filePath = `hero/${Date.now()}_${safeName}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await client.storage
        .from('hero-media')
        .upload(filePath, file, {
          contentType: file.type || (mediaType === 'video' ? 'video/mp4' : 'image/jpeg'),
          cacheControl: '3600',
          upsert: true
        });

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = client.storage
          .from('hero-media')
          .getPublicUrl(filePath);
        
        if (publicUrlData?.publicUrl) {
          mediaUrl = publicUrlData.publicUrl;
        }
      } else {
        console.warn('Supabase storage upload notice:', uploadError?.message);
      }
    } catch (storageErr) {
      console.warn('Supabase storage upload error, fallback to data url:', storageErr);
    }
  }

  // If no cloud storage URL, use the persistent Data URL
  if (!mediaUrl) {
    mediaUrl = fileDataUrl;
  }

  // Store in persistent IndexedDB storage (will survive all page reloads)
  await saveMediaBlobToIndexedDB(newId, fileDataUrl);
  RUNTIME_MEDIA_STORE.set(newId, mediaUrl);

  const existing = await getHeroMedia();
  const newMedia: HeroMedia = {
    id: newId,
    title: title.trim() || file.name.replace(/\.[^/.]+$/, ''),
    description: `Media ${mediaType.toUpperCase()} diunggah pada ${new Date().toLocaleDateString('id-ID')}`,
    media_type: mediaType,
    media_url: mediaUrl,
    thumbnail_url: mediaType === 'video' ? 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=300' : mediaUrl,
    display_order: existing.length + 1,
    is_active: true,
    overlay_opacity: overlayOpacity,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const updatedList = [...existing, newMedia];

  // 3. Save to IndexedDB permanent store
  await saveHeroMediaToIndexedDB(updatedList);

  // 4. Save to Supabase Table (if connected)
  if (client) {
    try {
      await client.from('hero_media').insert([newMedia]);
    } catch (dbErr) {
      console.warn('Supabase hero_media insert notice:', dbErr);
    }
  }

  // 5. Save to lightweight local storage for quick sync
  safeSetLocalStorage(KEYS.HERO, updatedList);
  await logAudit('CREATE', 'hero_media', newId, null, { title: newMedia.title, type: mediaType, sizeMB: (file.size / (1024 * 1024)).toFixed(2) }, userEmail);
  notifyDataChange('hero');

  return newMedia;
}

export async function getHeroMedia(): Promise<HeroMedia[]> {
  // 1. Try Supabase if connected
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('hero_media')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) {
        // Hydrate from runtime store or IndexedDB if needed
        const hydrated = await Promise.all(data.map(async (item: HeroMedia) => {
          if (RUNTIME_MEDIA_STORE.has(item.id)) {
            return { ...item, media_url: RUNTIME_MEDIA_STORE.get(item.id)! };
          }
          const blob = await getMediaBlobFromIndexedDB(item.id);
          if (blob) {
            RUNTIME_MEDIA_STORE.set(item.id, blob);
            return { ...item, media_url: blob };
          }
          return item;
        }));
        await saveHeroMediaToIndexedDB(hydrated);
        safeSetLocalStorage(KEYS.HERO, hydrated);
        return hydrated as HeroMedia[];
      }
    } catch (e) {
      console.warn('Supabase getHeroMedia fallback', e);
    }
  }

  // 2. Try IndexedDB persistent store (Primary local persistence for large videos & images)
  try {
    const idbMedia = await getHeroMediaFromIndexedDB();
    if (idbMedia && Array.isArray(idbMedia) && idbMedia.length > 0) {
      // Re-hydrate any items with media blobs if needed
      const hydrated = await Promise.all(idbMedia.map(async (item) => {
        if (!item.media_url || item.media_url.length < 150) {
          const blob = await getMediaBlobFromIndexedDB(item.id);
          if (blob) {
            RUNTIME_MEDIA_STORE.set(item.id, blob);
            return { ...item, media_url: blob };
          }
        }
        if (item.media_url) {
          RUNTIME_MEDIA_STORE.set(item.id, item.media_url);
        }
        return item;
      }));
      return hydrated;
    }
  } catch (idbErr) {
    console.warn('IndexedDB read fallback:', idbErr);
  }

  // 3. Fallback to LocalStorage
  const raw = typeof window !== 'undefined' ? localStorage.getItem(KEYS.HERO) : null;
  if (raw) {
    try {
      const parsed: HeroMedia[] = JSON.parse(raw);
      const hydrated = await Promise.all(parsed.map(async (item) => {
        if (RUNTIME_MEDIA_STORE.has(item.id)) {
          return { ...item, media_url: RUNTIME_MEDIA_STORE.get(item.id)! };
        }
        const blob = await getMediaBlobFromIndexedDB(item.id);
        if (blob) {
          RUNTIME_MEDIA_STORE.set(item.id, blob);
          return { ...item, media_url: blob };
        }
        return item;
      }));
      // Sync back into IndexedDB so it's cached permanently
      saveHeroMediaToIndexedDB(hydrated);
      return hydrated;
    } catch {
      return INITIAL_HERO_MEDIA;
    }
  }

  // 4. Default Seed Data
  saveHeroMediaToIndexedDB(INITIAL_HERO_MEDIA);
  return INITIAL_HERO_MEDIA;
}

export async function saveHeroMedia(mediaList: HeroMedia[], userEmail?: string): Promise<HeroMedia[]> {
  // 1. Save to IndexedDB immediately to guarantee permanent persistence
  await saveHeroMediaToIndexedDB(mediaList);

  // 2. Cache full URLs in RUNTIME_MEDIA_STORE and save blobs
  for (const item of mediaList) {
    if (item.media_url && item.media_url.startsWith('data:')) {
      await saveMediaBlobToIndexedDB(item.id, item.media_url);
      RUNTIME_MEDIA_STORE.set(item.id, item.media_url);
    }
  }

  // 3. Save to Supabase (if connected)
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('hero_media').upsert(mediaList);
    } catch (e) {
      console.warn('Failed to upsert hero media', e);
    }
  }

  // 4. Safe LocalStorage sync
  safeSetLocalStorage(KEYS.HERO, mediaList);
  await logAudit('UPDATE', 'hero_media', 'bulk', null, { count: mediaList.length }, userEmail);
  notifyDataChange('hero');
  return mediaList;
}

export async function deleteHeroMedia(id: string, userEmail?: string): Promise<void> {
  // 1. Delete from IndexedDB
  await deleteHeroMediaFromIndexedDB(id);
  RUNTIME_MEDIA_STORE.delete(id);

  // 2. Update list
  const list = await getHeroMedia();
  const filtered = list.filter(m => m.id !== id);

  // 3. Delete from Supabase (if connected)
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('hero_media').delete().eq('id', id);
    } catch (e) {
      console.warn('Failed delete hero media from Supabase', e);
    }
  }

  // 4. Update IndexedDB & LocalStorage
  await saveHeroMediaToIndexedDB(filtered);
  safeSetLocalStorage(KEYS.HERO, filtered);
  await logAudit('DELETE', 'hero_media', id, null, null, userEmail);
  notifyDataChange('hero');
}

// ----------------------------------------------------
// 4. INTERNAL APPLICATIONS CRUD
// ----------------------------------------------------
function normalizeInternalCategory(cat: string): string {
  if (!cat) return 'Pelayanan Medis dan Keperawatan';
  if (cat === 'Pelayanan Medis dan Keperawatan' || cat === 'Pelayanan Penunjang' || cat === 'Penatausahaan, Kepegawaian, Perencanaan, dan Keuangan') {
    return cat;
  }
  if (cat === 'Pelayanan' || cat === 'Mutu' || cat.toLowerCase().includes('medis') || cat.toLowerCase().includes('keperawatan')) {
    return 'Pelayanan Medis dan Keperawatan';
  }
  if (cat === 'Penunjang' || cat.toLowerCase().includes('penunjang')) {
    return 'Pelayanan Penunjang';
  }
  if (
    cat === 'Kepegawaian' || 
    cat === 'Administrasi' || 
    cat === 'Pengaduan' || 
    cat === 'Manajemen' || 
    cat === 'Humas' ||
    cat.toLowerCase().includes('pegawai') ||
    cat.toLowerCase().includes('keuangan') ||
    cat.toLowerCase().includes('rencana')
  ) {
    return 'Penatausahaan, Kepegawaian, Perencanaan, dan Keuangan';
  }
  return cat;
}

export async function getInternalApplications(): Promise<InternalApplication[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('internal_applications')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) {
        const normalized = (data as InternalApplication[]).map(a => ({
          ...a,
          category: normalizeInternalCategory(a.category)
        }));
        safeSetLocalStorage(KEYS.INTERNAL, normalized);
        return normalized;
      }
    } catch (e) {
      console.warn('Supabase getInternalApps fallback', e);
    }
  }

  const raw = localStorage.getItem(KEYS.INTERNAL);
  const list: InternalApplication[] = raw ? JSON.parse(raw) : INITIAL_INTERNAL_APPS;
  return list.map(a => ({
    ...a,
    category: normalizeInternalCategory(a.category)
  }));
}

export async function saveInternalApplication(app: InternalApplication, userEmail?: string): Promise<InternalApplication> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('internal_applications').upsert(app);
    } catch (e) {
      console.warn('Failed to upsert internal app', e);
    }
  }

  const list = await getInternalApplications();
  const index = list.findIndex(a => a.id === app.id);
  if (index >= 0) {
    list[index] = app;
  } else {
    list.push(app);
  }

  safeSetLocalStorage(KEYS.INTERNAL, list);
  await logAudit('UPDATE', 'internal_applications', app.id, null, { name: app.name }, userEmail);
  notifyDataChange('internal');
  return app;
}

export async function deleteInternalApplication(id: string, userEmail?: string): Promise<void> {
  const list = await getInternalApplications();
  const filtered = list.filter(a => a.id !== id);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('internal_applications').delete().eq('id', id);
    } catch (e) {
      console.warn('Failed to delete internal app from Supabase', e);
    }
  }

  safeSetLocalStorage(KEYS.INTERNAL, filtered);
  await logAudit('DELETE', 'internal_applications', id, null, null, userEmail);
  notifyDataChange('internal');
}

export async function reorderInternalApplications(orderedIds: string[], userEmail?: string): Promise<void> {
  const list = await getInternalApplications();
  const updated = list.map(app => {
    const newIdx = orderedIds.indexOf(app.id);
    return newIdx !== -1 ? { ...app, display_order: newIdx + 1 } : app;
  }).sort((a, b) => a.display_order - b.display_order);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('internal_applications').upsert(updated);
    } catch (e) {
      console.warn('Failed to reorder internal apps in Supabase', e);
    }
  }

  safeSetLocalStorage(KEYS.INTERNAL, updated);
  await logAudit('UPDATE', 'internal_applications', 'reorder', null, { count: orderedIds.length }, userEmail);
  notifyDataChange('internal');
}

// ----------------------------------------------------
// 5. OFFICIAL REPORTING APPLICATIONS CRUD
// ----------------------------------------------------
export async function getOfficialApplications(): Promise<OfficialReportingApp[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('official_reporting_apps')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) {
        safeSetLocalStorage(KEYS.OFFICIAL, data);
        return data as OfficialReportingApp[];
      }
    } catch (e) {
      console.warn('Supabase getOfficialApps fallback', e);
    }
  }

  const raw = localStorage.getItem(KEYS.OFFICIAL);
  return raw ? JSON.parse(raw) : INITIAL_OFFICIAL_APPS;
}

export async function saveOfficialApplication(app: OfficialReportingApp, userEmail?: string): Promise<OfficialReportingApp> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('official_reporting_apps').upsert(app);
    } catch (e) {
      console.warn('Failed to upsert official app in Supabase', e);
    }
  }

  const list = await getOfficialApplications();
  const index = list.findIndex(a => a.id === app.id);
  if (index >= 0) {
    list[index] = app;
  } else {
    list.push(app);
  }

  safeSetLocalStorage(KEYS.OFFICIAL, list);
  await logAudit('UPDATE', 'official_reporting_apps', app.id, null, { name: app.name }, userEmail);
  notifyDataChange('official');
  return app;
}

export async function deleteOfficialApplication(id: string, userEmail?: string): Promise<void> {
  const list = await getOfficialApplications();
  const filtered = list.filter(a => a.id !== id);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('official_reporting_apps').delete().eq('id', id);
    } catch (e) {
      console.warn('Failed delete official app from Supabase', e);
    }
  }

  safeSetLocalStorage(KEYS.OFFICIAL, filtered);
  await logAudit('DELETE', 'official_reporting_apps', id, null, null, userEmail);
  notifyDataChange('official');
}

// ----------------------------------------------------
// 6. CLICK TRACKING & ANALYTICS
// ----------------------------------------------------
export async function trackApplicationClick(
  appId: string, 
  appType: 'internal' | 'official',
  appName: string = 'Application',
  userEmail?: string
): Promise<void> {
  const clickRecord: ApplicationClick = {
    id: `click-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    application_id: appId,
    application_name: appName,
    application_type: appType,
    clicked_at: new Date().toISOString()
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('application_clicks').insert([clickRecord]);
      const table = appType === 'internal' ? 'internal_applications' : 'official_reporting_apps';
      await client.rpc('increment_click_count', { target_table: table, target_id: appId });
    } catch (e) {
      console.warn('Supabase click tracking fallback', e);
    }
  }

  // Update local counter
  if (appType === 'internal') {
    const list = await getInternalApplications();
    const target = list.find(a => a.id === appId);
    if (target) {
      target.click_count = (target.click_count || 0) + 1;
      safeSetLocalStorage(KEYS.INTERNAL, list);
    }
  } else {
    const list = await getOfficialApplications();
    const target = list.find(a => a.id === appId);
    if (target) {
      target.click_count = (target.click_count || 0) + 1;
      safeSetLocalStorage(KEYS.OFFICIAL, list);
    }
  }
}

export const recordApplicationClick = trackApplicationClick;

export async function getApplicationClicks(): Promise<ApplicationClick[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('application_clicks')
        .select('*')
        .order('clicked_at', { ascending: false })
        .limit(100);
      if (!error && data) {
        return data as ApplicationClick[];
      }
    } catch (e) {
      console.warn('Supabase getApplicationClicks fallback', e);
    }
  }

  const raw = localStorage.getItem(KEYS.CLICKS);
  return raw ? JSON.parse(raw) : [];
}

// ----------------------------------------------------
// 7. AUDIT LOGS
// ----------------------------------------------------
export async function getAuditLogs(): Promise<AuditLog[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error && data) {
        return data as AuditLog[];
      }
    } catch (e) {
      console.warn('Supabase getAuditLogs fallback', e);
    }
  }

  const raw = localStorage.getItem(KEYS.AUDIT);
  return raw ? JSON.parse(raw) : [];
}

// ----------------------------------------------------
// 8. ADMIN USERS
// ----------------------------------------------------
export async function getAdminUsers(): Promise<AppUser[]> {
  const raw = localStorage.getItem(KEYS.USERS);
  return raw ? JSON.parse(raw) : INITIAL_ADMIN_USERS;
}

export async function syncAllLocalDataToSupabase(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase client belum terkonfigurasi. Masukkan URL dan Anon Key terlebih dahulu.' };
  }

  try {
    const profile = await getWebsiteProfile();
    const social = await getSocialLinks();
    const hero = await getHeroMedia();
    const internal = await getInternalApplications();
    const official = await getOfficialApplications();

    // 1. Upsert Profile
    if (profile) {
      await client.from('website_profile').upsert({
        id: profile.id || 'profile-rsud-almulk-001',
        hospital_name: profile.hospital_name,
        tagline: profile.tagline,
        description: profile.description,
        logo_url: profile.logo_url,
        address: profile.address,
        phone: profile.phone,
        emergency_phone: profile.emergency_phone,
        email: profile.email,
        website_url: profile.website_url,
        service_hours: profile.service_hours,
        updated_at: new Date().toISOString()
      });
    }

    // 2. Upsert Social Links
    if (social.length > 0) {
      await client.from('social_links').upsert(
        social.map(s => ({
          id: s.id,
          platform: s.platform,
          title: s.title,
          url: s.url,
          icon: s.icon,
          is_active: s.is_active,
          display_order: s.display_order
        }))
      );
    }

    // 3. Upsert Hero Media
    if (hero.length > 0) {
      await client.from('hero_media').upsert(
        hero.map(h => ({
          id: h.id,
          title: h.title,
          description: h.description,
          media_type: h.media_type,
          media_url: h.media_url,
          is_active: h.is_active,
          display_order: h.display_order,
          overlay_opacity: h.overlay_opacity
        }))
      );
    }

    // 4. Upsert Internal Apps
    if (internal.length > 0) {
      await client.from('internal_applications').upsert(
        internal.map(a => ({
          id: a.id,
          name: a.name,
          slug: a.slug,
          description: a.description,
          category: a.category,
          app_url: a.app_url,
          logo_url: a.logo_url,
          is_featured: a.is_featured,
          status: a.status,
          display_order: a.display_order,
          click_count: a.click_count || 0
        }))
      );
    }

    // 5. Upsert Official Apps
    if (official.length > 0) {
      await client.from('official_reporting_apps').upsert(
        official.map(a => ({
          id: a.id,
          name: a.name,
          slug: a.slug,
          description: a.description,
          institution: a.institution,
          category: a.category,
          app_url: a.app_url,
          logo_url: a.logo_url,
          is_featured: a.is_featured,
          status: a.status,
          display_order: a.display_order,
          click_count: a.click_count || 0
        }))
      );
    }

    notifyDataChange('all');
    return { success: true, message: 'Seluruh data profil, hero media, dan aplikasi berhasil disinkronkan ke Supabase Cloud.' };
  } catch (err: any) {
    console.error('Error syncing to Supabase:', err);
    return { success: false, message: err.message || 'Gagal sinkronisasi data ke Supabase.' };
  }
}

export function resetToInitialSeedData(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(INITIAL_WEBSITE_PROFILE));
  localStorage.setItem(KEYS.SOCIAL, JSON.stringify(INITIAL_SOCIAL_LINKS));
  localStorage.setItem(KEYS.HERO, JSON.stringify(INITIAL_HERO_MEDIA));
  localStorage.setItem(KEYS.INTERNAL, JSON.stringify(INITIAL_INTERNAL_APPS));
  localStorage.setItem(KEYS.OFFICIAL, JSON.stringify(INITIAL_OFFICIAL_APPS));
  localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_ADMIN_USERS));
  localStorage.setItem(KEYS.CLICKS, JSON.stringify([]));
  notifyDataChange('all');
}
