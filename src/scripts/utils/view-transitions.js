// View Transitions API utility for smooth page transitions
export class ViewTransitions {
  static _isTransitioning = false;

  static isSupported() {
    return 'startViewTransition' in document;
  }

  static async transition(updateCallback, transitionType = 'default') {
    if (!this.isSupported()) {
      // Fallback for browsers that don't support View Transitions
      await updateCallback();
      return;
    }

    // If already transitioning, skip the transition and just update
    if (this._isTransitioning) {
      await updateCallback();
      return;
    }

    try {
      // Set transition state
      this._isTransitioning = true;
      
      // Start the transition with a simple callback
      const transition = document.startViewTransition(async () => {
        await updateCallback();
      });

      // Wait for the transition to complete
      await transition.finished;
      
    } catch (error) {
      console.warn('View Transition failed:', error);
      // Fallback to direct update if transition fails
      await updateCallback();
    } finally {
      // Always reset the transition state
      this._isTransitioning = false;
    }
  }

  static addTransitionName(element, name) {
    if (!this.isSupported() || !element) return;
    
    try {
      element.style.viewTransitionName = name;
    } catch (error) {
      console.warn('Failed to add transition name:', error);
    }
  }

  static removeTransitionName(element) {
    if (!this.isSupported() || !element) return;
    
    try {
      element.style.viewTransitionName = 'none';
    } catch (error) {
      console.warn('Failed to remove transition name:', error);
    }
  }

  // Predefined transition animations
  static addCustomTransitions() {
    if (!this.isSupported()) return;

    // Check if styles are already added to prevent duplicates
    if (document.querySelector('#view-transitions-styles')) return;

    const style = document.createElement('style');
    style.id = 'view-transitions-styles';
    style.textContent = `
      /* Simple fade transition for all pages */
      ::view-transition-old(root) {
        animation: fadeOut 0.2s ease-out;
      }
      
      ::view-transition-new(root) {
        animation: fadeIn 0.2s ease-in;
      }

      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      /* Reduce motion for users who prefer it */
      @media (prefers-reduced-motion: reduce) {
        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
} 