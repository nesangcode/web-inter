import { addStory, isLoggedIn } from '../data/api';

export class AddStoryModel {
  constructor() {
    this.isLoading = false;
    this.currentLocation = null;
    this.selectedLocation = null;
  }

  async addStory(storyData) {
    this.isLoading = true;
    
    try {
      const result = await addStory(storyData);
      this.isLoading = false;
      return result;
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }

  isUserLoggedIn() {
    return isLoggedIn();
  }

  getIsLoading() {
    return this.isLoading;
  }

  setCurrentLocation(location) {
    this.currentLocation = location;
  }

  getCurrentLocation() {
    return this.currentLocation;
  }

  setSelectedLocation(location) {
    this.selectedLocation = location;
  }

  getSelectedLocation() {
    return this.selectedLocation;
  }

  getLocationToUse() {
    return this.selectedLocation || this.currentLocation;
  }

  validatePhoto(file) {
    if (!file) {
      return { valid: false, message: 'Foto wajib dipilih' };
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, message: 'Format foto harus JPG atau PNG' };
    }
    
    // Check file size (1MB = 1024 * 1024 bytes)
    const maxSize = 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      return { valid: false, message: 'Ukuran foto maksimal 1MB' };
    }
    
    return { valid: true };
  }

  validateDescription(description) {
    if (!description || !description.trim()) {
      return { valid: false, message: 'Deskripsi story wajib diisi' };
    }
    
    if (description.trim().length < 10) {
      return { valid: false, message: 'Deskripsi minimal 10 karakter' };
    }
    
    return { valid: true };
  }

  prepareStoryData(formData) {
    const storyData = {
      description: formData.description,
      photo: formData.photoFile
    };
    
    // Add location if available
    const location = this.getLocationToUse();
    if (location) {
      storyData.lat = location.lat;
      storyData.lon = location.lon || location.lng; // Handle both lat/lon and lat/lng
    }
    
    return storyData;
  }

  async getCurrentLocationFromBrowser() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation tidak didukung oleh browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          let message = 'Gagal mendapatkan lokasi';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Akses lokasi ditolak';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Lokasi tidak tersedia';
              break;
            case error.TIMEOUT:
              message = 'Timeout mendapatkan lokasi';
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
}