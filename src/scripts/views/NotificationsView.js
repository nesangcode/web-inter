class NotificationsView {
  constructor() {
    this.container = null;
  }

  async render(user, isOffline = false) {
    return `
      <div class="notifications-page">
        <div class="page-header">
          <button id="back-btn" class="back-btn" aria-label="Kembali ke halaman sebelumnya">
            <span class="back-icon">←</span>
          </button>
          <h1>Pengaturan Notifikasi</h1>
        </div>
        
        <div class="notifications-content">
          <div class="notification-card">
            <div class="notification-info">
              <h2>Push Notifications</h2>
              <p>Dapatkan notifikasi ketika ada story baru yang dibagikan oleh pengguna lain.</p>
            </div>
            
            <div class="notification-status" id="notification-status">
              <div class="status-loading">
                <div class="loading-spinner"></div>
                <span>Memeriksa status notifikasi...</span>
              </div>
            </div>
            
            <div class="notification-actions" id="notification-actions" style="display: none;">
              <button id="subscribe-btn" class="btn btn-primary" style="display: none;">
                Aktifkan Notifikasi
              </button>
              <button id="unsubscribe-btn" class="btn btn-secondary" style="display: none;">
                Nonaktifkan Notifikasi
              </button>
              <button id="test-notification-btn" class="btn btn-outline" style="display: none;">
                Test Notifikasi
              </button>
            </div>
            
            <div class="notification-error" id="notification-error" style="display: none;">
              <p class="error-message"></p>
              <button id="retry-btn" class="btn btn-outline">Coba Lagi</button>
            </div>
          </div>
          
          <div class="notification-info-card">
            <h3>Tentang Push Notifications</h3>
            <ul>
              <li>Notifikasi akan muncul meskipun aplikasi tidak sedang dibuka</li>
              <li>Anda dapat mengatur izin notifikasi melalui pengaturan browser</li>
              <li>Notifikasi hanya akan dikirim untuk story baru yang relevan</li>
              <li>Anda dapat menonaktifkan notifikasi kapan saja</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const backBtn = document.getElementById('back-btn');
    const subscribeBtn = document.getElementById('subscribe-btn');
    const unsubscribeBtn = document.getElementById('unsubscribe-btn');
    const testBtn = document.getElementById('test-notification-btn');
    const retryBtn = document.getElementById('retry-btn');

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.history.back();
      });
    }

    if (subscribeBtn) {
      subscribeBtn.addEventListener('click', () => {
        this.onSubscribe && this.onSubscribe();
      });
    }

    if (unsubscribeBtn) {
      unsubscribeBtn.addEventListener('click', () => {
        this.onUnsubscribe && this.onUnsubscribe();
      });
    }

    if (testBtn) {
      testBtn.addEventListener('click', () => {
        this.onTestNotification && this.onTestNotification();
      });
    }

    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.onRetry && this.onRetry();
      });
    }
  }

  showLoading() {
    const statusElement = document.getElementById('notification-status');
    const actionsElement = document.getElementById('notification-actions');
    const errorElement = document.getElementById('notification-error');
    
    if (statusElement) statusElement.style.display = 'block';
    if (actionsElement) actionsElement.style.display = 'none';
    if (errorElement) errorElement.style.display = 'none';
  }

  showStatus(isSubscribed, isSupported) {
    const statusElement = document.getElementById('notification-status');
    const actionsElement = document.getElementById('notification-actions');
    const subscribeBtn = document.getElementById('subscribe-btn');
    const unsubscribeBtn = document.getElementById('unsubscribe-btn');
    const testBtn = document.getElementById('test-notification-btn');
    
    if (statusElement) {
      if (!isSupported) {
        statusElement.innerHTML = `
          <div class="status-unsupported">
            <span class="status-icon">⚠️</span>
            <span>Push notifications tidak didukung di browser ini</span>
          </div>
        `;
        return;
      }
      
      statusElement.innerHTML = `
        <div class="status-info">
          <span class="status-icon">${isSubscribed ? '🔔' : '🔕'}</span>
          <span>Notifikasi ${isSubscribed ? 'aktif' : 'tidak aktif'}</span>
        </div>
      `;
    }
    
    if (actionsElement) actionsElement.style.display = 'block';
    
    if (subscribeBtn) {
      subscribeBtn.style.display = isSubscribed ? 'none' : 'inline-block';
    }
    
    if (unsubscribeBtn) {
      unsubscribeBtn.style.display = isSubscribed ? 'inline-block' : 'none';
    }
    
    if (testBtn) {
      testBtn.style.display = isSubscribed ? 'inline-block' : 'none';
    }
  }

  showError(message) {
    const statusElement = document.getElementById('notification-status');
    const actionsElement = document.getElementById('notification-actions');
    const errorElement = document.getElementById('notification-error');
    const errorMessage = errorElement?.querySelector('.error-message');
    
    if (statusElement) statusElement.style.display = 'none';
    if (actionsElement) actionsElement.style.display = 'none';
    if (errorElement) errorElement.style.display = 'block';
    if (errorMessage) errorMessage.textContent = message;
  }

  showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  setButtonLoading(buttonId, loading) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.disabled = loading;
      if (loading) {
        button.dataset.originalText = button.textContent;
        button.textContent = 'Memproses...';
      } else {
        button.textContent = button.dataset.originalText || button.textContent;
      }
    }
  }

  navigateToLogin() {
    window.location.hash = '#/login';
  }
}

export default NotificationsView;