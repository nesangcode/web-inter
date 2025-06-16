class AppView {
  constructor({ navigationDrawer, drawerButton, content }) {
    this._navigationDrawer = navigationDrawer;
    this._drawerButton = drawerButton;
    this._content = content;

    this._setupDrawer();
  }

  _setupDrawer() {
    this._drawerButton.addEventListener('click', () => {
      const isOpen = this._navigationDrawer.classList.contains('open');
      
      if (isOpen) {
        this._navigationDrawer.classList.remove('open');
        this._drawerButton.setAttribute('aria-expanded', 'false');
        this._drawerButton.setAttribute('aria-label', 'Open navigation menu');
      } else {
        this._navigationDrawer.classList.add('open');
        this._drawerButton.setAttribute('aria-expanded', 'true');
        this._drawerButton.setAttribute('aria-label', 'Close navigation menu');
      }
    });

    document.body.addEventListener('click', (event) => {
      if (!this._navigationDrawer.contains(event.target) && !this._drawerButton.contains(event.target)) {
        this._navigationDrawer.classList.remove('open');
        this._drawerButton.setAttribute('aria-expanded', 'false');
        this._drawerButton.setAttribute('aria-label', 'Open navigation menu');
      }
    });

    this._navigationDrawer.addEventListener('click', (event) => {
      if (event.target.tagName === 'A') {
        this._navigationDrawer.classList.remove('open');
        this._drawerButton.setAttribute('aria-expanded', 'false');
        this._drawerButton.setAttribute('aria-label', 'Open navigation menu');
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this._navigationDrawer.classList.contains('open')) {
        this._navigationDrawer.classList.remove('open');
        this._drawerButton.setAttribute('aria-expanded', 'false');
        this._drawerButton.setAttribute('aria-label', 'Open navigation menu');
        this._drawerButton.focus();
      }
    });
  }

  setupNavigationEvents(logoutCallback) {
    document.addEventListener('click', (event) => {
      if (event.target.id === 'nav-logout-btn') {
        event.preventDefault();
        logoutCallback();
      }
    });
  }

  navigateToHome() {
    window.location.hash = '#/';
  }

  updateNavigation(loggedIn, user, isOffline = false) {
    const navList = document.getElementById('nav-list');
    if (!navList) return;

    const existingAuthItems = navList.querySelectorAll('.auth-nav-item');
    existingAuthItems.forEach(item => item.remove());

    if (loggedIn) {
      if (user && user.name) {
        const userGreetingLi = document.createElement('li');
        userGreetingLi.className = 'auth-nav-item user-menu';
        userGreetingLi.innerHTML = `<span class="user-greeting">Halo, ${user.name}!</span>`;
        navList.appendChild(userGreetingLi);
      }

      // Show offline indicator when offline
      if (isOffline) {
        const offlineIndicatorLi = document.createElement('li');
        offlineIndicatorLi.className = 'auth-nav-item offline-indicator';
        offlineIndicatorLi.innerHTML = `<span class="offline-status">🔴 Mode Offline</span>`;
        navList.appendChild(offlineIndicatorLi);
      }

      // When offline, only show favorites menu
      if (isOffline) {
        const favoritesLi = document.createElement('li');
        favoritesLi.className = 'auth-nav-item';
        favoritesLi.innerHTML = `<a href="#/favorites">📖 Favorit</a>`;
        navList.appendChild(favoritesLi);
      } else {
        // When online, show all menu items
        const addStoryLi = document.createElement('li');
        addStoryLi.className = 'auth-nav-item';
        addStoryLi.innerHTML = `<a href="#/add-story">Bagikan Story</a>`;
        navList.appendChild(addStoryLi);

        const favoritesLi = document.createElement('li');
        favoritesLi.className = 'auth-nav-item';
        favoritesLi.innerHTML = `<a href="#/favorites">📖 Favorit</a>`;
        navList.appendChild(favoritesLi);

        const notificationsLi = document.createElement('li');
        notificationsLi.className = 'auth-nav-item';
        notificationsLi.innerHTML = `<a href="#/notifications">🔔 Notifikasi</a>`;
        navList.appendChild(notificationsLi);

        const logoutLi = document.createElement('li');
        logoutLi.className = 'auth-nav-item';
        logoutLi.innerHTML = `<button id="nav-logout-btn" class="nav-logout-btn" aria-label="Logout dari akun">Logout</button>`;
        navList.appendChild(logoutLi);
      }
    } else {
      // When not logged in, don't show menu items in offline mode
      if (!isOffline) {
        const loginLi = document.createElement('li');
        loginLi.className = 'auth-nav-item';
        loginLi.innerHTML = `<a href="#/login">Login</a>`;
        navList.appendChild(loginLi);

        const registerLi = document.createElement('li');
        registerLi.className = 'auth-nav-item';
        registerLi.innerHTML = `<a href="#/register">Daftar</a>`;
        navList.appendChild(registerLi);
      } else {
        const offlineMessageLi = document.createElement('li');
        offlineMessageLi.className = 'auth-nav-item offline-message';
        offlineMessageLi.innerHTML = `<span class="offline-status">🔴 Login diperlukan saat online</span>`;
        navList.appendChild(offlineMessageLi);
      }
    }
  }

  get content() {
    return this._content;
  }

  hideAppLoading() {
    const appLoading = document.getElementById('app-loading');
    if (appLoading) {
      appLoading.style.display = 'none';
    }
  }

  async setContent(content) {
    this._content.innerHTML = content;
  }

  showNotFoundError() {
    // Enhanced 404 page with better UX
    this._content.innerHTML = `
      <div class="container">
        <section class="error-container" aria-labelledby="error-title">
          <div class="error-illustration">
            <div class="error-code">404</div>
          </div>
          <h1 id="error-title">Halaman Tidak Ditemukan</h1>
          <p class="error-description">
            Maaf, halaman yang Anda cari tidak dapat ditemukan. 
            Mungkin halaman tersebut telah dipindahkan, dihapus, atau URL yang Anda masukkan salah.
          </p>
          <nav class="error-actions" aria-label="Aksi untuk mengatasi error">
            <a href="#/" class="btn btn-primary">🏠 Kembali ke Beranda</a>
            <button onclick="history.back()" class="btn btn-secondary">⬅️ Halaman Sebelumnya</button>
          </nav>
        </section>
      </div>
      <style>
        .error-container {
          text-align: center;
          padding: 3rem 1rem;
          max-width: 600px;
          margin: 0 auto;
        }
        .error-illustration {
          margin-bottom: 2rem;
        }
        .error-code {
          font-size: 6rem;
          font-weight: bold;
          color: #1976d2;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          animation: bounce 2s infinite;
        }
        .error-description {
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 2rem;
          color: #666;
        }
        .error-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn-secondary {
          background-color: #6c757d;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.375rem;
          text-decoration: none;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-secondary:hover {
          background-color: #5a6268;
          transform: translateY(-1px);
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        @media (max-width: 768px) {
          .error-code { font-size: 4rem; }
          .error-actions { flex-direction: column; align-items: center; }
        }
      </style>
    `;
  }
}

export default AppView;