import { CameraCapture } from '../utils/camera';
import { MapsHelper } from '../utils/maps';

export class AddGuestStoryPresenter {
  constructor({ model, view }) {
    this.model = model;
    this.view = view;
    this.photoFile = null;
    this.currentLocation = null;
    this.cameraCapture = null;
    this.mapsHelper = null;
    this.selectedLocation = null;
  }

  async afterRender() {
    this.view.setupEventListeners({
      submit: () => this.handleSubmit(),
      photoSelected: (file) => this.handlePhotoSelected(file),
      validateDescription: () => this.handleValidateDescription(),
      toggleLocation: (enabled) => this.handleToggleLocation(enabled),
      getCurrentLocation: () => this.handleGetCurrentLocation(),
      camera: {
        open: () => this.handleCameraOpen(),
        close: () => this.handleCameraClose(),
        switch: () => this.handleCameraSwitch(),
        capture: () => this.handleCameraCapture(),
      },
      map: {
        getCurrentLocation: () => this.handleGetCurrentLocation(),
        open: () => this.handleMapOpen(),
        close: () => this.handleMapClose(),
        confirm: () => this.handleMapConfirm(),
      },
    });
  }

  handlePhotoSelected(file) {
    const validation = this.model.validatePhoto(file);
    if (validation.valid) {
      this.photoFile = file;
      this.view.displayPhotoPreview(file);
      this.view.clearError('photo-error');
    } else {
      this.photoFile = null;
      this.view.showError('photo-error', validation.message);
    }
  }

  handleValidateDescription() {
    const description = this.view.getFormData().description;
    const validation = this.model.validateDescription(description);
    if (!validation.valid) {
      this.view.showError('description-error', validation.message);
    } else {
      this.view.clearError('description-error');
    }
    return validation.valid;
  }
  
  handleToggleLocation(enabled) {
    this.view.toggleLocationOptions(enabled);
    if (!enabled) {
      this.currentLocation = null;
      this.view.updateLocationDisplay(null);
    }
  }

  async handleGetCurrentLocation() {
    try {
      if (this.mapsHelper) {
        // If map is open, center to current location
        const location = await this.mapsHelper.centerToCurrentLocation();
        this.selectedLocation = location;
        this.view.enableConfirmButton();
      } else {
        // If map is not open, get current location for form
        this.view.showLocationLoading();
        const location = await this.model.getCurrentLocation();
        this.currentLocation = location;
        this.view.updateLocationDisplay(location);
        this.view.hideLocationLoading();
      }
    } catch (error) {
      if (!this.mapsHelper) {
        this.view.hideLocationLoading();
      }
      this.view.showError('location-error', error.message || 'Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin lokasi diberikan.');
    }
  }

  async handleSubmit() {
    // Check if offline
    if (!navigator.onLine) {
      this.view.showError('form-error', '🔴 Tidak dapat mengunggah story saat offline. Silakan terhubung ke internet terlebih dahulu.');
      return;
    }
    
    this.view.clearError('form-error');
    const { description, includeLocation } = this.view.getFormData();
    
    // Run validations
    const isPhotoValid = this.model.validatePhoto(this.photoFile).valid;
    if (!isPhotoValid) this.view.showError('photo-error', this.model.validatePhoto(this.photoFile).message)
    
    const isDescriptionValid = this.handleValidateDescription();

    if (!isPhotoValid || !isDescriptionValid) {
      return;
    }

    const storyData = {
      description,
      photo: this.photoFile,
    };

    if (includeLocation && this.currentLocation) {
      storyData.lat = this.currentLocation.lat;
      storyData.lon = this.currentLocation.lng;
    }

    this.view.setButtonLoading(true);

    try {
      const result = await this.model.submitStory(storyData);
      if (!result.error) {
        this.view.showSuccess(`
          <p>✅ Story berhasil dibagikan!</p>
          <p>Ingin berbagi lebih banyak story? <a href="#/register">Daftar akun</a> untuk pengalaman yang lebih lengkap.</p>
          <div class="success-actions">
            <a href="#/" class="btn btn-primary">Kembali ke Beranda</a>
            <a href="#/register" class="btn btn-secondary">Daftar Akun</a>
          </div>
        `);
      } else {
        this.view.showError('form-error', result.message || 'Gagal membagikan story.');
      }
    } catch (error) {
      this.view.showError('form-error', error.message || 'Terjadi kesalahan.');
    } finally {
      this.view.setButtonLoading(false);
    }
  }
  
  async handleCameraOpen() {
    try {
      if (!this.cameraCapture) {
        this.cameraCapture = new CameraCapture();
      }
      
      // Show camera modal (assuming view has this method)
      if (this.view.showCameraModal) {
        this.view.showCameraModal();
      }
      
      // Initialize camera after modal is shown
      const videoElement = this.view.getCameraVideoElement();
      if (videoElement) {
        await this.cameraCapture.initializeCamera(videoElement);
      }
    } catch (error) {
      console.error('Failed to open camera:', error);
      this.view.showError('camera-error', 'Gagal mengakses kamera. Pastikan izin kamera telah diberikan.');
    }
  }
  
  handleCameraClose() {
    if (this.cameraCapture) {
      this.cameraCapture.stopCamera();
    }
    
    // Hide camera modal (assuming view has this method)
    if (this.view.hideCameraModal) {
      this.view.hideCameraModal();
    }
  }
  
  async handleCameraSwitch() {
    try {
      if (this.cameraCapture) {
        await this.cameraCapture.switchCamera();
      }
    } catch (error) {
      console.error('Failed to switch camera:', error);
      this.view.showError('camera-error', 'Gagal mengganti kamera.');
    }
  }
  
  async handleCameraCapture() {
    try {
      if (this.cameraCapture) {
        const photoBlob = await this.cameraCapture.capturePhoto();
        
        // Convert blob to file
        const file = new File([photoBlob], 'camera-photo.jpg', { type: 'image/jpeg' });
        this.handlePhotoSelected(file);
        
        this.handleCameraClose();
      }
    } catch (error) {
      console.error('Failed to capture photo:', error);
      this.view.showError('camera-error', 'Gagal mengambil foto.');
    }
  }

  async handleMapOpen() {
    try {
      this.view.showMapModal();
      
      // Wait for DOM to update and ensure container exists
      let retries = 0;
      const maxRetries = 10;
      
      while (retries < maxRetries) {
        const container = document.getElementById('location-map');
        if (container && container.offsetParent !== null) {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 50));
        retries++;
      }
      
      const container = document.getElementById('location-map');
      if (!container) {
        throw new Error('Map container element not found in DOM');
      }
      
      if (!this.mapsHelper) {
        this.mapsHelper = new MapsHelper();
        this.mapsHelper.setContainer('location-map');
      }
      
      await this.mapsHelper.initialize();
      
      this.mapsHelper.addLocationPicker((location) => {
        this.selectedLocation = { lat: Number(location.lat), lng: Number(location.lng) };
        this.view.enableConfirmButton();
      });
      
    } catch (error) {
      console.error('Failed to initialize map:', error);
      this.view.showError('location-error', 'Gagal memuat peta. Silakan coba lagi.');
    }
  }

  handleMapClose() {
    this.view.hideMapModal();
    this.selectedLocation = null;
    this.view.disableConfirmButton();
  }

  handleMapConfirm() {
    if (this.selectedLocation) {
      this.currentLocation = {
        lat: this.selectedLocation.lat,
        lon: this.selectedLocation.lng
      };
      
      this.view.showLocationStatus(
        `📍 Lokasi dipilih dari peta (${this.selectedLocation.lat.toFixed(6)}, ${this.selectedLocation.lng.toFixed(6)})`
      );
      
      this.view.clearError('location-error');
      this.handleMapClose();
    }
  }
  
  cleanup() {
    // Stop camera if it's active
    if (this.cameraCapture) {
      this.cameraCapture.stopCamera();
      this.cameraCapture = null;
    }
    
    // Hide camera modal to restore body scrolling
    if (this.view && this.view.hideCameraModal) {
      this.view.hideCameraModal();
    }
    
    // Remove event listeners if view has the method
    if (this.view && this.view.removeEventListeners) {
      this.view.removeEventListeners();
    }
  }
}