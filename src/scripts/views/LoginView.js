export class LoginView {
  async render(user, isOffline = false) {
    return `
      <div class="container">
        <section class="auth-container" aria-labelledby="login-title">
          <div class="auth-card">
            <header class="auth-header">
              <h1 id="login-title">Login</h1>
              <p class="auth-subtitle">Masuk ke akun Dicoding Stories Anda</p>
            </header>
            
            <form id="login-form" class="auth-form" novalidate aria-describedby="form-instructions">
              <p id="form-instructions" class="sr-only">Masukkan email dan password Anda untuk login. Pesan error akan muncul jika ada kesalahan input.</p>
              
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
                  autocomplete="current-password"
                  aria-describedby="password-error"
                  aria-invalid="false"
                >
                <div class="error-message" id="password-error" role="alert" aria-live="assertive"></div>
              </div>
              
              <div class="form-group">
                <button type="submit" class="btn btn-primary btn-full" id="login-btn" aria-describedby="login-status">
                  <span class="btn-text">Login</span>
                  <span class="btn-loading" style="display: none;">
                    <span class="spinner" aria-hidden="true"></span> Memproses...
                  </span>
                </button>
                <div id="login-status" class="sr-only" aria-live="polite"></div>
              </div>
              
              <div class="error-message" id="form-error" role="alert" aria-live="assertive"></div>
            </form>
            
            <nav class="auth-links" aria-label="Opsi autentikasi lainnya">
              <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
              <p>Atau <a href="#/add-guest-story">bagikan story sebagai tamu</a></p>
            </nav>
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
    const submitBtn = document.getElementById('login-btn');
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
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;
    return { email, password };
  }

  setupEventListeners(loginCallback) {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        loginCallback();
      });
    }
  }

  navigateToHome() {
    window.location.hash = '#/';
  }
}