// API client with Basic Auth for Snail Tracker

// Utility function to escape HTML and prevent XSS
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Configuration - Updated for production
const API_BASE_URL = (typeof window !== 'undefined' && window.SNAIL_CONFIG?.apiBaseUrl) 
  ? window.SNAIL_CONFIG.apiBaseUrl
  : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000'
    : 'https://snail-selfie-project.vercel.app';

class SnailAPI {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Get auth headers
  getAuthHeaders() {
    const credentials = sessionStorage.getItem('snail_credentials');
    if (!credentials) {
      throw new Error('Not authenticated');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${credentials}`
    };
  }

  // Login and verify credentials
  async login(username, password) {
    const credentials = btoa(`${username}:${password}`);
    
    try {
      const response = await fetch(`${this.baseUrl}/api/snails`, {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      
      sessionStorage.setItem('snail_credentials', credentials);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Logout
  logout() {
    sessionStorage.removeItem('snail_credentials');
    window.location.href = 'index.html';
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!sessionStorage.getItem('snail_credentials');
  }

  // Snails API
  async getSnails(search = '', sortBy = 'name') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (sortBy) params.append('sortBy', sortBy);
    
    const response = await fetch(`${this.baseUrl}/api/snails?${params}`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to fetch snails');
    return response.json();
  }

  async getSnail(id) {
    const response = await fetch(`${this.baseUrl}/api/snails/${id}`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to fetch snail');
    return response.json();
  }

  async createSnail(data) {
    const response = await fetch(`${this.baseUrl}/api/snails`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to create snail');
    return response.json();
  }

  async updateSnail(id, data) {
    const response = await fetch(`${this.baseUrl}/api/snails/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to update snail');
    return response.json();
  }

  async deleteSnail(id) {
    const response = await fetch(`${this.baseUrl}/api/snails/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to delete snail');
    return response.json();
  }

  // Sightings API
  async createSighting(snailId, data) {
    const response = await fetch(`${this.baseUrl}/api/snails/${snailId}/sightings`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to create sighting');
    return response.json();
  }

  async deleteSighting(id) {
    const response = await fetch(`${this.baseUrl}/api/sightings/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to delete sighting');
    return response.json();
  }

  // Upload API
  async uploadImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const base64 = reader.result.split(',')[1];
          
          const response = await fetch(`${this.baseUrl}/api/upload`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              filename: file.name,
              file: base64
            })
          });
          
          if (!response.ok) throw new Error('Failed to upload image');
          const data = await response.json();
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  // AI API
  async estimateAge(imageUrl) {
    const response = await fetch(`${this.baseUrl}/api/ai/estimate-age`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ imageUrl })
    });
    
    if (!response.ok) throw new Error('Failed to estimate age');
    return response.json();
  }

  async identifySnail(imageUrl) {
    const response = await fetch(`${this.baseUrl}/api/ai/identify`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ imageUrl })
    });
    
    if (!response.ok) throw new Error('Failed to identify snail');
    return response.json();
  }
}

// Create global instance
const api = new SnailAPI();