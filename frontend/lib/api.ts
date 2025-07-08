const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async signup(userData: { email: string; password: string; full_name: string }) {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async signin(credentials: { email: string; password: string }) {
    const response = await this.request<{ access_token: string; token_type: string }>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    this.token = response.access_token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.access_token);
    }

    return response;
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  // Burnout methods
  async getBurnoutMetrics(timeframe: string = '7d') {
    return this.request(`/api/burnout/metrics?timeframe=${timeframe}`);
  }

  async getBurnoutHistory(limit: number = 30) {
    return this.request(`/api/burnout/history?limit=${limit}`);
  }

  async calculateBurnout() {
    return this.request('/api/burnout/calculate', {
      method: 'POST',
    });
  }

  // Journal methods
  async createJournalEntry(content: string) {
    return this.request('/api/journal/', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async getRecentJournalEntries(limit: number = 10) {
    return this.request(`/api/journal/recent?limit=${limit}`);
  }

  // Work sessions methods
  async createWorkSession(sessionData: {
    start_time: string;
    end_time: string;
    activity_type: string;
    productivity_score?: number;
  }) {
    return this.request('/api/work-sessions/', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async getWorkSessions(timeframe: string = '7d') {
    return this.request(`/api/work-sessions/?timeframe=${timeframe}`);
  }

  async getWorkPatterns(timeframe: string = '7d') {
    return this.request(`/api/work-sessions/patterns?timeframe=${timeframe}`);
  }

  // Integration methods
  async syncCalendar() {
    return this.request('/api/integrations/sync/calendar', {
      method: 'POST',
    });
  }

  async syncEmails() {
    return this.request('/api/integrations/sync/emails', {
      method: 'POST',
    });
  }

  async getRecentMeetings(limit: number = 10) {
    return this.request(`/api/integrations/meetings/recent?limit=${limit}`);
  }

  async getRecentEmails(limit: number = 10) {
    return this.request(`/api/integrations/emails/recent?limit=${limit}`);
  }

  // Logout
  logout() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }
}

export const apiClient = new ApiClient();