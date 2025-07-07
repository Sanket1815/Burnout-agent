// Frontend API service layer for backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get token from session storage
    let token = '';
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('auth_session');
      if (session) {
        try {
          const parsedSession = JSON.parse(session);
          token = parsedSession.token || '';
        } catch (error) {
          console.error('Error parsing session:', error);
        }
      }
    }
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_session');
            window.location.href = '/auth/login';
          }
          throw new Error('Authentication required');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(credentials: { email: string; password: string }) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async signup(userData: { name: string; email: string; password: string }) {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Real-time data endpoints
  async getBurnoutMetrics(timeframe: string = '7d') {
    return this.request(`/api/burnout/metrics?timeframe=${timeframe}`);
  }

  async getJournalEntries(limit: number = 10) {
    return this.request(`/api/journal/entries?limit=${limit}`);
  }

  async createJournalEntry(content: string) {
    return this.request('/api/journal/entries', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/api/health');
  }
}

export const apiService = new ApiService();