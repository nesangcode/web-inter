// Custom service worker functionality for push notifications
// This file is imported by the Workbox-generated service worker

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let notificationData = {
    title: 'Dicoding Stories',
    options: {
      body: 'Ada story baru yang dibagikan!',
      icon: '/favicon.png',
      badge: '/favicon.png',
      data: {
        url: '/'
      }
    }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData.title = data.title || notificationData.title;
      notificationData.options.body = data.options?.body || notificationData.options.body;
      notificationData.options.data = data.options?.data || notificationData.options.data;
    } catch (error) {
      console.error('Error parsing push notification data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title,
      notificationData.options
    )
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.');
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});

console.log('Custom service worker functionality loaded');