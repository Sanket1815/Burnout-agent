import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { pool } from './database';
import { User, UserSettings, AuthResult } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN! || '7d';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export const authHelpers = {
  // Hash password
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  },

  // Compare password
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  // Generate JWT token
  generateToken(userId: string): string {
    const payload = { userId };
    const secret = JWT_SECRET;
    const options: jwt.SignOptions = { expiresIn: '7d' };
    
    return jwt.sign(payload, secret, options);
  },

  // Verify JWT token
  verifyToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & { userId: string };
      return { userId: decoded.userId };
    } catch (error) {
      throw new AuthError('Invalid token');
    }
  },

  // Sign up user
  async signUp(name: string, email: string, password: string): Promise<AuthResult> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new AuthError('User already exists');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);
      const userId = uuidv4();
      const defaultSettings: UserSettings = {
        work_hours: { start: '09:00', end: '17:00', timezone: 'UTC' },
        notifications: {
          daily_analysis: true,
          weekly_report: true,
          burnout_alert: true,
          recommendations: false
        },
        analysis: {
          frequency: 'daily' as const,
          include_weekends: false,
          sentiment_analysis: true,
          email_analysis: true
        }
      };

      // Insert user
      const result = await client.query(
        `INSERT INTO users (id, email, name, password_hash, settings, created_at) 
         VALUES ($1, $2, $3, $4, $5, NOW()) 
         RETURNING id, email, name, avatar_url, created_at, settings`,
        [userId, email, name, hashedPassword, JSON.stringify(defaultSettings)]
      );

      await client.query('COMMIT');

      const user = {
        ...result.rows[0],
        settings: defaultSettings
      };

      const token = this.generateToken(userId);

      return { user, token };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Sign in user
  async signIn(email: string, password: string): Promise<AuthResult> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, email, name, password_hash, avatar_url, created_at, settings FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        throw new AuthError('Invalid credentials');
      }

      const user = result.rows[0];
      const passwordMatch = await this.comparePassword(password, user.password_hash);

      if (!passwordMatch) {
        throw new AuthError('Invalid credentials');
      }

      const token = this.generateToken(user.id);

      // Update last login
      await client.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url,
          created_at: user.created_at,
          settings: user.settings
        },
        token
      };
    } finally {
      client.release();
    }
  },

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, email, name, avatar_url, created_at, settings FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  },

  // Update user profile
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const client = await pool.connect();
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (updates.name) {
        fields.push(`name = $${paramCount++}`);
        values.push(updates.name);
      }

      if (updates.avatar_url) {
        fields.push(`avatar_url = $${paramCount++}`);
        values.push(updates.avatar_url);
      }

      if (updates.settings) {
        fields.push(`settings = $${paramCount++}`);
        values.push(JSON.stringify(updates.settings));
      }

      values.push(userId);

      const result = await client.query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} 
         RETURNING id, email, name, avatar_url, created_at, settings`,
        values
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  },

  // Delete user
  async deleteUser(userId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM users WHERE id = $1', [userId]);
    } finally {
      client.release();
    }
  }
};