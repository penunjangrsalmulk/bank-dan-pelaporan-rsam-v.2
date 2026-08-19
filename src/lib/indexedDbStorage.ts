import { HeroMedia } from '../types/database';

const DB_NAME = 'rsud_almulk_portal_db_v1';
const DB_VERSION = 1;

const STORES = {
  HERO_MEDIA: 'hero_media',
  MEDIA_BLOBS: 'media_blobs',
  APP_SETTINGS: 'app_settings'
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORES.HERO_MEDIA)) {
        db.createObjectStore(STORES.HERO_MEDIA, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.MEDIA_BLOBS)) {
        db.createObjectStore(STORES.MEDIA_BLOBS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.APP_SETTINGS)) {
        db.createObjectStore(STORES.APP_SETTINGS, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Save entire list of HeroMedia into IndexedDB permanently
 */
export async function saveHeroMediaToIndexedDB(mediaList: HeroMedia[]): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORES.HERO_MEDIA, STORES.APP_SETTINGS], 'readwrite');
      const heroStore = tx.objectStore(STORES.HERO_MEDIA);
      const settingsStore = tx.objectStore(STORES.APP_SETTINGS);

      // Clear old items and write new ones
      heroStore.clear();
      for (const item of mediaList) {
        heroStore.put(item);
      }

      // Also save ordered IDs array in settings store
      settingsStore.put({
        key: 'hero_media_list_full',
        data: mediaList,
        updatedAt: new Date().toISOString()
      });

      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch (err) {
    console.warn('IndexedDB saveHeroMedia notice:', err);
  }
}

/**
 * Retrieve all HeroMedia from IndexedDB permanently
 */
export async function getHeroMediaFromIndexedDB(): Promise<HeroMedia[] | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction([STORES.HERO_MEDIA, STORES.APP_SETTINGS], 'readonly');
      const settingsStore = tx.objectStore(STORES.APP_SETTINGS);
      const heroStore = tx.objectStore(STORES.HERO_MEDIA);

      // First try to get full serialized array
      const settingsReq = settingsStore.get('hero_media_list_full');

      settingsReq.onsuccess = () => {
        if (settingsReq.result && Array.isArray(settingsReq.result.data) && settingsReq.result.data.length > 0) {
          db.close();
          resolve(settingsReq.result.data);
          return;
        }

        // Otherwise get all records from heroStore
        const allReq = heroStore.getAll();
        allReq.onsuccess = () => {
          db.close();
          if (allReq.result && allReq.result.length > 0) {
            // Sort by display order
            const sorted = (allReq.result as HeroMedia[]).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
            resolve(sorted);
          } else {
            resolve(null);
          }
        };
        allReq.onerror = () => {
          db.close();
          resolve(null);
        };
      };

      settingsReq.onerror = () => {
        db.close();
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('IndexedDB getHeroMedia notice:', err);
    return null;
  }
}

/**
 * Save a single large media blob / data URL by key
 */
export async function saveMediaBlobToIndexedDB(id: string, dataUrl: string, metadata?: any): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORES.MEDIA_BLOBS], 'readwrite');
      const store = tx.objectStore(STORES.MEDIA_BLOBS);
      store.put({
        id,
        dataUrl,
        metadata: metadata || null,
        updatedAt: new Date().toISOString()
      });
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch (err) {
    console.warn('IndexedDB saveMediaBlob notice:', err);
  }
}

/**
 * Retrieve a large media blob / data URL by key
 */
export async function getMediaBlobFromIndexedDB(id: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction([STORES.MEDIA_BLOBS], 'readonly');
      const store = tx.objectStore(STORES.MEDIA_BLOBS);
      const req = store.get(id);
      req.onsuccess = () => {
        db.close();
        if (req.result && req.result.dataUrl) {
          resolve(req.result.dataUrl);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => {
        db.close();
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('IndexedDB getMediaBlob notice:', err);
    return null;
  }
}

/**
 * Delete a hero media item from IndexedDB
 */
export async function deleteHeroMediaFromIndexedDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORES.HERO_MEDIA, STORES.MEDIA_BLOBS], 'readwrite');
      tx.objectStore(STORES.HERO_MEDIA).delete(id);
      tx.objectStore(STORES.MEDIA_BLOBS).delete(id);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch (err) {
    console.warn('IndexedDB delete notice:', err);
  }
}
