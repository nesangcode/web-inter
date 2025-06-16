export class RegisterView {
  async render(user, isOffline = false) {
    return `
      <div class="container">
        <section class="auth-container" aria-labelledby="register-title">
          <div class="auth-card">
            <header class="auth-header">
              <h1 id="register-title">Daftar</h1>
              <p class="auth-subtitle">Buat akun Dicoding Stories baru</p>
            </header>
            
            <form id="register-form" class="auth-form" novalidate aria-describedby="form-instructions">
              <p id="form-instructions" class="sr-only">Masukkan nama, email dan password Anda untuk mendaftar. Pesan error akan muncul jika ada kesalahan input.</p>
              
              <div class="form-group">
                <label for="name">Nama</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  required 
                  placeholder="Masukkan nama Anda"
                  autocomplete="name"
                  aria-describedby="name-error"
                  aria-invalid="false"
                >
                <div class="error-message" id="name-error" role="alert" aria-live="assertive"></div>
              </div>
              
              <div class="form-group">
                <label for="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required 
                  placeholder="Masukkan email Anda"
                  autocomplete="email"
                  aria-describedby="email-error"
                  aria-invalid="false"
                >
                <div class="error-message" id="email-error" role="alert" aria-live="assertive"></div>
              </div>
              
              <div class="form-group">
                <label for="password">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  required 
                  placeholder="Masukkan password Anda"
                  autocomplete="new-password"
                  aria-describedby="password-error"
                  aria-invalid="false"
                >
                <div class="error-message" id="password-error" role="alert" aria-live="assertive"></div>
              </div>
              
              <div class="form-group">
                <button type="submit" class="btn btn-primary btn-full" id="register-btn" aria-describedby="register-status">
                  <span class="btn-text">Daftar</span>
                  <span class="btn-loading" style="display: none;">
                    <span class="spinner" aria-hidden="true"></span> Memproses...
                  </span>
                </button>
              </div>
              
              <div class="error-message" id="form-error" role="alert" aria-live="assertive"></div>
            </form>
            
            <footer class="auth-footer">
              <p>Sudah punya akun? <a href="#/login" class="auth-link">Login di sini</a></p>
            </footer>
          </div>
        </section>
      </div>
    `;
  }

  showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  setButtonLoading(loading) {
    const submitBtn = document.getElementById('register-btn');
    const btnText = submitBtn?.querySelector('.btn-text');
    const btnLoading = submitBtn?.querySelector('.btn-loading');
    
    if (loading) {
      if (btnText) btnText.style.display = 'none';
      if (btnLoading) btnLoading.style.display = 'inline-flex';
      if (submitBtn) submitBtn.disabled = true;
    } else {
      if (btnText) btnText.style.display = 'inline';
      if (btnLoading) btnLoading.style.display = 'none';
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  showSuccess(message) {
    const formError = document.getElementById('form-error');
    if (formError) {
      formError.textContent = message;
      formError.style.display = 'block';
      formError.style.color = '#28a745';
    }
  }

  getFormData() {
    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;
    return { name, email, password };
  }

  setupEventListeners(registerCallback) {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        registerCallback();
      });
    }
  }

  navigateToHome() {
    window.location.hash = '#/';
  }

  navigateToLogin() {
    window.location.hash = '#/login';
  }
}