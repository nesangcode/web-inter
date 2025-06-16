import { AddStoryModel } from '../models/AddStoryModel';
import { AddStoryView } from '../views/AddStoryView';
import { CameraCapture } from '../utils/camera';
import { MapsHelper } from '../utils/maps';

export class AddStoryPresenter {
  constructor({ model, view }) {
    this.model = model;
    this.view = view;
    this.selectedPhoto = null;
    this.currentLocation = null;
    this.cameraCapture = null;
    this.mapsHelper = null;
    this.selectedLocation = null;
  }

  async afterRender() {
    // Check if user is logged in
    if (!this.model.isUserLoggedIn()) {
      this.view.navigateToLogin();
      return;
    }

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.view.setupEventListeners({
      photoSelected: this.handlePhotoSelected.bind(this),
      validateDescription: this.handleValidateDescription.bind(this),
      toggleLocation: this.handleToggleLocation.bind(this),
      getCurrentLocation: this.handleGetCurrentLocation.bind(this),
      submit: this.handleSubmit.bind(this),
      camera: {
        open: this.handleCameraOpen.bind(this),
        close: this.handleCameraClose.bind(this),
        capture: this.handleCameraCapture.bind(this)
      },
      map: {
        open: this.handleMapOpen.bind(this),
        close: this.handleMapClose.bind(this),
        getCurrentLocation: this.handleGetCurrentLocation.bind(this),
        confirm: this.handleMapConfirm.bind(this)
      }
    });
  }

  handlePhotoSelected(file) {
    const validation = this.model.validatePhoto(file);
    if (validation.valid) {
      this.selectedPhoto = file;
      this.view.displayPhotoPreview(file);
      this.view.clearError('photo-error');
    } else {
      this.selectedPhoto = null;
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
  }

  async handleSubmit() {
    // Check if offline
    if (!navigator.onLine) {
      this.view.showError('form-error', '🔴 Tidak dapat mengunggah story saat offline. Silakan terhubung ke internet terlebih dahulu.');
      return;
    }
    
    try {
      const formData = this.view.getFormData();
      
      // Validate photo
      if (!this.selectedPhoto) {
        this.view.showError('photo-error', 'Foto wajib dipilih');
        return;
      }

      // Validate description
      const descriptionValidation = this.model.validateDescription(formData.description);
      if (!descriptionValidation.valid) {
        this.view.showError('description-error', descriptionValidation.message);
        return;
      }

      this.view.showSubmitLoading();
      this.view.clearAllErrors();

      // Prepare story data
      const storyData = this.model.prepareStoryData({
        ...formData,
        photoFile: this.selectedPhoto
      });

      // Submit story
      await this.model.addStory(storyData);
      
      this.view.hideSubmitLoading();
      this.view.showSuccessMessage('Story berhasil ditambahkan!');
      
      // Redirect to home after success
      setTimeout(() => {
        this.view.navigateToHome();
      }, 2000);

    } catch (error) {
      this.view.hideSubmitLoading();
      this.view.showError('submit-error', error.message || 'Gagal menambahkan story');
    }
  }

  handleToggleLocation(enabled) {
    this.view.toggleLocationOptions(enabled);
    if (!enabled) {
      this.model.setSelectedLocation(null);
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
        const location = await this.model.getCurrentLocationFromBrowser();
        this.model.setCurrentLocation(location);
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

  async handleCameraOpen() {
    try {
      if (!this.cameraCapture) {
        this.cameraCapture = new CameraCapture();
      }
      
      this.view.showCameraModal();
      
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
    this.view.hideCameraModal();
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
    this.view.showMapModal();
    
    // Initialize map if not already done
    if (!this.mapsHelper) {
      this.mapsHelper = new MapsHelper();
      await this.mapsHelper.initializeMap('location-map');
      
      // Add location picker functionality
      this.mapsHelper.addLocationPicker((location) => {
        this.selectedLocation = location;
        this.view.enableConfirmButton();
      });
    }
  }

  handleMapClose() {
    this.view.hideMapModal();
  }

  handleMapConfirm() {
    if (this.selectedLocation) {
      this.model.setSelectedLocation(this.selectedLocation);
      this.view.updateLocationDisplay(this.selectedLocation);
      this.view.clearError('location-error');
      this.view.hideMapModal();
      this.view.disableConfirmButton();
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