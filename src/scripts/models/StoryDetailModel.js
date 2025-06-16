import { getStoryDetail, isLoggedIn } from '../data/api';
import IndexedDBManager from '../utils/indexeddb.js';

export class StoryDetailModel {
  constructor() {
    this.story = null;
    this.isLoading = false;
  }

  async getStoryDetail(storyId) {
    this.isLoading = true;
    
    try {
      // Try to fetch from API first
      const response = await getStoryDetail(storyId);
      this.isLoading = false;
      
      if (response.error === false && response.story) {
        this.story = response.story;
        
        // Cache the story in IndexedDB for offline access
        try {
          await IndexedDBManager.addStory(response.story);
          console.log('Story cached for offline access:', storyId);
        } catch (cacheError) {
          console.warn('Failed to cache story:', cacheError);
        }
        
        return response.story;
      } else {
        throw new Error('Story tidak ditemukan atau tidak dapat diakses.');
      }
    } catch (error) {
      this.isLoading = false;
      
      // If API fails, try to get from IndexedDB (offline fallback)
      console.log('API failed, trying IndexedDB fallback for story:', storyId);
      try {
        await IndexedDBManager.init();
        const cachedStory = await IndexedDBManager.getStory(storyId);
        
        if (cachedStory) {
          console.log('Story loaded from IndexedDB cache:', storyId);
          this.story = cachedStory;
          return cachedStory;
        } else {
          console.log('Story not found in IndexedDB cache:', storyId);
          throw new Error('Story tidak ditemukan. Pastikan Anda terhubung ke internet atau story telah disimpan sebelumnya.');
        }
      } catch (dbError) {
        console.error('IndexedDB fallback failed:', dbError);
        throw new Error('Story tidak dapat dimuat. Periksa koneksi internet Anda.');
      }
    }
  }

  isUserLoggedIn() {
    return isLoggedIn();
  }

  getStory() {
    return this.story;
  }

  getIsLoading() {
    return this.isLoading;
  }



  formatDate(dateString) {
    const createdDate = new Date(dateString);
    return createdDate.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  generateShareData(story, url) {
    return {
      title: `Dicoding Story dari ${story.name}`,
      text: story.description,
      url: url
    };
  }

  generateMapsUrl(lat, lon) {
    return `https://www.google.com/maps?q=${lat},${lon}`;
  }
}