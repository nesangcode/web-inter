class IndexedDBManager {
  constructor() {
    this.dbName = 'DicodingStoriesDB';
    this.dbVersion = 2;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create stories store
        if (!db.objectStoreNames.contains('stories')) {
          const storiesStore = db.createObjectStore('stories', { keyPath: 'id' });
          storiesStore.createIndex('createdAt', 'createdAt', { unique: false });
          storiesStore.createIndex('name', 'name', { unique: false });
        }

        // Create favorites store
        if (!db.objectStoreNames.contains('favorites')) {
          const favoritesStore = db.createObjectStore('favorites', { keyPath: 'id' });
          favoritesStore.createIndex('addedAt', 'addedAt', { unique: false });
        }

        // Create offline queue store
        if (!db.objectStoreNames.contains('offlineQueue')) {
          const queueStore = db.createObjectStore('offlineQueue', { keyPath: 'id', autoIncrement: true });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
          queueStore.createIndex('type', 'type', { unique: false });
        }

        // Create images store for offline image caching
        if (!db.objectStoreNames.contains('images')) {
          const imagesStore = db.createObjectStore('images', { keyPath: 'url' });
          imagesStore.createIndex('storyId', 'storyId', { unique: false });
          imagesStore.createIndex('cachedAt', 'cachedAt', { unique: false });
        }

        console.log('IndexedDB stores created/updated');
      };
    });
  }

  async addStory(story) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['stories'], 'readwrite');
      const store = transaction.objectStore('stories');
      
      const request = store.put({
        ...story,
        cachedAt: new Date().toISOString()
      });

      request.onsuccess = () => {
        console.log('Story added to IndexedDB:', story.id);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to add story to IndexedDB:', request.error);
        reject(request.error);
      };
    });
  }

  async getStories() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['stories'], 'readonly');
      const store = transaction.objectStore('stories');
      const request = store.getAll();

      request.onsuccess = () => {
        console.log('Retrieved stories from IndexedDB:', request.result.length);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to get stories from IndexedDB:', request.error);
        reject(request.error);
      };
    });
  }

  async getStory(id) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['stories'], 'readonly');
      const store = transaction.objectStore('stories');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to get story from IndexedDB:', request.error);
        reject(request.error);
      };
    });
  }

  async deleteStory(id) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['stories'], 'readwrite');
      const store = transaction.objectStore('stories');
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('Story deleted from IndexedDB:', id);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to delete story from IndexedDB:', request.error);
        reject(request.error);
      };
    });
  }

  async addToFavorites(story) {
    if (!this.db) await this.init();
    
    // Cache the image if it exists
    if (story.photoUrl) {
      try {
        await this.cacheImage(story.photoUrl, story.id);
        console.log('Image cached for favorite story:', story.id);
      } catch (error) {
        console.warn('Failed to cache image for favorite story:', error);
        // Continue even if image caching fails
      }
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['favorites'], 'readwrite');
      const store = transaction.objectStore('favorites');
      
      const request = store.put({
        ...story,
        addedAt: new Date().toISOString()
      });

      request.onsuccess = () => {
        console.log('Story added to favorites:', story.id);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to add to favorites:', request.error);
        reject(request.error);
      };
    });
  }

  async getFavorites() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['favorites'], 'readonly');
      const store = transaction.objectStore('favorites');
      const request = store.getAll();

      request.onsuccess = () => {
        console.log('Retrieved favorites from IndexedDB:', request.result.length);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to get favorites from IndexedDB:', request.error);
        reject(request.error);
      };
    });
  }

  async removeFromFavorites(id) {
    if (!this.db) await this.init();
    
    // Get the story first to find its image URL
    const story = await this.getFavoriteById(id);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['favorites'], 'readwrite');
      const store = transaction.objectStore('favorites');
      const request = store.delete(id);

      request.onsuccess = async () => {
        console.log('Story removed from favorites:', id);
        
        // Remove cached image if it exists
        if (story && story.photoUrl) {
          try {
            await this.removeCachedImage(story.photoUrl);
            console.log('Cached image removed for story:', id);
          } catch (error) {
            console.warn('Failed to remove cached image:', error);
          }
        }
        
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to remove from favorites:', request.error);
        reject(request.error);
      };
    });
  }

  async getFavoriteById(id) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['favorites'], 'readonly');
      const store = transaction.objectStore('favorites');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to get favorite by id:', request.error);
        reject(request.error);
      };
    });
  }

  async addToOfflineQueue(action) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['offlineQueue'], 'readwrite');
      const store = transaction.objectStore('offlineQueue');
      
      const request = store.add({
        ...action,
        timestamp: new Date().toISOString()
      });

      request.onsuccess = () => {
        console.log('Action added to offline queue:', action.type);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to add to offline queue:', request.error);
        reject(request.error);
      };
    });
  }

  async getOfflineQueue() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['offlineQueue'], 'readonly');
      const store = transaction.objectStore('offlineQueue');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to get offline queue:', request.error);
        reject(request.error);
      };
    });
  }

  async clearOfflineQueue() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['offlineQueue'], 'readwrite');
      const store = transaction.objectStore('offlineQueue');
      const request = store.clear();

      request.onsuccess = () => {
        console.log('Offline queue cleared');
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to clear offline queue:', request.error);
        reject(request.error);
      };
    });
  }

  async clearAllData() {
    if (!this.db) await this.init();
    
    const stores = ['stories', 'favorites', 'offlineQueue', 'images'];
    const promises = stores.map(storeName => {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });

    try {
      await Promise.all(promises);
      console.log('All IndexedDB data cleared');
    } catch (error) {
      console.error('Failed to clear IndexedDB data:', error);
      throw error;
    }
  }

  // Image caching methods
  async cacheImage(url, storyId) {
    if (!this.db) await this.init();
    
    try {
      // Fetch the image
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['images'], 'readwrite');
        const store = transaction.objectStore('images');
        
        const imageData = {
          url: url,
          storyId: storyId,
          blob: blob,
          cachedAt: new Date().toISOString()
        };
        
        const request = store.put(imageData);
        
        request.onsuccess = () => {
          console.log('Image cached successfully:', url);
          resolve(true);
        };
        
        request.onerror = () => {
          console.error('Failed to cache image:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error caching image:', error);
      return false;
    }
  }

  async getCachedImage(url) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');
      const request = store.get(url);
      
      request.onsuccess = () => {
        if (request.result) {
          // Create object URL from blob
          const objectUrl = URL.createObjectURL(request.result.blob);
          resolve(objectUrl);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => {
        console.error('Failed to get cached image:', request.error);
        reject(request.error);
      };
    });
  }

  async removeCachedImage(url) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      const request = store.delete(url);
      
      request.onsuccess = () => {
        console.log('Cached image removed:', url);
        resolve(true);
      };
      
      request.onerror = () => {
        console.error('Failed to remove cached image:', request.error);
        reject(request.error);
      };
    });
  }
}

export default new IndexedDBManager();