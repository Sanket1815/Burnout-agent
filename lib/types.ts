// TypeScript type definitions for the application

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  settings: UserSettings;
}

export interface UserSettings {
  work_hours: {
    start: string;
    end: string;
    timezone: string;
  };
  notifications: {
    daily_analysis: boolean;
    weekly_report: boolean;
    burnout_alert: boolean;
    recommendations: boolean;
  };
  analysis: {
    frequency: 'hourly' | 'daily' | 'weekly';
    include_weekends: boolean;
    sentiment_analysis: boolean;
    email_analysis: boolean;
  };
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export interface BurnoutScore {
  overall: number;
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

export interface WorkPatternData {
  date: string;
  work_hours: number;
  meeting_count: number;
  meeting_duration: number;
  email_sent: number;
  email_received: number;
  break_count: number;
  break_duration: number;
  after_hours_activity: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  duration: number;
  attendees: number;
  meeting_type: 'one_on_one' | 'team' | 'client' | 'review' | 'training' | 'other';
  is_recurring: boolean;
}

export interface EmailActivity {
  date: string;
  sent_count: number;
  received_count: number;
  sent_after_hours: number;
  avg_response_time: number;
  stress_indicators: {
    urgent_emails: number;
    long_threads: number;
    weekend_activity: boolean;
  };
}

export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  sentiment_score: number;
  sentiment_label: 'positive' | 'neutral' | 'negative';
  ai_insights: string[];
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface SentimentAnalysis {
  score: number;
  label: 'positive' | 'neutral' | 'negative';
  confidence: number;
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
  };
  keywords: string[];
}

export interface Recommendation {
  id: string;
  user_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: 'wellness' | 'productivity' | 'focus' | 'balance' | 'skills';
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  actionable: boolean;
  timeframe: string;
  details: string[];
  completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface NotificationSettings {
  daily_analysis: boolean;
  weekly_report: boolean;
  burnout_alert: boolean;
  recommendations: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
}

export interface GoogleIntegration {
  service: 'calendar' | 'gmail';
  connected: boolean;
  last_sync: string;
  permissions: string[];
  error?: string;
}

export interface DashboardData {
  user: User;
  burnout_score: BurnoutScore;
  work_patterns: WorkPatternData[];
  recent_journals: JournalEntry[];
  recommendations: Recommendation[];
  integrations: GoogleIntegration[];
}

export interface TrendData {
  metric: string;
  timeframe: string;
  data_points: {
    date: string;
    value: number;
  }[];
  trend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
}

export interface WellnessInsight {
  type: 'success' | 'warning' | 'alert' | 'info';
  title: string;
  description: string;
  metric_value: string;
  icon: string;
  action?: {
    label: string;
    url: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    per_page?: number;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  activeTab: string;
  loading: {
    [key: string]: boolean;
  };
  errors: {
    [key: string]: string | null;
  };
}

// PostgreSQL specific types
export interface AuthResult {
  user: User;
  token: string;
}

export interface Session {
  user: User;
  token: string;
}

// Database connection types
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean | object;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

// Error handling types
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState {
  isValid: boolean;
  errors: ValidationError[];
  touched: { [key: string]: boolean };
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Navigation types
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  children?: NavigationItem[];
}

// Modal and dialog types
export interface ModalState {
  isOpen: boolean;
  type?: string;
  data?: any;
}

// Pagination types
export interface PaginationState {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

// Filter and search types
export interface FilterState {
  search: string;
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Chart and visualization types
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  color?: string;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  data: ChartDataPoint[];
  options?: {
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    showLegend?: boolean;
    colors?: string[];
  };
}