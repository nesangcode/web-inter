// Maps utility using Leaflet for displaying and selecting locations
export class MapsHelper {
  constructor() {
    this.map = null;
    this.markers = [];
    this.container = null;
  }

  setContainer(container) {
    this.container = container;
  }

  async initialize(center = [-6.2088, 106.8456], zoom = 10) {
    return await this.initializeMap(this.container, center, zoom);
  }

  async initializeMap(container, center = [-6.2088, 106.8456], zoom = 10) {
    // Lazy load Leaflet if not already loaded
    if (!window.L) {
      await window.loadLeaflet();
    }
    
    // Initialize map
    this.map = L.map(container).setView(center, zoom);

    // Add multiple tile layers for layer control (optional feature)
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri, © OpenStreetMap contributors',
      maxZoom: 19
    });

    // Add default layer
    osmLayer.addTo(this.map);

    // Layer control for different map styles (optional feature)
    const baseLayers = {
      "OpenStreetMap": osmLayer,
      "Satellite": satelliteLayer
    };
    
    L.control.layers(baseLayers).addTo(this.map);

    return this.map;
  }

  addStoryMarkers(stories, navigateCallback) {
    if (!this.map) {
      console.error('Map not initialized');
      return;
    }

    // Clear existing markers
    this.clearMarkers();

    stories.forEach(story => {
      if (story.lat && story.lon) {
        const popupContent = document.createElement('div');
        popupContent.innerHTML = `
          <div class="map-popup">
            <div class="popup-image">
              <img src="${story.photoUrl}" alt="${story.description}" 
                   style="width: 200px; height: 150px; object-fit: cover; border-radius: 8px;">
            </div>
            <div class="popup-content">
              <h4>${story.name}</h4>
              <p>${story.description}</p>
              <small>📅 ${new Date(story.createdAt).toLocaleDateString('id-ID')}</small>
              <br>
              <a href="#" class="popup-link" data-story-id="${story.id}">Lihat Detail →</a>
            </div>
          </div>
        `;

        const link = popupContent.querySelector('.popup-link');
        link.addEventListener('click', (e) => {
          e.preventDefault();
          if (navigateCallback) {
            navigateCallback(story.id);
          }
        });

        const marker = L.marker([story.lat, story.lon])
          .addTo(this.map)
          .bindPopup(popupContent);

        this.markers.push(marker);
      }
    });

    // Fit map to show all markers
    if (this.markers.length > 0) {
      const group = new L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  addLocationPicker(callback) {
    if (!this.map) {
      console.error('Map not initialized');
      return;
    }

    let selectedMarker = null;

    this.map.on('click', (event) => {
      const { lat, lng } = event.latlng;

      // Remove previous selection marker
      if (selectedMarker) {
        this.map.removeLayer(selectedMarker);
      }

      // Add new selection marker
      selectedMarker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'selected-location-marker',
          html: '<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      })
      .bindPopup('Lokasi yang dipilih')
      .addTo(this.map);

      // Call callback with selected coordinates
      if (callback) {
        callback({ lat, lng });
      }
    });

    return selectedMarker;
  }

  clearMarkers() {
    this.markers.forEach(marker => {
      this.map.removeLayer(marker);
    });
    this.markers = [];
  }

  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          resolve(coords);
        },
        (error) => {
          let message = 'Gagal mendapatkan lokasi';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Akses lokasi ditolak. Silakan aktifkan izin lokasi di browser Anda.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Lokasi tidak tersedia. Pastikan GPS aktif.';
              break;
            case error.TIMEOUT:
              message = 'Timeout mendapatkan lokasi. Silakan coba lagi.';
              break;
            default:
              message = `Geolocation error: ${error.message}`;
              break;
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  async centerToCurrentLocation() {
    try {
      const coords = await this.getCurrentLocation();
      if (this.map) {
        this.map.setView([coords.lat, coords.lng], 15);
        
        // Add current location marker
        const currentLocationMarker = L.marker([coords.lat, coords.lng], {
          icon: L.divIcon({
            className: 'current-location-marker',
            html: '<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })
        })
        .bindPopup('Lokasi Anda')
        .addTo(this.map);

        return coords;
      }
    } catch (error) {
      console.error('Failed to get current location:', error);
      throw error;
    }
  }

  addMarker(lat, lon, title, description, clickCallback) {
    if (!this.map) {
      console.error('Map not initialized');
      return;
    }

    const marker = L.marker([lat, lon])
      .bindPopup(`
        <div class="map-popup">
          <div class="popup-content">
            <h4>${title}</h4>
            <p>${description}</p>
          </div>
        </div>
      `)
      .addTo(this.map);

    if (clickCallback) {
      marker.on('click', clickCallback);
    }

    this.markers.push(marker);
    return marker;
  }

  fitBounds(stories) {
    if (!this.map || !stories || stories.length === 0) return;

    const bounds = L.latLngBounds();
    stories.forEach(story => {
      if (story.lat && story.lon) {
        bounds.extend([story.lat, story.lon]);
      }
    });

    if (bounds.isValid()) {
      this.map.fitBounds(bounds.pad(0.1));
    }
  }

  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.markers = [];
    }
  }

  static addMapStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .map-popup {
        font-family: inherit;
        max-width: 250px;
      }
      
      .popup-image img {
        display: block;
        margin-bottom: 8px;
      }
      
      .popup-content h4 {
        margin: 0 0 4px 0;
        font-size: 14px;
        font-weight: 600;
      }
      
      .popup-content p {
        margin: 0 0 8px 0;
        font-size: 12px;
        color: #666;
        line-height: 1.4;
      }
      
      .popup-content small {
        font-size: 11px;
        color: #888;
      }
      
      .popup-link {
        display: inline-block;
        margin-top: 8px;
        color: #6366f1;
        text-decoration: none;
        font-size: 12px;
        font-weight: 500;
      }
      
      .popup-link:hover {
        text-decoration: underline;
      }
      
      .leaflet-container {
        font-family: inherit;
      }
    `;
    
    document.head.appendChild(style);
  }
}

// Initialize map styles
MapsHelper.addMapStyles();