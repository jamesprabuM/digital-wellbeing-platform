const CACHE_NAME = 'mindfulpath-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/wellness-tools.js',
  '/js/chatbot.js',
  '/js/dashboard.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install service worker and cache resources
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Cache installation failed:', error);
      })
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return response;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Cache the fetched response for future use
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.error('Service Worker: Fetch failed:', error);
            
            // Return offline page for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
            
            // For other requests, throw the error
            throw error;
          });
      })
  );
});

// Handle background sync (for offline data sync)
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered');
  
  if (event.tag === 'mood-data-sync') {
    event.waitUntil(syncMoodData());
  }
  
  if (event.tag === 'wellness-data-sync') {
    event.waitUntil(syncWellnessData());
  }
});

// Handle push notifications
self.addEventListener('push', event => {
  console.log('Service Worker: Push message received');
  
  const options = {
    body: event.data ? event.data.text() : 'Time for your wellness check-in!',
    icon: 'data:image/svg+xml,%3Csvg width="192" height="192" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="192" height="192" rx="24" fill="%23667eea"/%3E%3Cpath d="M96 48C73.9086 48 56 65.9086 56 88C56 110.091 73.9086 128 96 128C118.091 128 136 110.091 136 88C136 65.9086 118.091 48 96 48Z" fill="white" fill-opacity="0.8"/%3E%3C/svg%3E',
    badge: 'data:image/svg+xml,%3Csvg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="72" height="72" rx="8" fill="%23667eea"/%3E%3Cpath d="M36 18C27.1634 18 21 24.1634 21 33C21 41.8366 27.1634 48 36 48C44.8366 48 51 41.8366 51 33C51 24.1634 44.8366 18 36 18Z" fill="white" fill-opacity="0.8"/%3E%3C/svg%3E',
    vibrate: [200, 100, 200],
    tag: 'mindfulpath-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open MindfulPath',
        icon: 'assets/icons/open-192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: 'assets/icons/dismiss-192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('MindfulPath', options)
  );
});

// Handle notification click events
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync functions for offline data
async function syncMoodData() {
  try {
    const moodData = JSON.parse(localStorage.getItem('moodTracker') || '[]');
    const unsyncedData = moodData.filter(entry => !entry.synced);
    
    if (unsyncedData.length > 0) {
      console.log('Service Worker: Syncing mood data:', unsyncedData.length, 'entries');
      // Here you would send data to your backend API
      // For now, just mark as synced
      moodData.forEach(entry => entry.synced = true);
      localStorage.setItem('moodTracker', JSON.stringify(moodData));
    }
  } catch (error) {
    console.error('Service Worker: Mood data sync failed:', error);
    throw error;
  }
}

async function syncWellnessData() {
  try {
    const wellnessData = JSON.parse(localStorage.getItem('wellnessActivities') || '[]');
    const unsyncedData = wellnessData.filter(entry => !entry.synced);
    
    if (unsyncedData.length > 0) {
      console.log('Service Worker: Syncing wellness data:', unsyncedData.length, 'entries');
      // Here you would send data to your backend API
      // For now, just mark as synced
      wellnessData.forEach(entry => entry.synced = true);
      localStorage.setItem('wellnessActivities', JSON.stringify(wellnessData));
    }
  } catch (error) {
    console.error('Service Worker: Wellness data sync failed:', error);
    throw error;
  }
}

// Periodic background sync for wellness reminders
self.addEventListener('periodicsync', event => {
  if (event.tag === 'wellness-reminder') {
    event.waitUntil(sendWellnessReminder());
  }
});

async function sendWellnessReminder() {
  const lastActivity = localStorage.getItem('lastWellnessActivity');
  const now = new Date().getTime();
  const hoursSinceLastActivity = lastActivity ? 
    (now - parseInt(lastActivity)) / (1000 * 60 * 60) : 24;

  // Send reminder if no activity in the last 8 hours
  if (hoursSinceLastActivity >= 8) {
    const options = {
      body: 'Take a moment for your mental wellbeing. How are you feeling today?',
      icon: 'data:image/svg+xml,%3Csvg width="192" height="192" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="192" height="192" rx="24" fill="%23667eea"/%3E%3Cpath d="M96 48C73.9086 48 56 65.9086 56 88C56 110.091 73.9086 128 96 128C118.091 128 136 110.091 136 88C136 65.9086 118.091 48 96 48Z" fill="white" fill-opacity="0.8"/%3E%3C/svg%3E',
      tag: 'wellness-reminder',
      requireInteraction: false
    };

    await self.registration.showNotification('MindfulPath Reminder', options);
  }
}