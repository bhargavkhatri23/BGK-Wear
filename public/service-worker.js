/**
 * BGK WEAR - Progressive Web App Service Worker
 * Enhanced offline caching for core assets, product images, and wishlist data.
 */

const CACHE_VERSION = 'bgk-wear-v7';
const STATIC_CACHE_NAME = `bgk-wear-static-${CACHE_VERSION}`;
const IMAGE_CACHE_NAME = `bgk-wear-images-${CACHE_VERSION}`;
const DATA_CACHE_NAME = `bgk-wear-data-${CACHE_VERSION}`;

const OFFLINE_URL = '/index.html';
const OFFLINE_IMAGE_FALLBACK = '/offline-image-fallback.svg';

// Core static assets required for the offline application shell
const CORE_STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon-32x32.png',
  '/icon-192.png',
  '/icon-512.png',
  '/maskable-icon.png',
  '/apple-touch-icon.png',
  '/logo.png',
  '/icon.svg',
  '/offline-image-fallback.svg'
];

// Domains hosting core product images and couture photography
const IMAGE_HOSTS = [
  'images.unsplash.com',
  'firebasestorage.googleapis.com',
  'storage.googleapis.com',
  'lh3.googleusercontent.com',
  'res.cloudinary.com'
];

/**
 * Check if a request URL targets an image asset
 */
function isImageRequest(request) {
  if (request.destination === 'image') return true;
  const url = request.url.toLowerCase();
  if (/\.(png|jpg|jpeg|svg|webp|gif|avif|ico)(\?.*)?$/i.test(url)) return true;
  try {
    const parsed = new URL(request.url);
    if (IMAGE_HOSTS.some(host => parsed.hostname.includes(host))) return true;
  } catch (e) {}
  return false;
}

/**
 * Check if a request URL targets product or wishlist data APIs
 */
function isDataRequest(request) {
  const url = request.url;
  return (
    url.includes('/api/offline-wishlist') ||
    url.includes('/api/offline-products') ||
    url.includes('/api/products') ||
    url.includes('/api/wishlist')
  );
}

// 1. Install Event: Cache core static assets and fallback images
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Precache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(CORE_STATIC_ASSETS).catch((err) => {
          console.warn('[SW] Non-blocking asset precache warning:', err);
          // Try caching critical files individually
          return Promise.allSettled(
            CORE_STATIC_ASSETS.map((asset) => cache.add(asset).catch(() => {}))
          );
        });
      }),
      // Initialize image cache with the fallback image
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.add(OFFLINE_IMAGE_FALLBACK).catch(() => {});
      }),
      // Initialize data cache with empty default payload
      caches.open(DATA_CACHE_NAME).then((cache) => {
        const initialData = JSON.stringify({ products: [], wishlist: [], updatedAt: Date.now() });
        const res = new Response(initialData, {
          headers: { 'Content-Type': 'application/json', 'X-BGK-Cached': 'initial' }
        });
        return cache.put(new Request('/api/offline-wishlist'), res).catch(() => {});
      })
    ]).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Remove outdated caches and claim clients immediately
self.addEventListener('activate', (event) => {
  const expectedCaches = [STATIC_CACHE_NAME, IMAGE_CACHE_NAME, DATA_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!expectedCaches.includes(cacheName)) {
            console.log('[SW] Deleting obsolete cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Multi-tier intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle HTTP/HTTPS GET requests
  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) return;

  // A. Navigation requests: Network-first with offline index.html fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match(OFFLINE_URL);
          if (fallback) return fallback;
          return caches.match('/index.html');
        })
    );
    return;
  }

  // B. Product Images & External CDN Media: Cache-First with Network Background Revalidation
  if (isImageRequest(request)) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);

        // If cached image exists, serve immediately and update in background if online
        if (cachedResponse) {
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
                cache.put(request, networkResponse.clone());
              }
            })
            .catch(() => {
              // Network is offline; cached version was already returned
            });
          return cachedResponse;
        }

        // Not in image cache: fetch from network
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (fetchErr) {
          // Offline and image is not cached: serve the elegant vector fallback
          const fallback = await caches.match(OFFLINE_IMAGE_FALLBACK);
          if (fallback) return fallback;

          // Inline SVG fallback if cache match failed
          const inlineSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
              <rect width="600" height="800" fill="#fce7f3" />
              <text x="300" y="400" text-anchor="middle" font-family="serif" font-size="24" fill="#6d052a">BGK WEAR • Offline</text>
            </svg>
          `;
          return new Response(inlineSvg, {
            status: 200,
            headers: { 'Content-Type': 'image/svg+xml' }
          });
        }
      })
    );
    return;
  }

  // C. Product & Wishlist Data APIs: Network-first with Data Cache fallback
  if (isDataRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(DATA_CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          // Fallback to offline wishlist data
          const wishlistCache = await caches.match('/api/offline-wishlist');
          if (wishlistCache) return wishlistCache;
          return new Response(JSON.stringify({ products: [], error: 'offline' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // D. Static JavaScript, CSS Bundles, and Fonts: Stale-While-Revalidate
  const isStaticAsset =
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.url.includes('/assets/') ||
    request.url.startsWith(self.location.origin);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});

// 4. Message Event: Real-time coordination with React application
self.addEventListener('message', (event) => {
  if (!event.data || !event.data.type) return;

  const { type, payload } = event.data;

  // A. Precache a list of image URLs (for wishlisted products or catalog)
  if (type === 'PRECACHE_IMAGES' && Array.isArray(payload?.urls)) {
    event.waitUntil(
      caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
        const validUrls = payload.urls.filter(
          (u) => typeof u === 'string' && u.startsWith('http') && !u.startsWith('data:')
        );
        console.log(`[SW] Precaching ${validUrls.length} outfit images for offline browsing...`);
        return Promise.allSettled(
          validUrls.map(async (url) => {
            try {
              const match = await cache.match(url);
              if (!match) {
                const res = await fetch(url, { mode: 'no-cors' });
                if (res) await cache.put(url, res);
              }
            } catch (err) {
              // Ignore single image failures
            }
          })
        );
      })
    );
    return;
  }

  // B. Store structured product & wishlist data for instant offline access
  if (type === 'CACHE_WISHLIST_DATA' && payload) {
    event.waitUntil(
      caches.open(DATA_CACHE_NAME).then(async (cache) => {
        const dataString = JSON.stringify({
          products: payload.products || [],
          wishlist: payload.wishlist || [],
          updatedAt: Date.now()
        });

        const resWishlist = new Response(dataString, {
          headers: {
            'Content-Type': 'application/json',
            'X-BGK-Cached-At': new Date().toISOString()
          }
        });

        const resProducts = new Response(dataString, {
          headers: {
            'Content-Type': 'application/json',
            'X-BGK-Cached-At': new Date().toISOString()
          }
        });

        await Promise.all([
          cache.put(new Request('/api/offline-wishlist'), resWishlist),
          cache.put(new Request('/api/offline-products'), resProducts)
        ]);

        console.log(`[SW] Cached ${(payload.products || []).length} wishlisted outfits in offline data store.`);
      })
    );
    return;
  }

  // C. Skip waiting command from UI update prompt
  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  // D. Return cache statistics to client
  if (type === 'GET_CACHE_STATS' && event.ports && event.ports[0]) {
    event.waitUntil(
      Promise.all([
        caches.open(IMAGE_CACHE_NAME).then((cache) => cache.keys()),
        caches.open(DATA_CACHE_NAME).then((cache) => cache.keys())
      ]).then(([imageKeys, dataKeys]) => {
        event.ports[0].postMessage({
          cachedImagesCount: imageKeys.length,
          cachedDataCount: dataKeys.length
        });
      })
    );
  }
});
