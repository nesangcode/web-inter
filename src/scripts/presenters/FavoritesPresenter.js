import { FavoritesView } from '../views/FavoritesView.js';
import IndexedDBManager from '../utils/indexeddb.js';

export class FavoritesPresenter {
  constructor({ view }) {
    this.view = view || new FavoritesView();
    this.favorites = [];
  }

  async afterRender() {
    await this.init();
  }

  async init() {
    try {
      // Initialize IndexedDB
      await IndexedDBManager.init();
      
      // Setup event handlers
      this.view.setupEventListeners({
        loadFavorites: this.loadFavorites.bind(this),
        clearFavorites: this.handleClearFavorites.bind(this)
      });

      // Set remove favorite handler
      this.view.setRemoveFavoriteHandler(this.handleRemoveFavorite.bind(this));

      // Load favorites
      await this.loadFavorites();
    } catch (error) {
      console.error('Failed to initialize FavoritesPresenter:', error);
      this.view.showError('Gagal menginisialisasi halaman favorit');
    }
  }

  async loadFavorites() {
    try {
      this.view.showLoading();
      
      // Get favorites from IndexedDB
      this.favorites = await IndexedDBManager.getFavorites();
      
      // Sort by addedAt date (newest first)
      this.favorites.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
      
      await this.view.displayFavorites(this.favorites);
    } catch (error) {
      console.error('Failed to load favorites:', error);
      this.view.showError('Gagal memuat cerita favorit');
    }
  }

  async handleRemoveFavorite(storyId) {
    try {
      // Show confirmation dialog
      const confirmed = confirm('Apakah Anda yakin ingin menghapus cerita ini dari favorit?');
      
      if (!confirmed) {
        return;
      }

      // Remove from IndexedDB
      await IndexedDBManager.removeFromFavorites(storyId);
      
      // Update local favorites array
      this.favorites = this.favorites.filter(story => story.id !== storyId);
      
      // Update view
      this.view.displayFavorites(this.favorites);
      this.view.showSuccessMessage('Cerita berhasil dihapus dari favorit');
      
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      this.view.showErrorMessage('Gagal menghapus cerita dari favorit');
    }
  }

  async handleClearFavorites() {
    try {
      // Show confirmation dialog
      const confirmed = confirm('Apakah Anda yakin ingin menghapus semua cerita favorit? Tindakan ini tidak dapat dibatalkan.');
      
      if (!confirmed) {
        return;
      }

      this.view.showLoading();
      
      // Clear all favorites from IndexedDB
      const transaction = IndexedDBManager.db.transaction(['favorites'], 'readwrite');
      const store = transaction.objectStore('favorites');
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      // Update local favorites array
      this.favorites = [];
      
      // Update view
      this.view.showEmpty();
      this.view.showSuccessMessage('Semua cerita favorit berhasil dihapus');
      
    } catch (error) {
      console.error('Failed to clear favorites:', error);
      this.view.showError('Gagal menghapus semua cerita favorit');
    }
  }

  // Method to add story to favorites (can be called from other presenters)
  static async addToFavorites(story) {
    try {
      await IndexedDBManager.addToFavorites(story);
      return true;
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      return false;
    }
  }

  // Method to check if story is in favorites
  static async isInFavorites(storyId) {
    try {
      const favorites = await IndexedDBManager.getFavorites();
      return favorites.some(story => story.id === storyId);
    } catch (error) {
      console.error('Failed to check favorites:', error);
      return false;
    }
  }

  // Method to remove from favorites (can be called from other presenters)
  static async removeFromFavorites(storyId) {
    try {
      await IndexedDBManager.removeFromFavorites(storyId);
      return true;
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      return false;
    }
  }

  cleanup() {
    // Clean up any resources if needed
    this.favorites = [];
  }
}