import CONFIG from '../config';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORIES_GUEST: `${CONFIG.BASE_URL}/stories/guest`,
  STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  NOTIFICATIONS_SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
  NOTIFICATIONS_UNSUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

// Helper function to get auth token
const getAuthToken = () => localStorage.getItem('authToken');

// Helper function to create headers with auth
const createAuthHeaders = (contentType = 'application/json') => {
  const headers = {};
  
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Authentication APIs
export async function register(userData) {
  try {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Registration failed');
    }
    
    return result;
  } catch (error) {
    throw new Error(error.message || 'Network error occurred during registration');
  }
}

export async function login(credentials) {
  try {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Login failed');
    }
    
    // Store auth token
    if (result.loginResult && result.loginResult.token) {
      localStorage.setItem('authToken', result.loginResult.token);
      localStorage.setItem('userId', result.loginResult.userId);
      localStorage.setItem('userName', result.loginResult.name);
    }
    
    return result;
  } catch (error) {
    throw new Error(error.message || 'Network error occurred during login');
  }
}

export function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
}

export function isLoggedIn() {
  return !!getAuthToken();
}

export function getCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;
  
  return {
    userId: localStorage.getItem('userId'),
    name: localStorage.getItem('userName'),
    token: token,
  };
}

// Story APIs
export async function getStories(params = {}) {
  try {
    const urlParams = new URLSearchParams();
    
    if (params.page) urlParams.append('page', params.page);
    if (params.size) urlParams.append('size', params.size);
    if (params.location !== undefined) urlParams.append('location', params.location);
    
    const url = `${ENDPOINTS.STORIES}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createAuthHeaders(),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch stories');
    }
    
    return result;
  } catch (error) {
    throw new Error(error.message || 'Network error occurred while fetching stories');
  }
}

export async function getStoryDetail(storyId) {
  try {
    const response = await fetch(ENDPOINTS.STORY_DETAIL(storyId), {
      method: 'GET',
      headers: createAuthHeaders(),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch story detail');
    }
    
    return result;
  } catch (error) {
    throw new Error(error.message || 'Network error occurred while fetching story detail');
  }
}

export async function addStory(storyData) {
  try {
    const formData = new FormData();
    formData.append('description', storyData.description);
    formData.append('photo', storyData.photo);
    
    if (storyData.lat) formData.append('lat', storyData.lat);
    if (storyData.lon) formData.append('lon', storyData.lon);
    
    const response = await fetch(ENDPOINTS.STORIES, {
      method: 'POST',
      headers: createAuthHeaders(null), // Don't set Content-Type for FormData
      body: formData,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to add story');
    }
    
    return result;
  } catch (error) {
    throw new Error(error.message || 'Network error occurred while adding story');
  }
}

export async function addGuestStory(storyData) {
  try {
    const formData = new FormData();
    formData.append('description', storyData.description);
    formData.append('photo', storyData.photo);
    
    if (storyData.lat) formData.append('lat', storyData.lat);
    if (storyData.lon) formData.append('lon', storyData.lon);
    
    const response = await fetch(ENDPOINTS.STORIES_GUEST, {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to add guest story');
    }
    
    return result;
  } catch (error) {
    throw new Error(error.message || 'Network error occurred while adding guest story');
  }
}

// Push Notification APIs
export async function subscribeToNotifications(subscription) {
  try {
    const response = await fetch(ENDPOINTS.NOTIFICATIONS_SUBSCRIBE, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to subscribe to notifications');
    }
    
    return result;
  } catch (error) {
    throw new Error(error.message || 'Network error occurred while subscribing to notifications');
  }
}

export async function unsubscribeFromNotifications(endpoint) {
  try {
    const response = await fetch(ENDPOINTS.NOTIFICATIONS_UNSUBSCRIBE, {
      method: 'DELETE',
      headers: createAuthHeaders(),
      body: JSON.stringify({ endpoint }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to unsubscribe from notifications');
    }
    
    return result;
  } catch (error) {
    throw new Error(error.message || 'Network error occurred while unsubscribing from notifications');
  }
}