import { login, isLoggedIn } from '../data/api';

export class LoginModel {
  constructor() {
    this.isLoading = false;
  }

  async loginUser(credentials) {
    this.isLoading = true;
    
    try {
      const result = await login(credentials);
      this.isLoading = false;
      return result;
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }

  isUserLoggedIn() {
    return isLoggedIn();
  }

  getIsLoading() {
    return this.isLoading;
  }

  validateEmail(email) {
    if (!email) {
      return { valid: false, message: 'Email wajib diisi' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Format email tidak valid' };
    }

    return { valid: true };
  }

  validatePassword(password) {
    if (!password) {
      return { valid: false, message: 'Password wajib diisi' };
    }

    if (password.length < 8) {
      return { valid: false, message: 'Password minimal 8 karakter' };
    }

    return { valid: true };
  }
} 