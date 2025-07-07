import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Admin client for server-side operations
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Database helper functions
export const dbHelpers = {
  // User operations
  async createUser(userData: {
    email: string;
    name: string;
    avatar_url?: string;
  }) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUser(id: string, updates: Partial<Database['public']['Tables']['users']['Update']>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Burnout scores
  async saveBurnoutScore(scoreData: Database['public']['Tables']['burnout_scores']['Insert']) {
    const { data, error } = await supabase
      .from('burnout_scores')
      .insert([scoreData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getBurnoutScores(userId: string, limit: number = 30) {
    const { data, error } = await supabase
      .from('burnout_scores')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async getLatestBurnoutScore(userId: string) {
    const { data, error } = await supabase
      .from('burnout_scores')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Work patterns
  async saveWorkPattern(patternData: Database['public']['Tables']['work_patterns']['Insert']) {
    const { data, error } = await supabase
      .from('work_patterns')
      .insert([patternData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getWorkPatterns(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('work_patterns')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Journal entries
  async saveJournalEntry(entryData: Database['public']['Tables']['journal_entries']['Insert']) {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([entryData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getJournalEntries(userId: string, limit: number = 10, offset: number = 0) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  },

  // Google integrations
  async saveGoogleIntegration(integrationData: Database['public']['Tables']['google_integrations']['Insert']) {
    const { data, error } = await supabase
      .from('google_integrations')
      .upsert([integrationData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getGoogleIntegrations(userId: string) {
    const { data, error } = await supabase
      .from('google_integrations')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  },

  // Recommendations
  async saveRecommendation(recData: Database['public']['Tables']['recommendations']['Insert']) {
    const { data, error } = await supabase
      .from('recommendations')
      .insert([recData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getRecommendations(userId: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async markRecommendationComplete(id: string) {
    const { data, error } = await supabase
      .from('recommendations')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};