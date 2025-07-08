import { authHelpers } from './auth';

export interface Session {
  user: any;
  token: string;
}

export const sessionHelpers = {
  // Set session in localStorage
  setSession(session: Session): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_session', JSON.stringify(session));
    }
  },

  // Get session from localStorage
  getSession(): Session | null {
    if (typeof window !== 'undefined') {
      const sessionStr = localStorage.getItem('auth_session');
      if (sessionStr) {
        try {
          return JSON.parse(sessionStr);
        } catch (error) {
          console.error('Error parsing session:', error);
          this.clearSession();
        }
      }
    }
    return null;
  },

  // Clear session
  clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_session');
    }
  },

  // Validate session token
  async validateSession(): Promise<Session | null> {
    const session = this.getSession();
    if (!session) return null;

    try {
      const { userId } = authHelpers.verifyToken(session.token);
      const user = await authHelpers.getUserById(userId);
      
      if (!user) {
        this.clearSession();
        return null;
      }

      return { user, token: session.token };
    } catch (error) {
      this.clearSession();
      return null;
    }
  }
};