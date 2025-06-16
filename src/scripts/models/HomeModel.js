import { getStories, isLoggedIn } from '../data/api';
import IndexedDBManager from '../utils/indexeddb.js';

export class HomeModel {
  constructor() {
    this.stories = [];
  }

  async loadStories() {
    if (!isLoggedIn()) {
      throw new Error('User not logged in');
    }

    try {
      // Try to fetch from API first
      const response = await getStories({
        size: 12
      });

      if (response.listStory && response.listStory.length > 0) {
        this.stories = response.listStory;
        
        // Cache stories in IndexedDB for offline access
        try {
          await IndexedDBManager.init();
          for (const story of response.listStory) {
            await IndexedDBManager.addStory(story);
          }
          console.log('Stories cached for offline access:', response.listStory.length);
        } catch (cacheError) {
          console.warn('Failed to cache stories:', cacheError);
        }
        
        return this.stories;
      } else {
        this.stories = [];
        return [];
      }
    } catch (error) {
      console.log('API failed, trying IndexedDB fallback for stories');
      
      // If API fails, try to get cached stories from IndexedDB
      try {
        await IndexedDBManager.init();
        const cachedStories = await IndexedDBManager.getStories();
        
        if (cachedStories && cachedStories.length > 0) {
          console.log('Stories loaded from IndexedDB cache:', cachedStories.length);
          this.stories = cachedStories;
          return this.stories;
        } else {
          console.log('No cached stories found in IndexedDB');
          this.stories = [];
          throw new Error('Tidak dapat memuat cerita. Pastikan Anda terhubung ke internet atau telah melihat cerita sebelumnya.');
        }
      } catch (dbError) {
        console.error('IndexedDB fallback failed:', dbError);
        throw new Error('Tidak dapat memuat cerita. Periksa koneksi internet Anda.');
      }
    }
  }

  getStories() {
    return this.stories;
  }

  isUserLoggedIn() {
    return isLoggedIn();
  }
}