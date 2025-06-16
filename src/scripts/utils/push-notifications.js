import CONFIG from '../config';
import { subscribeToNotifications, unsubscribeFromNotifications, isLoggedIn } from '../data/api';

class PushNotificationManager {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.subscription = null;
  }

  async init() {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/web-inter/service-worker.js');
      console.log('Service Worker registered:', registration);
      
      // Get existing subscription
      this.subscription = await registration.pushManager.getSubscription();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Push notifications are not supported');
    }

    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    return permission;
  }

  async subscribe() {
    if (!isLoggedIn()) {
      throw new Error('User must be logged in to subscribe to notifications');
    }

    try {
      // Request permission first
      await this.requestPermission();

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Create new subscription
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY)
        });
      }

      // Send subscription to server
      const subscriptionObject = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: this.arrayBufferToBase64(subscription.getKey('auth'))
        }
      };

      const result = await subscribeToNotifications(subscriptionObject);
      
      if (result.error === false) {
        this.subscription = subscription;
        console.log('Successfully subscribed to push notifications');
        return true;
      } else {
        throw new Error(result.message || 'Failed to subscribe to notifications');
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  }

  async unsubscribe() {
    if (!this.subscription) {
      console.log('No active subscription to unsubscribe from');
      return true;
    }

    try {
      // Unsubscribe from server
      await unsubscribeFromNotifications(this.subscription.endpoint);

      // Unsubscribe from browser
      await this.subscription.unsubscribe();
      
      this.subscription = null;
      console.log('Successfully unsubscribed from push notifications');
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }
  }

  isSubscribed() {
    return !!this.subscription;
  }

  getPermissionStatus() {
    if (!this.isSupported) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  // Utility functions
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Test notification (for testing purposes)
  async showTestNotification() {
    if (Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from Dicoding Stories!',
        icon: '/favicon.png'
      });
    }
  }
}

// Export singleton instance
export default new PushNotificationManager();