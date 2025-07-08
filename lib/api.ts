// Real-time API service layer for backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('auth-token');
    
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
          localStorage.removeItem('auth-token');
          window.location.href = '/auth/login';
          throw new Error('Authentication required');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async signup(userData: { name: string; email: string; password: string }) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async loginWithGoogle() {
    // This would typically redirect to Google OAuth
    return this.request('/auth/google', {
      method: 'POST',
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken() {
    return this.request('/auth/refresh', {
      method: 'POST',
    });
  }

  // User data endpoints
  async getUserProfile() {
    return this.request('/user/profile');
  }

  async updateUserSettings(settings: any) {
    return this.request('/user/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Real-time data endpoints
  async getBurnoutMetrics(timeframe: string = '7d') {
    return this.request(`/api/burnout/metrics?timeframe=${timeframe}`);
  }

  async getWorkPatterns(timeframe: string = '7d') {
    return this.request(`/api/work-patterns?timeframe=${timeframe}`);
  }

  async getRecentJournals(limit: number = 10) {
    return this.request(`/api/journal/recent?limit=${limit}`);
  }

  // Google integrations
  async connectGoogleCalendar(authCode: string) {
    return this.request('/integrations/google/calendar/connect', {
      method: 'POST',
      body: JSON.stringify({ auth_code: authCode }),
    });
  }

  async connectGmail(authCode: string) {
    return this.request('/integrations/google/gmail/connect', {
      method: 'POST',
      body: JSON.stringify({ auth_code: authCode }),
    });
  }

  async syncGoogleData() {
    return this.request('/integrations/google/sync', {
      method: 'POST',
    });
  }

  async getGoogleCalendarEvents(startDate: string, endDate: string) {
    return this.request(`/integrations/google/calendar/events?start=${startDate}&end=${endDate}`);
  }

  async getGmailAnalysis(timeframe: string = '7d') {
    return this.request(`/integrations/google/gmail/analysis?timeframe=${timeframe}`);
  }

  // Journal endpoints
  async createJournalEntry(content: string) {
    return this.request('/api/journal/entries', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async getJournalEntries(limit: number = 10, offset: number = 0) {
    return this.request(`/api/journal/entries?limit=${limit}&offset=${offset}`);
  }

  async analyzeSentiment(text: string) {
    return this.request('/api/analysis/sentiment', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  // Recommendations
  async getRecommendations() {
    return this.request('/api/recommendations');
  }

  async markRecommendationComplete(recommendationId: string) {
    return this.request(`/api/recommendations/${recommendationId}/complete`, {
      method: 'POST',
    });
  }

  // Real-time triggers
  async triggerBurnoutAnalysis() {
    return this.request('/api/analysis/trigger', {
      method: 'POST',
    });
  }

  async requestDataSync() {
    return this.request('/api/sync/request', {
      method: 'POST',
    });
  }

  // Notifications
  async getNotifications() {
    return this.request('/api/notifications');
  }

  async markNotificationRead(notificationId: string) {
    return this.request(`/api/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();

// Types for API responses
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    created_at: string;
  };
}

export interface BurnoutMetricsResponse {
  score: number;
  risk_level: 'low' | 'moderate' | 'high';
  factors: {
    work_hours: number;
    email_stress: number;
    meeting_load: number;
    break_frequency: number;
    sentiment: number;
  };
  trend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
  last_updated: string;
}

export interface WorkPatternResponse {
  patterns: Array<{
    date: string;
    work_hours: number;
    meeting_count: number;
    email_count: number;
    break_duration: number;
    after_hours_activity: boolean;
  }>;
  insights: Array<{
    type: 'warning' | 'success' | 'info';
    title: string;
    description: string;
    metric_value: string;
  }>;
}

export interface JournalResponse {
  entries: Array<{
    id: string;
    content: string;
    sentiment_score: number;
    sentiment_label: 'positive' | 'neutral' | 'negative';
    created_at: string;
    ai_insights?: string[];
  }>;
  total: number;
}

export interface SentimentResponse {
  score: number;
  label: 'positive' | 'neutral' | 'negative';
  confidence: number;
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
  };
  keywords: string[];
}