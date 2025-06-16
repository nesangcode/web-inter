export class AddGuestStoryView {
  async render(user, isOffline = false) {
    return `
      <section class="container">
        <div class="add-story-container">
          <div class="add-story-header">
            <h1>Bagikan Story sebagai Tamu</h1>
            <p>Berbagi cerita tanpa perlu mendaftar akun</p>
            <div class="guest-notice">
              <p><strong>Catatan:</strong> Story yang dibagikan sebagai tamu tidak akan terhubung dengan akun Anda. 
              <a href="#/register">Daftar</a> untuk mendapatkan pengalaman yang lebih lengkap.</p>
            </div>
          </div>
          
          <form id="add-guest-story-form" class="add-story-form">
            <div class="form-group">
              <label for="photo">Foto Story</label>
              <div class="photo-upload-container">
                <input 
                  type="file" 
                  id="photo" 
                  name="photo" 
                  accept="image/*" 
                  style="display: none;"
                >
                <div id="photo-preview" class="photo-preview">
                  <div class="photo-placeholder">
                    <span class="photo-icon" aria-hidden="true">📷</span>
                    <p>Pilih foto atau ambil dengan kamera</p>
                    <small>Maksimal 1MB, format JPG/PNG</small>
                  </div>
                </div>
                <div class="photo-actions">
                  <button type="button" id="select-photo-btn" class="btn btn-outline">
                    📁 Pilih dari Galeri
                  </button>
                  <button type="button" id="capture-photo-btn" class="btn btn-outline">
                    📷 Ambil Foto
                  </button>
                </div>
              </div>
              <div class="error-message" id="photo-error"></div>
            </div>

            <div id="camera-modal" class="camera-modal" style="display: none;" role="dialog" aria-modal="true" aria-label="Ambil foto dengan kamera">
              <div class="camera-modal-content">
                <div class="camera-header">
                  <h3>Ambil Foto</h3>
                  <button type="button" id="close-camera-btn" class="btn btn-outline" aria-label="Tutup kamera">✕</button>
                </div>
                <div class="camera-container">
                  <video id="camera-video" autoplay playsinline aria-label="Preview kamera"></video>
                  <div class="camera-error" id="camera-error" style="display: none;">
                    <p>Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.</p>
                  </div>
                </div>
                <div class="camera-controls">
                  <button type="button" id="switch-camera-btn" class="btn btn-outline" aria-label="Ganti kamera">🔄 Ganti Kamera</button>
                  <button type="button" id="capture-btn" class="btn btn-primary" aria-label="Ambil foto">📸 Ambil Foto</button>
                </div>
              </div>
            </div>

            <div id="map-modal" class="map-modal" style="display: none;" role="dialog" aria-modal="true" aria-label="Pilih lokasi di peta">
              <div class="map-modal-content">
                <div class="map-header">
                  <h3>Pilih Lokasi di Peta</h3>
                  <button type="button" id="close-map-btn" class="btn btn-outline" aria-label="Tutup peta">✕</button>
                </div>
                <div class="map-container">
                  <div id="location-map" class="location-map" role="img" aria-label="Peta untuk memilih lokasi"></div>
                  <div class="map-actions">
                    <button type="button" id="current-location-btn-map" class="btn btn-outline">📍 Lokasi Saat Ini</button>
                    <button type="button" id="confirm-location-btn" class="btn btn-primary" disabled>Konfirmasi Lokasi</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label for="description">Deskripsi Story</label>
              <textarea 
                id="description" 
                name="description" 
                required 
                placeholder="Ceritakan pengalaman belajar, project yang dikerjakan, atau hal menarik lainnya..."
                rows="5"
              ></textarea>
              <div class="error-message" id="description-error"></div>
            </div>
            
            <fieldset class="form-group">
              <legend class="form-group-legend">Lokasi Story</legend>
              <div class="location-section">
                <label class="location-label" for="include-location">
                  <input type="checkbox" id="include-location" name="include-location" aria-describedby="include-location-desc"> 
                  Sertakan lokasi
                </label>
                <p id="include-location-desc" class="form-help-text">Pilih untuk menyertakan informasi lokasi pada story Anda</p>
                <div class="location-options" style="display: none;" role="group" aria-labelledby="location-options-label">
                  <p id="location-options-label" class="sr-only">Pilihan metode lokasi</p>
                  <button type="button" id="current-location-btn" class="btn btn-outline btn-small" aria-describedby="current-location-desc">
                    📍 Gunakan Lokasi Saat Ini
                  </button>
                  <button type="button" id="select-map-location-btn" class="btn btn-outline btn-small" aria-describedby="map-location-desc">
                    🗺️ Pilih di Peta
                  </button>
                </div>
                <div id="location-info" class="location-info" style="display: none;" aria-live="polite">
                  <span class="location-status">📍 Mendapatkan lokasi...</span>
                </div>
                <div class="error-message" id="location-error" role="alert"></div>
              </div>
            </fieldset>
            
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" onclick="history.back()">
                Batal
              </button>
              <button type="submit" class="btn btn-primary" id="submit-btn">
                <span class="btn-text">Bagikan Story</span>
                <span class="btn-loading" style="display: none;">
                  <span class="spinner"></span> Mengunggah...
                </span>
              </button>
            </div>
            
            <div class="error-message" id="form-error"></div>
          </form>
        </div>
      </section>
    `;
  }

  getFormData() {
    const photoFile = document.getElementById('photo').files[0];
    const description = document.getElementById('description').value.trim();
    const includeLocation = document.getElementById('include-location').checked;
    return { photoFile, description, includeLocation };
  }

  setupEventListeners(handlers) {
    document.getElementById('add-guest-story-form').addEventListener('submit', (e) => {
      e.preventDefault();
      handlers.submit();
    });
    document.getElementById('select-photo-btn').addEventListener('click', () => {
      document.getElementById('photo').click();
    });
    document.getElementById('capture-photo-btn').addEventListener('click', handlers.camera.open);
    document.getElementById('photo-preview').addEventListener('click', () => {
      document.getElementById('photo').click();
    });
    document.getElementById('photo').addEventListener('change', (e) => {
      handlers.photoSelected(e.target.files[0]);
    });
    document.getElementById('description').addEventListener('blur', handlers.validateDescription);
    document.getElementById('include-location').addEventListener('change', (e) => handlers.toggleLocation(e.target.checked));
    document.getElementById('current-location-btn').addEventListener('click', handlers.getCurrentLocation);
    document.getElementById('select-map-location-btn').addEventListener('click', handlers.map.open);
    
    // Camera controls
    this.setupCameraControls(handlers.camera);
    
    // Map controls
    this.setupMapControls(handlers.map);
  }
  
  setupCameraControls(cameraHandlers) {
    document.getElementById('close-camera-btn').addEventListener('click', cameraHandlers.close);
    document.getElementById('switch-camera-btn').addEventListener('click', cameraHandlers.switch);
    document.getElementById('capture-btn').addEventListener('click', cameraHandlers.capture);
  }

  setupMapControls(mapHandlers) {
    document.getElementById('close-map-btn').addEventListener('click', mapHandlers.close);
    document.getElementById('current-location-btn-map').addEventListener('click', mapHandlers.getCurrentLocation);
    document.getElementById('confirm-location-btn').addEventListener('click', mapHandlers.confirm);
  }

  displayPhotoPreview(file, changeHandler) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const photoPreview = document.getElementById('photo-preview');
      photoPreview.innerHTML = `
        <div class="photo-selected">
          <img src="${e.target.result}" alt="Preview foto yang dipilih">
          <div class="photo-overlay">
            <button type="button" class="change-photo-btn">Ganti Foto</button>
          </div>
        </div>
      `;
      photoPreview.querySelector('.change-photo-btn').addEventListener('click', (ev) => {
        ev.stopPropagation();
        document.getElementById('photo').click();
      });
    };
    reader.readAsDataURL(file);
    this.clearError('photo-error');
  }

  toggleLocationOptions(show) {
    const locationOptions = document.querySelector('.location-options');
    locationOptions.style.display = show ? 'flex' : 'none';
    if (!show) {
      document.getElementById('location-info').style.display = 'none';
    }
  }

  showLocationStatus(message) {
    const locationInfo = document.getElementById('location-info');
    const locationStatus = locationInfo.querySelector('.location-status');
    locationInfo.style.display = 'block';
    locationStatus.textContent = message;
  }
  
  // Generic UI update methods
  showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  setButtonLoading(loading) {
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    if (loading) {
      btnText.style.display = 'none';
      btnLoading.style.display = 'inline-flex';
      submitBtn.disabled = true;
    } else {
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
      submitBtn.disabled = false;
    }
  }

  showSuccess(message) {
    const formError = document.getElementById('form-error');
    if (formError) {
      formError.innerHTML = `<div class="success-message">${message}</div>`;
      formError.style.display = 'block';
    }
  }
  
  showCameraModal() {
    const modal = document.getElementById('camera-modal');
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }
  
  hideCameraModal() {
    const modal = document.getElementById('camera-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  }

  getCameraVideoElement() {
    return document.getElementById('camera-video');
  }

  showMapModal() {
    const modal = document.getElementById('map-modal');
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  hideMapModal() {
    const modal = document.getElementById('map-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  }

  enableConfirmButton() {
    const confirmBtn = document.getElementById('confirm-location-btn');
    if (confirmBtn) {
      confirmBtn.disabled = false;
    }
  }

  disableConfirmButton() {
    const confirmBtn = document.getElementById('confirm-location-btn');
    if (confirmBtn) {
      confirmBtn.disabled = true;
    }
  }

  showSuccessMessage(message) {
    this.showError('form-error', message);
    const errorElement = document.getElementById('form-error');
    if (errorElement) {
      errorElement.className = 'success-message';
    }
  }
  
  showSubmitLoading() {
    this.setButtonLoading(true);
  }
  
  hideSubmitLoading() {
    this.setButtonLoading(false);
  }
  
  clearAllErrors() {
    ['photo-error', 'description-error', 'location-error', 'form-error'].forEach(id => {
      this.clearError(id);
    });
  }
  
  updateLocationDisplay(location) {
    if (location) {
      this.showLocationStatus(`📍 Lokasi: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
    } else {
      document.getElementById('location-info').style.display = 'none';
    }
  }
  
  showLocationLoading() {
    this.showLocationStatus('📍 Mendapatkan lokasi...');
  }
  
  hideLocationLoading() {
    // Location loading is handled by updateLocationDisplay
  }

  navigateToHome() {
    window.location.hash = '/';
  }

  navigateToLogin() {
    window.location.hash = '/login';
  }
}