import IndexedDBManager from '../utils/indexeddb.js';

export class StoryDetailView {
  constructor() {
    this.eventListeners = {};
  }

  async render(user, isOffline = false) {
    return `
      <section class="container">
        <div id="story-detail-container" class="story-detail-container">
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Memuat detail story...</p>
          </div>
        </div>
      </section>
    `;
  }

  renderInvalidStory() {
    return `
      <section class="container">
        <div class="error-container">
          <h1>Story Tidak Ditemukan</h1>
          <p>ID Story tidak valid.</p>
          <a href="#/" class="btn btn-primary">Kembali ke Beranda</a>
        </div>
      </section>
    `;
  }

  renderAuthRequired() {
    return `
      <section class="container">
        <div class="auth-required">
          <h1>Login Diperlukan</h1>
          <p>Anda perlu login untuk melihat detail story.</p>
          <div class="auth-buttons">
            <a href="#/login" class="btn btn-primary">Login</a>
            <a href="#/register" class="btn btn-secondary">Daftar</a>
          </div>
        </div>
      </section>
    `;
  }

  async renderStoryDetail(story, formattedDate) {
    const container = document.getElementById('story-detail-container');
    
    const isOffline = !navigator.onLine;
    let offlineBanner = '';
    if (isOffline) {
      offlineBanner = `
        <div class="offline-banner">
          <span class="offline-icon">🔴</span>
          <span>Mode Offline - Story dari cache</span>
        </div>
      `;
    }
    
    container.innerHTML = `
      <div class="story-detail">
        ${offlineBanner}
        <div class="story-header">
          <button class="back-button" id="back-button">
            <span>← Kembali</span>
          </button>
          
          <div class="story-meta-header">
            <h1 class="story-author">${story.name}</h1>
            <p class="story-date">${formattedDate}</p>
          </div>
        </div>
        
        <div class="story-content">
          <div class="story-image-container">
            <img 
              src="${story.photoUrl}" 
              alt="${story.description}" 
              class="story-image"
              id="story-image"
              loading="lazy"
              data-original-src="${story.photoUrl}"
            >
          </div>
          
          <div class="story-info">
            <div class="story-description">
              <h2>Deskripsi</h2>
              <p>${story.description}</p>
            </div>
            
            ${story.lat && story.lon ? `
              <div class="story-location">
                <h3>Lokasi</h3>
                <div class="location-info">
                  <span class="location-icon">📍</span>
                  <div class="location-details">
                    <p class="coordinates">
                      Latitude: ${story.lat.toFixed(6)}<br>
                      Longitude: ${story.lon.toFixed(6)}
                    </p>
                    <button 
                      class="btn btn-outline btn-small" 
                      id="view-maps-btn"
                      data-lat="${story.lat}"
                      data-lon="${story.lon}"
                    >
                      Lihat di Maps
                    </button>
                  </div>
                </div>
              </div>
            ` : ''}
            
            <div class="story-actions">
              <button class="btn btn-primary" id="share-btn">
                Bagikan Story
              </button>
              
              <button class="btn btn-outline" id="favorite-btn" data-story-id="${story.id}">
                <span id="favorite-icon">⭐</span>
                <span id="favorite-text">Tambah ke Favorit</span>
              </button>
              
              <a href="#/" class="btn btn-secondary">
                Lihat Stories Lainnya
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Handle image caching after rendering
    await this._handleImageCaching(story, isOffline);
  }

  async _handleImageCaching(story, isOffline) {
    if (story.photoUrl) {
      try {
        if (isOffline) {
          // Try to load cached image when offline
          const cachedImageUrl = await IndexedDBManager.getCachedImage(story.photoUrl);
          const imgElement = document.getElementById('story-image');
          if (imgElement) {
            if (cachedImageUrl) {
              imgElement.src = cachedImageUrl;
              imgElement.setAttribute('data-cached', 'true');
              console.log('Using cached image for story:', story.id);
            } else {
              // Show placeholder for missing cached image
              imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdhbWJhciB0aWRhayB0ZXJzZWRpYSBvZmZsaW5lPC90ZXh0Pjwvc3ZnPg==';
              imgElement.setAttribute('data-cached', 'false');
              imgElement.setAttribute('alt', 'Gambar tidak tersedia offline');
            }
          }
        } else {
          // Cache image when online
          this._cacheImageInBackground(story.photoUrl, story.id);
        }
      } catch (error) {
        console.warn('Failed to handle image caching for story:', story.id, error);
      }
    }
  }

  async _cacheImageInBackground(imageUrl, storyId) {
    try {
      const response = await fetch(imageUrl);
      if (response.ok) {
        const blob = await response.blob();
        await IndexedDBManager.cacheImage(imageUrl, storyId, blob);
        console.log('Image cached successfully:', imageUrl);
      }
    } catch (error) {
      console.warn('Failed to cache image:', imageUrl, error);
    }
  }

  renderError(message) {
    const container = document.getElementById('story-detail-container');
    container.innerHTML = `
      <div class="error-container">
        <div class="error-icon">😕</div>
        <h2>Oops!</h2>
        <p>${message}</p>
        <div class="error-actions">
          <button class="btn btn-primary" id="error-back-btn">
            Kembali
          </button>
          <a href="#/" class="btn btn-secondary">
            Ke Beranda
          </a>
        </div>
      </div>
    `;
  }

  displayAuthRequired() {
    const container = document.getElementById('story-detail-container');
    const authHtml = this.renderAuthRequired();
    const match = authHtml.match(/<div class="auth-required">[\s\S]*?<\/div>/);
    container.innerHTML = match ? match[0] : authHtml;
  }

  displayInvalidStory() {
    const container = document.getElementById('story-detail-container');
    const errorHtml = this.renderInvalidStory();
    const match = errorHtml.match(/<div class="error-container">[\s\S]*?<\/div>/);
    container.innerHTML = match ? match[0] : errorHtml;
  }

  setupEventListeners(handlers) {
    this.eventListeners = handlers;
    
    // Back button
    const backButton = document.getElementById('back-button');
    if (backButton) {
      backButton.addEventListener('click', () => {
        this.goBack();
        if (handlers.goBack) handlers.goBack();
      });
    }

    // Error back button
    const errorBackBtn = document.getElementById('error-back-btn');
    if (errorBackBtn) {
      errorBackBtn.addEventListener('click', () => {
        this.goBack();
        if (handlers.goBack) handlers.goBack();
      });
    }

    // Story image click
    const storyImage = document.getElementById('story-image');
    if (storyImage && handlers.showImageModal) {
      storyImage.addEventListener('click', () => {
        handlers.showImageModal(storyImage.src, storyImage.alt);
      });
    }

    // Share button
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn && handlers.shareStory) {
      shareBtn.addEventListener('click', handlers.shareStory);
    }

    // View maps button
    const viewMapsBtn = document.getElementById('view-maps-btn');
    if (viewMapsBtn) {
      viewMapsBtn.addEventListener('click', () => {
        const lat = viewMapsBtn.dataset.lat;
        const lon = viewMapsBtn.dataset.lon;
        this.openMaps(lat, lon);
        if (handlers.openMaps) handlers.openMaps(lat, lon);
      });
    }

    // Favorite button
    const favoriteBtn = document.getElementById('favorite-btn');
    if (favoriteBtn && handlers.toggleFavorite) {
      favoriteBtn.addEventListener('click', () => {
        const storyId = favoriteBtn.dataset.storyId;
        handlers.toggleFavorite(storyId);
      });
    }
  }

  goBack() {
    window.history.back();
  }

  openMaps(lat, lon) {
    try {
      const mapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening maps:', error);
    }
  }

  showImageModal(imageSrc, alt) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
      <div class="image-modal-overlay">
        <div class="image-modal-content">
          <button class="image-modal-close">&times;</button>
          <img src="${imageSrc}" alt="${alt}" class="image-modal-img">
          <p class="image-modal-caption">${alt}</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Close modal events
    const closeBtn = modal.querySelector('.image-modal-close');
    const overlay = modal.querySelector('.image-modal-overlay');
    
    const closeModal = () => {
      document.body.removeChild(modal);
      document.body.style.overflow = 'auto';
    };
    
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    });
    
    // Close on Escape key
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    // Hide and remove toast
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  updateFavoriteButton(isInFavorites) {
    const favoriteBtn = document.getElementById('favorite-btn');
    const favoriteIcon = document.getElementById('favorite-icon');
    const favoriteText = document.getElementById('favorite-text');
    
    if (favoriteBtn && favoriteIcon && favoriteText) {
      if (isInFavorites) {
        favoriteBtn.className = 'btn btn-primary';
        favoriteIcon.textContent = '❤️';
        favoriteText.textContent = 'Hapus dari Favorit';
      } else {
        favoriteBtn.className = 'btn btn-outline';
        favoriteIcon.textContent = '⭐';
        favoriteText.textContent = 'Tambah ke Favorit';
      }
    }
  }

  showFavoriteMessage(message, isSuccess = true) {
    const toast = document.createElement('div');
    toast.className = `toast ${isSuccess ? 'toast-success' : 'toast-error'}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${isSuccess ? '✅' : '❌'}</span>
        <span class="toast-message">${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  removeEventListeners() {
    // Clean up event listeners if needed
    const backButton = document.getElementById('back-button');
    if (backButton && this.eventListeners.goBack) {
      backButton.removeEventListener('click', this.eventListeners.goBack);
    }
    // Add more cleanup as needed
  }
}