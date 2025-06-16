import { StoryDetailModel } from '../models/StoryDetailModel';
import { StoryDetailView } from '../views/StoryDetailView';
import { parseActivePathname, getCurrentUrl } from '../routes/url-parser';
import IndexedDBManager from '../utils/indexeddb.js';
import { FavoritesPresenter } from './FavoritesPresenter.js';

export class StoryDetailPresenter {
  constructor() {
    this.model = new StoryDetailModel();
    this.view = new StoryDetailView();
  }

  async afterRender() {
    try {
      // Check if user is logged in
      if (!this.model.isUserLoggedIn()) {
        this.view.displayAuthRequired();
        return;
      }

      // Extract story ID from URL
      const urlSegments = parseActivePathname();
      const storyId = urlSegments.resource === 'story' ? urlSegments.id : null;
      if (!storyId) {
        this.view.displayInvalidStory();
        return;
      }

      // Load story data
      await this.loadStoryDetail(storyId);
    } catch (error) {
      console.error('Error initializing story detail:', error);
      this.view.displayInvalidStory();
    }
  }

  async loadStoryDetail(storyId) {
    try {
      const story = await this.model.getStoryDetail(storyId);
      const formattedDate = this.model.formatDate(story.createdAt);
      
      await this.view.renderStoryDetail(story, formattedDate);
      this.setupEventHandlers();
    } catch (error) {
      console.error('Error loading story detail:', error);
      this.view.renderError(error.message || 'Gagal memuat detail story.');
      this.setupErrorHandlers();
    }
  }

  async setupEventHandlers() {
    const handlers = {
      shareStory: this.handleShareStory.bind(this),
      showImageModal: this.handleShowImageModal.bind(this),
      toggleFavorite: this.handleToggleFavorite.bind(this)
    };
    
    this.view.setupEventListeners(handlers);
    
    // Check and update favorite status
    await this.updateFavoriteStatus();
  }

  setupErrorHandlers() {
    this.view.setupEventListeners({});
  }

  handleShowImageModal(imageSrc, alt) {
    this.view.showImageModal(imageSrc, alt);
  }

  async handleShareStory() {
    try {
      const story = this.model.getStory();
      if (!story) {
        this.view.showToast('Story tidak tersedia untuk dibagikan.');
        return;
      }

      const shareData = this.model.generateShareData(story, getCurrentUrl());
      
      if (navigator.share) {
        await navigator.share(shareData);
        this.view.showToast('Story berhasil dibagikan!');
      } else {
        // Fallback: copy to clipboard
        const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        this.view.showToast('Link story berhasil disalin ke clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing story:', error);
        this.view.showToast('Gagal membagikan story.');
      }
    }
  }

  async handleToggleFavorite(storyId) {
    try {
      // Initialize IndexedDB if not already done
      await IndexedDBManager.init();
      
      const isInFavorites = await FavoritesPresenter.isInFavorites(storyId);
      
      if (isInFavorites) {
        // Remove from favorites
        const success = await FavoritesPresenter.removeFromFavorites(storyId);
        if (success) {
          this.view.updateFavoriteButton(false);
          this.view.showFavoriteMessage('Cerita berhasil dihapus dari favorit');
        } else {
          this.view.showFavoriteMessage('Gagal menghapus cerita dari favorit', false);
        }
      } else {
        // Add to favorites
        const story = this.model.getStory();
        if (story) {
          // Add timestamp when added to favorites
          const storyWithTimestamp = {
            ...story,
            addedAt: new Date().toISOString()
          };
          
          const success = await FavoritesPresenter.addToFavorites(storyWithTimestamp);
          if (success) {
            this.view.updateFavoriteButton(true);
            this.view.showFavoriteMessage('Cerita berhasil ditambahkan ke favorit');
          } else {
            this.view.showFavoriteMessage('Gagal menambahkan cerita ke favorit', false);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      this.view.showFavoriteMessage('Terjadi kesalahan saat mengelola favorit', false);
    }
  }

  async updateFavoriteStatus() {
    try {
      await IndexedDBManager.init();
      const story = this.model.getStory();
      if (story) {
        const isInFavorites = await FavoritesPresenter.isInFavorites(story.id);
        this.view.updateFavoriteButton(isInFavorites);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  }



  // Method to get current story data (useful for external access)
  getCurrentStory() {
    return this.model.getStory();
  }

  // Method to check loading state
  isLoading() {
    return this.model.getIsLoading();
  }



  // Cleanup method
  destroy() {
    this.view.removeEventListeners();
  }
}