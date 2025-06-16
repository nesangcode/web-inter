import { addGuestStory } from '../data/api';

export class AddGuestStoryModel {
  async submitStory(storyData) {
    try {
      const response = await addGuestStory(storyData);
      return response;
    } catch (error) {
      console.error('Add guest story error in model:', error);
      throw error;
    }
  }

  validatePhoto(file) {
    if (!file) {
      return { valid: false, message: 'Foto wajib dipilih' };
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, message: 'Format foto harus JPG atau PNG' };
    }
    const maxSize = 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      return { valid: false, message: 'Ukuran foto maksimal 1MB' };
    }
    return { valid: true };
  }

  validateDescription(description) {
    if (!description) {
      return { valid: false, message: 'Deskripsi story wajib diisi' };
    }
    if (description.length < 10) {
      return { valid: false, message: 'Deskripsi minimal 10 karakter' };
    }
    return { valid: true };
  }

  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Browser tidak mendukung geolocation'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          reject(new Error('Gagal mendapatkan lokasi'));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    });
  }
}