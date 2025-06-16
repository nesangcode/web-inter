import IndexedDBManager from '../utils/indexeddb.js';

export class HomeView {
  constructor() {
    this.isMapView = false;
  }

  async render(user, isOffline = false) {
    return `
      <div class="container">
        <section class="hero-section" aria-labelledby="hero-title">
          <h1 id="hero-title">Dicoding Stories</h1>
          <p>Berbagi cerita dan pengalaman belajar bersama komunitas developer Indonesia</p>
          
          ${user && user.name ? `
            <div class="user-welcome" role="region" aria-labelledby="welcome-text">
              <p id="welcome-text">Selamat datang kembali, <strong>${user.name}</strong>! 👋</p>
              ${!isOffline ? `
                <nav class="action-buttons" aria-label="Aksi utama">
                  <a href="#/add-story" class="btn btn-primary">Bagikan Story Baru</a>
                  <a href="#/add-guest-story" class="btn btn-secondary">Story Tamu</a>
                </nav>
              ` : `
                <div class="offline-notice">
                  <p>📵 Mode offline - Fitur upload story tidak tersedia</p>
                </div>
              `}
            </div>
          ` : `
            ${!isOffline ? `
              <nav class="auth-buttons" aria-label="Authentication options">
                <a href="#/login" class="btn btn-primary">Login</a>
                <a href="#/register" class="btn btn-secondary">Daftar</a>
                <a href="#/add-guest-story" class="btn btn-outline">Bagikan Story Tamu</a>
              </nav>
            ` : `
              <div class="offline-notice">
                <p>📵 Mode offline - Silakan terhubung ke internet untuk login atau mendaftar</p>
              </div>
            `}
          `}
        </section>
        
        <section class="stories-section" aria-labelledby="stories-title">
          <header class="section-header">
            <h2 id="stories-title">Stories Terbaru</h2>
            ${user && user.name ? `
              <div class="view-toggle" role="group" aria-label="Pilihan tampilan stories">
                <button id="grid-view-btn" class="btn btn-small active" aria-label="Tampilan grid" aria-pressed="true">📋</button>
                <button id="map-view-btn" class="btn btn-small" aria-label="Tampilan peta" aria-pressed="false">🗺️</button>
              </div>
            ` : ''}
          </header>
          
          <div id="stories-view" role="region" aria-live="polite" aria-label="Konten stories">
            <div id="stories-container" class="stories-grid" role="feed" aria-label="Daftar stories">
              <div class="loading">Memuat stories...</div>
            </div>
            
            ${user && user.name ? `
              <div id="stories-map" class="stories-map-container" style="display: none;">
                <div id="map" class="stories-map" role="img" aria-label="Peta lokasi stories"></div>
              </div>
            ` : ''}
          </div>
          

        </section>
      </div>
    `;
  }

  async renderStories(stories, isOffline = false) {
    const storiesContainer = document.getElementById('stories-container');
    
    let offlineIndicator = '';
    if (isOffline) {
      offlineIndicator = `
        <div class="offline-banner">
          <span class="offline-icon">🔴</span>
          <span>Mode Offline - Menampilkan stories yang tersimpan</span>
        </div>
      `;
    }
    
    const storiesHTML = stories.map(story => `
      <article class="story-card ${isOffline ? 'offline-story' : ''}" data-story-id="${story.id}" role="button" tabindex="0" aria-label="Story dari ${story.name}">
        <div class="story-image">
          <img src="${story.photoUrl}" alt="Foto story: ${story.description}" loading="lazy" data-original-src="${story.photoUrl}">
        </div>
        <div class="story-content">
          <h3>${story.name}</h3>
          <p class="story-description">${story.description}</p>
          <div class="story-meta">
            <span class="story-date" aria-label="Dibuat pada ${new Date(story.createdAt).toLocaleDateString('id-ID')}">${new Date(story.createdAt).toLocaleDateString('id-ID')}</span>
            ${story.lat && story.lon ? '<span class="story-location" aria-label="Memiliki informasi lokasi">📍 Ada lokasi</span>' : ''}
            ${isOffline ? '<span class="offline-badge">📱 Offline</span>' : ''}
          </div>
        </div>
      </article>
    `).join('');
    
    storiesContainer.innerHTML = offlineIndicator + storiesHTML;
    
    // Handle image caching and loading
    await this._handleImageCaching(stories, isOffline);
  }

  showLoading() {
    const storiesContainer = document.getElementById('stories-container');
    if (storiesContainer) {
      storiesContainer.innerHTML = '<div class="loading">Memuat stories...</div>';
    }
  }

  showError(message) {
    const storiesContainer = document.getElementById('stories-container');
    if (storiesContainer) {
      storiesContainer.innerHTML = `<p class="error">Gagal memuat stories: ${message}</p>`;
    }
  }

  showNoStories() {
    const storiesContainer = document.getElementById('stories-container');
    if (storiesContainer) {
      storiesContainer.innerHTML = '<p class="no-stories">Belum ada stories yang tersedia.</p>';
    }
  }

  showAuthRequired() {
    const storiesContainer = document.getElementById('stories-container');
    if (storiesContainer) {
      storiesContainer.innerHTML = `
        <div class="auth-required">
          <p>Silakan login untuk melihat stories dari komunitas Dicoding</p>
        </div>
      `;
    }
  }

  showOfflineMode() {
    const storiesContainer = document.getElementById('stories-container');
    if (storiesContainer) {
      storiesContainer.innerHTML = '<div class="loading offline-loading">🔴 Mode Offline</div>';
    }
  }

  showNoOfflineStories() {
    const storiesContainer = document.getElementById('stories-container');
    if (storiesContainer) {
      storiesContainer.innerHTML = `
        <div class="offline-no-stories">
          <div class="offline-banner">
            <span class="offline-icon">🔴</span>
            <span>Mode Offline</span>
          </div>
          <p>Tidak ada stories yang tersimpan untuk dibaca offline.</p>
          <p>Silakan terhubung ke internet untuk melihat stories terbaru.</p>
        </div>
      `;
    }
  }

  showOfflineError() {
    const storiesContainer = document.getElementById('stories-container');
    if (storiesContainer) {
      storiesContainer.innerHTML = `
        <div class="offline-error">
          <div class="offline-banner">
            <span class="offline-icon">🔴</span>
            <span>Mode Offline</span>
          </div>
          <p class="error">Gagal memuat stories offline. Silakan coba lagi atau terhubung ke internet.</p>
        </div>
      `;
    }
  }

  showOfflineMapMessage() {
    const storiesContainer = document.getElementById('stories-container');
    if (storiesContainer) {
      const existingContent = storiesContainer.innerHTML;
      storiesContainer.innerHTML = `
        <div class="offline-map-notice">
          <p>📍 Tampilan peta tidak tersedia dalam mode offline. Menampilkan dalam format grid.</p>
        </div>
        ${existingContent}
      `;
    }
   }

   async _handleImageCaching(stories, isOffline) {
     for (const story of stories) {
       if (story.photoUrl) {
         try {
           if (isOffline) {
             // Try to load cached image when offline
             const cachedImageUrl = await IndexedDBManager.getCachedImage(story.photoUrl);
             if (cachedImageUrl) {
               const imgElement = document.querySelector(`img[data-original-src="${story.photoUrl}"]`);
               if (imgElement) {
                 imgElement.src = cachedImageUrl;
                 imgElement.setAttribute('data-cached', 'true');
                 console.log('Using cached image for story:', story.id);
               }
             } else {
               // Show placeholder for missing cached images
               const imgElement = document.querySelector(`img[data-original-src="${story.photoUrl}"]`);
               if (imgElement) {
                 imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdhbWJhciB0aWRhayB0ZXJzZWRpYSBvZmZsaW5lPC90ZXh0Pjwvc3ZnPg==';
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


  toggleView(isMapView) {
    this.isMapView = isMapView;
    const gridViewBtn = document.getElementById('grid-view-btn');
    const mapViewBtn = document.getElementById('map-view-btn');
    const storiesContainer = document.getElementById('stories-container');
    const storiesMapContainer = document.getElementById('stories-map');

    if (isMapView) {
      mapViewBtn?.classList.add('active');
      gridViewBtn?.classList.remove('active');
      mapViewBtn?.setAttribute('aria-pressed', 'true');
      gridViewBtn?.setAttribute('aria-pressed', 'false');
      if (storiesContainer) storiesContainer.style.display = 'none';
      if (storiesMapContainer) storiesMapContainer.style.display = 'block';
    } else {
      gridViewBtn?.classList.add('active');
      mapViewBtn?.classList.remove('active');
      gridViewBtn?.setAttribute('aria-pressed', 'true');
      mapViewBtn?.setAttribute('aria-pressed', 'false');
      if (storiesContainer) storiesContainer.style.display = 'grid';
      if (storiesMapContainer) storiesMapContainer.style.display = 'none';
    }
  }

  getIsMapView() {
    return this.isMapView;
  }



  setupViewToggleListeners(gridCallback, mapCallback) {
    const gridViewBtn = document.getElementById('grid-view-btn');
    const mapViewBtn = document.getElementById('map-view-btn');

    if (gridViewBtn) {
      gridViewBtn.addEventListener('click', gridCallback);
    }

    if (mapViewBtn) {
      mapViewBtn.addEventListener('click', mapCallback);
    }
  }

  setupStoryNavigationListeners(navigateCallback) {
    const storiesContainer = document.getElementById('stories-container');
    storiesContainer.addEventListener('click', (event) => {
      const storyCard = event.target.closest('.story-card');
      if (storyCard) {
        this.navigateToStory(storyCard.dataset.storyId);
        if (navigateCallback) navigateCallback(storyCard.dataset.storyId);
      }
    });

    storiesContainer.addEventListener('keydown', (event) => {
      const storyCard = event.target.closest('.story-card');
      if (storyCard && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        this.navigateToStory(storyCard.dataset.storyId);
        if (navigateCallback) navigateCallback(storyCard.dataset.storyId);
      }
    });
  }

  navigateToStory(storyId) {
    window.location.hash = `#/story/${storyId}`;
  }

  async initializeMap(mapHelper, storiesWithLocation) {
    // Only initialize map if user is logged in and map container exists
    const mapContainer = document.getElementById('map');
    if (!mapContainer || !window.loadLeaflet) return;
    
    try {
      await window.loadLeaflet();
      
      mapHelper.setContainer(mapContainer);
      mapHelper.initialize();

      mapHelper.addStoryMarkers(storiesWithLocation, (storyId) => {
        this.navigateToStory(storyId);
      });
    } catch (error) {
      console.error('Error loading Leaflet:', error);
    }
  }
}