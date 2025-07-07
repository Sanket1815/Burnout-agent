// Real-time API service layer for backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth-token');
    
    // Get token from session storage if not in localStorage
    if (!token && typeof window !== 'undefined') {
      const session = localStorage.getItem('auth_session');
      if (session) {
        try {
          const parsedSession = JSON.parse(session);
          if (parsedSession.token) {
            localStorage.setItem('auth-token', parsedSession.token);
          }
        } catch (error) {
          console.error('Error parsing session:', error);
        }
      }
    }
    
    const config: RequestInit = {
    }
  }
}