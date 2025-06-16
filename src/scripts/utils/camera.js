// Camera utility for capturing photos
export class CameraCapture {
  constructor() {
    this.stream = null;
    this.video = null;
    this.canvas = null;
    this.constraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'environment' // Use back camera by default
      }
    };
  }

  async initializeCamera(videoElement) {
    try {
      this.video = videoElement;
      this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
      this.video.srcObject = this.stream;
      
      return new Promise((resolve, reject) => {
        this.video.onloadedmetadata = () => {
          this.video.play();
          resolve();
        };
        this.video.onerror = reject;
      });
    } catch (error) {
      throw new Error(`Camera initialization failed: ${error.message}`);
    }
  }

  capturePhoto() {
    if (!this.video || !this.stream) {
      throw new Error('Camera not initialized');
    }

    // Create canvas if not exists
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
    }

    const context = this.canvas.getContext('2d');
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

    // Convert to blob
    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  }

  async switchCamera() {
    if (!this.stream) return;

    // Switch between front and back camera
    const currentFacingMode = this.constraints.video.facingMode;
    this.constraints.video.facingMode = currentFacingMode === 'environment' ? 'user' : 'environment';

    // Stop current stream
    this.stopCamera();

    // Start with new constraints
    try {
      await this.initializeCamera(this.video);
    } catch (error) {
      // Fallback to original facing mode if switch fails
      this.constraints.video.facingMode = currentFacingMode;
      await this.initializeCamera(this.video);
      throw new Error('Failed to switch camera');
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
      });
      this.stream = null;
    }

    if (this.video) {
      this.video.srcObject = null;
    }
  }

  static isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  static async getAvailableCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Failed to get available cameras:', error);
      return [];
    }
  }
} 