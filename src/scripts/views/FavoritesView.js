import IndexedDBManager from '../utils/indexeddb.js';

export class FavoritesView {
  constructor() {
    this.container = null;
  }

  async render(user, isOffline = false) {
    return this.getHTML();
  }

  getHTML() {
    return `
      <div class="favorites-page">
        <div class="container">
          <div class="page-header">
            <h1>📖 Cerita Favorit</h1>
            <p>Koleksi cerita yang telah Anda simpan untuk dibaca offline</p>
          </div>

          <div class="favorites-controls">
            <button id="clear-favorites-btn" class="btn btn-outline btn-danger">
              🗑️ Hapus Semua Favorit
            </button>
            <div class="favorites-count">
              <span id="favorites-count">0</span> cerita tersimpan
            </div>
          </div>

          <div id="favorites-loading" class="loading-state" style="display: none;">
            <div class="loading-spinner"></div>
            <p>Memuat cerita favorit...</p>
          </div>

          <div id="favorites-empty" class="empty-state" style="display: none;">
            <div class="empty-icon">📚</div>
            <h3>Belum Ada Cerita Favorit</h3>
            <p>Tambahkan cerita ke favorit untuk dapat membacanya secara offline</p>
            <a href="#/" class="btn btn-primary">Jelajahi Cerita</a>
          </div>

          <div id="favorites-error" class="error-state" style="display: none;">
            <div class="error-icon">⚠️</div>
            <h3>Gagal Memuat Favorit</h3>
            <p id="favorites-error-message">Terjadi kesalahan saat memuat cerita favorit</p>
            <button id="retry-favorites-btn" class="btn btn-primary">Coba Lagi</button>
          </div>

          <div id="favorites-list" class="stories-grid">
            <!-- Favorites will be inserted here -->
          </div>
        </div>
      </div>
    `;
  }

  afterRender() {
    this.container = document.querySelector('.favorites-page');
  }

  setupEventListeners(handlers) {
    document.getElementById('clear-favorites-btn').addEventListener('click', handlers.clearFavorites);
    document.getElementById('retry-favorites-btn').addEventListener('click', handlers.loadFavorites);
  }

  showLoading() {
    document.getElementById('favorites-loading').style.display = 'block';
    document.getElementById('favorites-empty').style.display = 'none';
    document.getElementById('favorites-error').style.display = 'none';
    document.getElementById('favorites-list').style.display = 'none';
  }

  hideLoading() {
    document.getElementById('favorites-loading').style.display = 'none';
  }

  showEmpty() {
    this.hideLoading();
    document.getElementById('favorites-empty').style.display = 'block';
    document.getElementById('favorites-error').style.display = 'none';
    document.getElementById('favorites-list').style.display = 'none';
    this.updateFavoritesCount(0);
  }

  showError(message) {
    this.hideLoading();
    document.getElementById('favorites-error').style.display = 'block';
    document.getElementById('favorites-error-message').textContent = message;
    document.getElementById('favorites-empty').style.display = 'none';
    document.getElementById('favorites-list').style.display = 'none';
  }

  async displayFavorites(favorites) {
    this.hideLoading();
    
    if (favorites.length === 0) {
      this.showEmpty();
      return;
    }

    document.getElementById('favorites-error').style.display = 'none';
    document.getElementById('favorites-empty').style.display = 'none';
    document.getElementById('favorites-list').style.display = 'grid';

    const favoritesContainer = document.getElementById('favorites-list');
    favoritesContainer.innerHTML = favorites.map(story => this.createStoryCard(story)).join('');

    // Load cached images for offline access
    await this.loadCachedImages(favorites);

    // Add event listeners for remove buttons
    favorites.forEach(story => {
      const removeBtn = document.getElementById(`remove-favorite-${story.id}`);
      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.onRemoveFavorite(story.id);
        });
      }
    });

    this.updateFavoritesCount(favorites.length);
  }

  createStoryCard(story) {
    const createdAt = new Date(story.createdAt).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const addedAt = story.addedAt ? new Date(story.addedAt).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '';

    return `
      <article class="story-card favorite-card">
        <div class="story-image">
          <img src="${story.photoUrl}" alt="Foto cerita ${story.name}" loading="lazy">
          <div class="favorite-badge">⭐ Favorit</div>
        </div>
        <div class="story-content">
          <h3 class="story-title">
            <a href="#/story/${story.id}">${story.name}</a>
          </h3>
          <p class="story-description">${story.description}</p>
          <div class="story-meta">
            <span class="story-date">📅 ${createdAt}</span>
            ${addedAt ? `<span class="added-date">💾 Disimpan ${addedAt}</span>` : ''}
          </div>
          <div class="story-actions">
            <a href="#/story/${story.id}" class="btn btn-primary btn-sm">Baca Cerita</a>
            <button id="remove-favorite-${story.id}" class="btn btn-outline btn-danger btn-sm">
              🗑️ Hapus
            </button>
          </div>
        </div>
      </article>
    `;
  }

  updateFavoritesCount(count) {
    document.getElementById('favorites-count').textContent = count;
  }

  showSuccessMessage(message) {
    // Create and show toast notification
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">✅</span>
        <span class="toast-message">${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Hide and remove toast
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }

  showErrorMessage(message) {
    // Create and show error toast notification
    const toast = document.createElement('div');
    toast.className = 'toast toast-error';
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">❌</span>
        <span class="toast-message">${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Hide and remove toast
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }

  setRemoveFavoriteHandler(handler) {
    this.onRemoveFavorite = handler;
  }

  async loadCachedImages(favorites) {
    // Load cached images for offline access
    for (const story of favorites) {
      if (story.photoUrl) {
        try {
          const cachedImageUrl = await IndexedDBManager.getCachedImage(story.photoUrl);
          if (cachedImageUrl) {
            // Update the image source to use cached version
            const imgElement = document.querySelector(`img[src="${story.photoUrl}"]`);
            if (imgElement) {
              imgElement.src = cachedImageUrl;
              imgElement.setAttribute('data-cached', 'true');
              console.log('Using cached image for story:', story.id);
            }
          }
        } catch (error) {
          console.warn('Failed to load cached image for story:', story.id, error);
        }
      }
    }
  }

  navigateToHome() {
    window.location.hash = '/';
  }
}