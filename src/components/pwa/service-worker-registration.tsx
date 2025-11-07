/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect } from "react";

// Sync any pending sessions when connection is restored
async function syncPendingSessions() {
  try {
    // Check if we're online
    if (!navigator.onLine) {
      return;
    }

    // Get session sync utilities
    const { sessionSynchronizer } = await import("@/domains/session-sync");
    await sessionSynchronizer.flushNow();
    console.log("Background sync completed successfully");
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

// Handle background sync events
function handleBackgroundSync(action: string) {
  switch (action) {
    case "sync-sessions":
      // Trigger session synchronization when connection is restored
      syncPendingSessions();
      break;
    default:
      console.log("Unknown background sync action:", action);
  }
}

// Hook for manual background sync registration
export function useBackgroundSync() {
  const registerSync = async (tag: string) => {
    if ("serviceWorker" in navigator && "sync" in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register(tag);
        console.log(`Background sync registered: ${tag}`);
      } catch (error) {
        console.error("Background sync registration failed:", error);
      }
    }
  };

  return { registerSync };
}

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      // Register service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered successfully:", registration.scope);

          // Handle service worker updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New content is available, notify user
                  if (window.confirm("New version available! Refresh to update?")) {
                    newWorker.postMessage({ type: "SKIP_WAITING" });
                    window.location.reload();
                  }
                }
              });
            }
          });

          // Listen for service worker messages
          navigator.serviceWorker.addEventListener("message", (event) => {
            if (event.data && event.data.type === "BACKGROUND_SYNC") {
              handleBackgroundSync(event.data.action);
            }
          });

          // Register for background sync if supported
          if ("sync" in window.ServiceWorkerRegistration.prototype) {
            // Will be triggered when connection is restored
            (registration as any).sync.register("session-sync");
          }
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });

      // Handle service worker controller changes
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        // Service worker has been updated and is now controlling the page
        window.location.reload();
      });
    }
  }, []);

  return null;
}
