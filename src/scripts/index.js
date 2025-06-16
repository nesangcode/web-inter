// CSS imports
import '../styles/styles.css';

import AppPresenter from './presenters/AppPresenter';
import AppView from './views/AppView';
import { ViewTransitions } from './utils/view-transitions';
import PushNotificationManager from './utils/push-notifications';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize view transitions
  ViewTransitions.addCustomTransitions();
  
  // Setup skip to content functionality
  const mainContent = document.querySelector('#main-content');
  const skipLink = document.querySelector('.skip-to-content');
  
  if (skipLink && mainContent) {
    skipLink.addEventListener('click', function (event) {
      event.preventDefault(); // Mencegah refresh halaman
      skipLink.blur(); // Menghilangkan fokus skip to content
      
      mainContent.focus(); // Fokus ke konten utama
      mainContent.scrollIntoView(); // Halaman scroll ke konten utama
    });
  }
  
  const view = new AppView({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  const app = new AppPresenter({ view });
  
  // Expose app instance globally for offline event handling
  window.app = app;
  
  // Initialize push notifications
  try {
    await PushNotificationManager.init();
    console.log('Push notification manager initialized');
  } catch (error) {
    console.warn('Failed to initialize push notifications:', error);
  }
  
  // Pass app instance to renderPage
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});

// Handle hot module replacement
if (module.hot) {
  module.hot.accept();
}
