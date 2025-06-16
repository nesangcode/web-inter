import PushNotificationManager from '../utils/push-notifications';
import { isLoggedIn } from '../data/api';

class NotificationsPresenter {
  constructor({ model, view }) {
    this.model = model;
    this.view = view;
    this.isInitialized = false;
  }

  async afterRender() {
    if (!isLoggedIn()) {
      this.view.navigateToLogin();
      return;
    }

    this.setupEventHandlers();
    await this.initializeNotificationStatus();
  }

  setupEventHandlers() {
    this.view.onSubscribe = async () => {
      await this.handleSubscribe();
    };

    this.view.onUnsubscribe = async () => {
      await this.handleUnsubscribe();
    };

    this.view.onTestNotification = async () => {
      await this.handleTestNotification();
    };

    this.view.onRetry = async () => {
      await this.initializeNotificationStatus();
    };

    this.view.setupEventListeners();
  }

  async initializeNotificationStatus() {
    try {
      this.view.showLoading();
      
      // Check if push notifications are supported
      if (!PushNotificationManager.isSupported) {
        this.view.showStatus(false, false);
        return;
      }

      // Initialize push notification manager if not already done
      if (!this.isInitialized) {
        await PushNotificationManager.init();
        this.isInitialized = true;
      }

      // Check current subscription status
      const isSubscribed = PushNotificationManager.isSubscribed();
      const permission = PushNotificationManager.getPermissionStatus();
      
      console.log('Notification status:', { isSubscribed, permission });
      
      this.view.showStatus(isSubscribed, true);
      
    } catch (error) {
      console.error('Error initializing notification status:', error);
      this.view.showError('Gagal memuat status notifikasi. Silakan coba lagi.');
    }
  }

  async handleSubscribe() {
    try {
      this.view.setButtonLoading('subscribe-btn', true);
      
      // Check permission first
      const permission = PushNotificationManager.getPermissionStatus();
      
      if (permission === 'denied') {
        this.view.showToast('Izin notifikasi ditolak. Silakan aktifkan melalui pengaturan browser.', 'error');
        return;
      }
      
      // Subscribe to notifications
      await PushNotificationManager.subscribe();
      
      // Update UI
      const isSubscribed = PushNotificationManager.isSubscribed();
      this.view.showStatus(isSubscribed, true);
      
      this.view.showToast('Berhasil mengaktifkan notifikasi!', 'success');
      
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      
      let errorMessage = 'Gagal mengaktifkan notifikasi.';
      
      if (error.message.includes('permission')) {
        errorMessage = 'Izin notifikasi diperlukan. Silakan izinkan notifikasi di browser Anda.';
      } else if (error.message.includes('logged in')) {
        errorMessage = 'Anda harus login untuk mengaktifkan notifikasi.';
      }
      
      this.view.showToast(errorMessage, 'error');
      
    } finally {
      this.view.setButtonLoading('subscribe-btn', false);
    }
  }

  async handleUnsubscribe() {
    try {
      this.view.setButtonLoading('unsubscribe-btn', true);
      
      // Unsubscribe from notifications
      await PushNotificationManager.unsubscribe();
      
      // Update UI
      const isSubscribed = PushNotificationManager.isSubscribed();
      this.view.showStatus(isSubscribed, true);
      
      this.view.showToast('Berhasil menonaktifkan notifikasi.', 'success');
      
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      this.view.showToast('Gagal menonaktifkan notifikasi.', 'error');
      
    } finally {
      this.view.setButtonLoading('unsubscribe-btn', false);
    }
  }

  async handleTestNotification() {
    try {
      this.view.setButtonLoading('test-notification-btn', true);
      
      const permission = PushNotificationManager.getPermissionStatus();
      
      if (permission !== 'granted') {
        this.view.showToast('Izin notifikasi diperlukan untuk mengirim test notifikasi.', 'error');
        return;
      }
      
      // Show test notification
      await PushNotificationManager.showTestNotification();
      
      this.view.showToast('Test notifikasi dikirim!', 'success');
      
    } catch (error) {
      console.error('Error sending test notification:', error);
      this.view.showToast('Gagal mengirim test notifikasi.', 'error');
      
    } finally {
      this.view.setButtonLoading('test-notification-btn', false);
    }
  }

  cleanup() {
    // Clean up any resources if needed
    console.log('NotificationsPresenter cleanup');
  }
}

export default NotificationsPresenter;