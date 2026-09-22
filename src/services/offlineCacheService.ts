/**
 * BGK WEAR - Offline Cache & PWA Wishlist Synchronization Service
 * Coordinates with the Service Worker to precache product images and outfit metadata
 * for instant offline browsing.
 */

import { Product } from '../types';

const OFFLINE_WISHLIST_KEY = 'bgk_wear_offline_wishlist_products';
const OFFLINE_WISHLIST_IDS_KEY = 'bgk_wear_wishlist';
const IMAGE_CACHE_NAME = 'bgk-wear-images-bgk-wear-v7';

/**
 * Check if the browser is currently online
 */
export function isDeviceOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

/**
 * Send a message safely to the active service worker
 */
function postMessageToSW(type: string, payload: any) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  const swController = navigator.serviceWorker.controller;
  if (swController) {
    swController.postMessage({ type, payload });
  } else {
    // If not claimed yet, wait for ready
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.active) {
        registration.active.postMessage({ type, payload });
      }
    }).catch(() => {});
  }
}

/**
 * Extract all image URLs from a list of products
 */
export function extractProductImageUrls(products: Product[]): string[] {
  const urlSet = new Set<string>();

  products.forEach((p) => {
    if (!p) return;
    if (Array.isArray(p.images)) {
      p.images.forEach((img) => {
        if (typeof img === 'string' && img.startsWith('http') && !img.startsWith('data:')) {
          urlSet.add(img);
        }
      });
    }
    if (p.seller?.avatar && p.seller.avatar.startsWith('http') && !p.seller.avatar.startsWith('data:')) {
      urlSet.add(p.seller.avatar);
    }
  });

  return Array.from(urlSet);
}

/**
 * Cache wishlist products and all associated images for offline browsing
 */
export async function cacheWishlistForOffline(
  wishlistedProducts: Product[],
  wishlistIds: string[]
): Promise<{ success: boolean; imageCount: number }> {
  try {
    // 1. Synchronously persist structured data to localStorage for 0ms initial offline render
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(OFFLINE_WISHLIST_KEY, JSON.stringify(wishlistedProducts));
        localStorage.setItem(OFFLINE_WISHLIST_IDS_KEY, JSON.stringify(wishlistIds));
      } catch (storageErr) {
        console.warn('LocalStorage offline wishlist write error:', storageErr);
      }
    }

    // 2. Extract image URLs
    const imageUrls = extractProductImageUrls(wishlistedProducts);

    // 3. Post to Service Worker to populate DATA_CACHE and IMAGE_CACHE
    postMessageToSW('CACHE_WISHLIST_DATA', {
      products: wishlistedProducts,
      wishlist: wishlistIds
    });

    postMessageToSW('PRECACHE_IMAGES', {
      urls: imageUrls
    });

    // 4. Also use window CacheStorage directly if available to ensure redundancy
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const imgCache = await caches.open(IMAGE_CACHE_NAME);
        // Pre-fetch images non-blocking
        imageUrls.slice(0, 30).forEach((url) => {
          imgCache.match(url).then((existing) => {
            if (!existing) {
              fetch(url, { mode: 'no-cors' })
                .then((res) => {
                  if (res) imgCache.put(url, res);
                })
                .catch(() => {});
            }
          }).catch(() => {});
        });
      } catch (cacheErr) {
        console.warn('Direct CacheStorage precache note:', cacheErr);
      }
    }

    return { success: true, imageCount: imageUrls.length };
  } catch (error) {
    console.error('Failed to cache wishlist for offline browsing:', error);
    return { success: false, imageCount: 0 };
  }
}

/**
 * Retrieve cached wishlist products when offline
 */
export function getCachedWishlistProducts(): Product[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_WISHLIST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    // Fallback to all cached outfits filtered by wishlist IDs
    const cachedOutfitsRaw = localStorage.getItem('bgk_wear_cached_outfits');
    const wishlistIdsRaw = localStorage.getItem(OFFLINE_WISHLIST_IDS_KEY);
    if (cachedOutfitsRaw && wishlistIdsRaw) {
      const outfits = JSON.parse(cachedOutfitsRaw);
      const ids: string[] = JSON.parse(wishlistIdsRaw);
      if (Array.isArray(outfits) && Array.isArray(ids)) {
        return outfits.filter((o) => ids.includes(o.id));
      }
    }
  } catch (e) {
    console.warn('Error reading offline wishlist products:', e);
  }
  return [];
}

/**
 * Get count of cached images and data
 */
export async function getOfflineCacheStats(): Promise<{
  cachedImagesCount: number;
  offlineProductsCount: number;
}> {
  let cachedImagesCount = 0;
  let offlineProductsCount = 0;

  try {
    if (typeof window !== 'undefined' && 'caches' in window) {
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        if (name.includes('images')) {
          const c = await caches.open(name);
          const keys = await c.keys();
          cachedImagesCount += keys.length;
        }
      }
    }
    const cachedProds = getCachedWishlistProducts();
    offlineProductsCount = cachedProds.length;
  } catch (e) {
    console.warn('Error fetching cache stats:', e);
  }

  return { cachedImagesCount, offlineProductsCount };
}
