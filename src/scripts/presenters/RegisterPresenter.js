export class RegisterPresenter {
  constructor({ model, view }) {
    this.model = model;
    this.view = view;
    this.app = null;
  }

  async afterRender(app) {
    this.setApp(app);
    if (this.model.isUserLoggedIn()) {
      this.view.navigateToHome();
      return;
    }
    this.setupEventListeners();
  }

  setApp(app) {
    this.app = app;
  }

  setupEventListeners() {
    this.view.setupEventListeners(() => this.handleRegister());
  }

  async handleRegister() {
    const { name, email, password } = this.view.getFormData();

    // Clear previous errors
    this.view.clearError('name-error');
    this.view.clearError('email-error');
    this.view.clearError('password-error');
    this.view.clearError('form-error');

    // Validate inputs
    const nameValidation = this.model.validateName(name);
    const emailValidation = this.model.validateEmail(email);
    const passwordValidation = this.model.validatePassword(password);

    let hasErrors = false;
    if (!nameValidation.valid) {
      this.view.showError('name-error', nameValidation.message);
      hasErrors = true;
    }
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

    this.view.setButtonLoading(true);

    try {
      const result = await this.model.registerUser({ name, email, password });
      if (result.error === false) {
        this.view.showSuccess('Registrasi berhasil! Mengalihkan ke halaman login...');
        setTimeout(() => {
          this.view.navigateToLogin();
        }, 2000);
      } else {
        this.view.showError('form-error', result.message || 'Registrasi gagal.');
      }
    } catch (error) {
      this.view.showError('form-error', error.message || 'Terjadi kesalahan saat registrasi.');
    } finally {
      this.view.setButtonLoading(false);
    }
  }
}