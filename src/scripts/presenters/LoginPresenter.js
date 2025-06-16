export class LoginPresenter {
  constructor({ model, view }) {
    this.model = model;
    this.view = view;
    this.app = null;
  }

  async afterRender(app) {
    this.setApp(app);
    if (this.checkAuthStatus()) {
      return;
    }
    this.setupEventListeners();
  }

  setApp(app) {
    this.app = app;
  }

  setupEventListeners() {
    this.view.setupEventListeners(() => this.handleLogin());
  }

  async handleLogin() {
    const { email, password } = this.view.getFormData();
    
    // Validate inputs
    const emailValidation = this.model.validateEmail(email);
    const passwordValidation = this.model.validatePassword(password);
    
    // Clear previous errors
    this.view.clearError('email-error');
    this.view.clearError('password-error');
    this.view.clearError('form-error');
    
    let hasErrors = false;
    
    if (!emailValidation.valid) {
      this.view.showError('email-error', emailValidation.message);
      hasErrors = true;
    }
    
    if (!passwordValidation.valid) {
      this.view.showError('password-error', passwordValidation.message);
      hasErrors = true;
    }
    
    if (hasErrors) {
      return;
    }
    
    // Show loading state
    this.view.setButtonLoading(true);
    
    try {
      const result = await this.model.loginUser({ email, password });
      
      if (result.error === false) {
        // Success - update navigation and redirect
        if (this.app && this.app.updateNavigation) {
          this.app.updateNavigation();
        }
        
        this.view.showSuccess('Login berhasil! Mengalihkan...');
        setTimeout(() => {
          this.view.navigateToHome();
        }, 1000);
      } else {
        this.view.showError('form-error', result.message || 'Login gagal');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.view.showError('form-error', error.message || 'Terjadi kesalahan saat login');
    } finally {
      this.view.setButtonLoading(false);
    }
  }

  checkAuthStatus() {
    if (this.model.isUserLoggedIn()) {
      this.view.navigateToHome();
      return true;
    }
    return false;
  }
}