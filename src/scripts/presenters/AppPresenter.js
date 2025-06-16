import { getActiveRoute } from '../routes/url-parser';
import routes from '../routes/routes';
import { isLoggedIn, getCurrentUser, logout } from '../data/api';
import { ViewTransitions } from '../utils/view-transitions';

class AppPresenter {
  #view = null;
  #content = null;
  #currentPresenter = null;

  constructor({ view }) {
    this.#view = view;
    this.#content = this.#view.content;

    this._setupNavigationEvents();
    this._setupOfflineEvents();
    this.updateNavigation();
  }

  _setupNavigationEvents() {
    this.#view.setupNavigationEvents(() => {
      logout();
      this.updateNavigation();
      this.#view.navigateToHome();
      setTimeout(() => {
        this.renderPage(this);
      }, 100);
    });
  }

  _setupOfflineEvents() {
    window.addEventListener('online', () => {
      console.log('App is now online');
      this.updateNavigation();
      // Re-render current page to show upload buttons again
      this.renderPage();
    });

    window.addEventListener('offline', () => {
      console.log('App is now offline');
      this.updateNavigation();
      // Re-render current page to hide upload buttons
      this.renderPage();
    });
  }
  
  updateNavigation() {
    const loggedIn = isLoggedIn();
    const user = getCurrentUser();
    const isOffline = !navigator.onLine;
    this.#view.updateNavigation(loggedIn, user, isOffline);
  }

  async renderPage() {
    const url = getActiveRoute();
    const routeConfig = routes[url];

    // Cleanup previous presenter before navigation
    if (this.#currentPresenter && this.#currentPresenter.cleanup) {
      this.#currentPresenter.cleanup();
    }
    this.#currentPresenter = null;

    this.#view.hideAppLoading();

    await ViewTransitions.transition(async () => {
      if (routeConfig && routeConfig.presenter) {
        const model = routeConfig.model ? new routeConfig.model() : null;
        const view = new routeConfig.view();
        const presenter = new routeConfig.presenter({ model, view });
        
        // Store current presenter for cleanup
        this.#currentPresenter = presenter;
        
        const isOffline = !navigator.onLine;
        await this.#view.setContent(await view.render(getCurrentUser(), isOffline));

        if (presenter.afterRender) {
          await presenter.afterRender(this);
        }
      } else {
        this.#view.showNotFoundError();
      }
    });
    
    this.updateNavigation();
  }
}

export default AppPresenter;