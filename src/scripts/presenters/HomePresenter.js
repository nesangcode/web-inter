import { MapsHelper } from '../utils/maps';

export class HomePresenter {
  constructor({ model, view }) {
    this.model = model;
    this.view = view;
    this.mapHelper = null;
    this._setupOfflineEvents();
  }

  async afterRender() {
    this.setupEventListeners();
    await this.loadData();
  }

  async loadData() {
    try {
      if (!this.model.isUserLoggedIn()) {
        this.view.showAuthRequired();
        return;
      }

      const isOffline = !navigator.onLine;
      
      if (isOffline) {
        this.view.showOfflineMode();
      } else {
        this.view.showLoading();
      }
      
      const stories = await this.model.loadStories();
      
      if (stories.length > 0) {
        await this.view.renderStories(stories, isOffline);
        
        // Initialize map if in map view and online
        if (this.view.getIsMapView() && !isOffline) {
          await this.initializeMap();
        } else if (isOffline && this.view.getIsMapView()) {
          // Switch to grid view when offline since map requires internet
          this.switchToGridView();
          this.view.showOfflineMapMessage();
        }
      } else {
        if (isOffline) {
          this.view.showNoOfflineStories();
        } else {
          this.view.showNoStories();
        }
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      const isOffline = !navigator.onLine;
      if (isOffline) {
        this.view.showOfflineError();
      } else {
        this.view.showError(error.message);
      }
    }
  }

  setupEventListeners() {
    this.setupViewToggleListeners();
    this.setupStoryNavigationListeners();
  }

  setupViewToggleListeners() {
    this.view.setupViewToggleListeners(
      () => this.switchToGridView(),
      () => this.switchToMapView()
    );
  }

  setupStoryNavigationListeners() {
    this.view.setupStoryNavigationListeners();
  }



  switchToGridView() {
    this.view.toggleView(false);
    
    if (this.mapHelper) {
      this.mapHelper.destroy();
      this.mapHelper = null;
    }
  }

  async switchToMapView() {
    this.view.toggleView(true);
    
    // Initialize map with delay to ensure container is visible
    setTimeout(async () => {
      await this.initializeMap();
    }, 100);
  }

  async initializeMap() {
    try {
      // Destroy existing map if any
      if (this.mapHelper) {
        this.mapHelper.destroy();
      }
      
      this.mapHelper = new MapsHelper();
      
      // Add markers for stories with location
      const stories = this.model.getStories();
      const storiesWithLocation = stories.filter(story => story.lat && story.lon);

      await this.view.initializeMap(this.mapHelper, storiesWithLocation);
      
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  _setupOfflineEvents() {
    window.addEventListener('online', () => {
      // Re-render the entire page to update auth buttons and content
      if (window.app && window.app.renderPage) {
        window.app.renderPage();
      } else {
        this.loadData();
      }
    });

    window.addEventListener('offline', () => {
      // Re-render the entire page to update auth buttons and content
      if (window.app && window.app.renderPage) {
        window.app.renderPage();
      } else {
        this.loadData();
      }
    });
  }
}