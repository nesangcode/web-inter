import { register, isLoggedIn } from '../data/api';

export class RegisterModel {
  async registerUser(userData) {
    try {
      const response = await register(userData);
      return response;
    } catch (error) {
      console.error('Registration error in model:', error);
      // Re-throw the error to be caught by the presenter
      throw error;
    }
  }

  validateName(name) {
    if (!name || name.trim().length === 0) {
      return { valid: false, message: 'Nama tidak boleh kosong.' };
    }
    return { valid: true };
  }

  validateEmail(email) {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return { valid: false, message: 'Format email tidak valid.' };
    }
    return { valid: true };
  }

  validatePassword(password) {
    if (!password || password.length < 8) {
      return { valid: false, message: 'Password harus memiliki setidaknya 8 karakter.' };
    }
    return { valid: true };
  }

  isUserLoggedIn() {
    return isLoggedIn();
  }
} 