// Innuora Service Worker for PWA functionality
const CACHE_NAME = "innuora-v1";
const OFFLINE_URLS = {
  en: "/en/offline",
  ar: "/ar/offline",
  fr: "/fr/offline",
};

// Assets to cache for offline functionality
const STATIC_ASSETS = [
  "/",
  "/en",
  "/en/offline",
  "/ar/offline",
  "/fr/offline",
  "/assets/icons/ios/192.png",
  "/assets/icons/ios/512.png",
  "/assets/logo.png",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );

  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Take control of all clients
  event.waitUntil(clients.claim());
});

// Fetch event - handle network requests
self.addEventListener("fetch", (event) => {
  // Only handle navigation requests (pages)
  if (event.request.mode === "navigate") {
    // event.respondWith(
    //   fetch(event.request).catch(() => {
    //     // If network fails, serve the offline page
    //     return caches.match(OFFLINE_URL);
    //   })
    // );
    event.respondWith(
      fetch(event.request).catch(() => {
        const lang = navigator.language.slice(0, 2); // "en", "ar", "fr"
        const offlinePage = OFFLINE_URLS[lang] || defaultOffline;
        return caches.match(offlinePage);
      })
    );
    return;
    return;
  }

  // For other requests, try network first, then cache
  if (event.request.method === "GET") {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Return cached version or fetch from network
        return (
          response ||
          fetch(event.request)
            .then((fetchResponse) => {
              // Cache successful responses for static assets
              if (
                fetchResponse.status === 200 &&
                (event.request.url.includes("/assets/") || event.request.url.includes("/_next/static/"))
              ) {
                const responseClone = fetchResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseClone);
                });
              }
              return fetchResponse;
            })
            .catch(() => {
              // Return fallback for failed requests
              if (event.request.destination === "image") {
                return new Response(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="14" fill="#9ca3af">Image unavailable</text></svg>',
                  { headers: { "Content-Type": "image/svg+xml" } }
                );
              }
              return new Response("Network error", { status: 408 });
            })
        );
      })
    );
  }
});

// Background sync for when connection is restored
self.addEventListener("sync", (event) => {
  if (event.tag === "session-sync") {
    event.waitUntil(syncSessions());
  }
});

// Handle background sync for sessions
async function syncSessions() {
  try {
    // Get pending sync data from IndexedDB or localStorage
    const clients = await self.clients.matchAll();

    if (clients.length > 0) {
      // Notify clients to sync pending data
      clients[0].postMessage({
        type: "BACKGROUND_SYNC",
        action: "sync-sessions",
      });
    }
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

// Push notification handling (for future use)
self.addEventListener("push", (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: "/assets/icons/ios/192.png",
      badge: "/assets/icons/ios/192.png",
      vibrate: [200, 100, 200],
      actions: [
        {
          action: "open",
          title: "Open Innuora",
        },
        {
          action: "close",
          title: "Close",
        },
      ],
    };

    event.waitUntil(self.registration.showNotification("Innuora", options));
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "open" || !event.action) {
    event.waitUntil(clients.openWindow("/"));
  }
});

// Handle messages from the main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
