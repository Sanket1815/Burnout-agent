'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase, dbHelpers } from '@/lib/supabase';
import { BurnoutScore, WorkPatternData, JournalEntry } from '@/lib/types';
import { RealtimeChannel } from '@supabase/supabase-js';

interface RealtimeData {
  burnoutScore: BurnoutScore | null;
  workPatterns: WorkPatternData[];
  recentJournals: JournalEntry[];
  isConnected: boolean;
  lastUpdate: Date | null;
}

export function useRealtime(userId: string | null) {
  const [data, setData] = useState<RealtimeData>({
    burnoutScore: null,
    workPatterns: [],
    recentJournals: [],
    isConnected: false,
    lastUpdate: null
  });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadInitialData = async () => {
    if (!userId) return;

    try {
      // Load latest burnout score
      const latestScore = await dbHelpers.getLatestBurnoutScore(userId);
      if (latestScore) {
        setData(prev => ({
          ...prev,
          burnoutScore: {
            overall: latestScore.overall_score,
            risk_level: latestScore.risk_level as 'low' | 'moderate' | 'high',
            factors: {
              work_hours: latestScore.work_hours_score,
              email_stress: latestScore.email_stress_score,
              meeting_load: latestScore.meeting_load_score,
              break_frequency: latestScore.break_frequency_score,
              sentiment: latestScore.sentiment_score
            },
            trend: {
              direction: latestScore.trend_direction as 'up' | 'down' | 'stable',
              percentage: latestScore.trend_percentage
            },
            last_updated: latestScore.created_at
          }
        }));
      }

      // Load recent work patterns (last 7 days)
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const patterns = await dbHelpers.getWorkPatterns(userId, startDate, endDate);
      
      setData(prev => ({
        ...prev,
        workPatterns: patterns.map(p => ({
          date: p.date,
          work_hours: p.work_hours,
          meeting_count: p.meeting_count,
          meeting_duration: p.meeting_duration,
          email_sent: p.email_sent,
          email_received: p.email_received,
          break_count: p.break_count,
          break_duration: p.break_duration,
          after_hours_activity: p.after_hours_activity
        }))
      }));

      // Load recent journal entries
      const journals = await dbHelpers.getJournalEntries(userId, 5);
      setData(prev => ({
        ...prev,
        recentJournals: journals.map(j => ({
          id: j.id,
          user_id: j.user_id,
          content: j.content,
          sentiment_score: j.sentiment_score,
          sentiment_label: j.sentiment_label as 'positive' | 'neutral' | 'negative',
          ai_insights: j.ai_insights as string[] || [],
          word_count: j.word_count,
          created_at: j.created_at,
          updated_at: j.updated_at
        }))
      }));

      setData(prev => ({ ...prev, lastUpdate: new Date() }));
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const connect = () => {
    if (!userId) return;

    try {
      // Create a channel for real-time updates
      channelRef.current = supabase
        .channel(`user-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'burnout_scores',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log('Burnout score update:', payload);
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const newScore = payload.new as any;
              setData(prev => ({
                ...prev,
                burnoutScore: {
                  overall: newScore.overall_score,
                  risk_level: newScore.risk_level,
                  factors: {
                    work_hours: newScore.work_hours_score,
                    email_stress: newScore.email_stress_score,
                    meeting_load: newScore.meeting_load_score,
                    break_frequency: newScore.break_frequency_score,
                    sentiment: newScore.sentiment_score
                  },
                  trend: {
                    direction: newScore.trend_direction,
                    percentage: newScore.trend_percentage
                  },
                  last_updated: newScore.created_at
                },
                lastUpdate: new Date()
              }));
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'work_patterns',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log('Work pattern update:', payload);
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              loadInitialData(); // Reload work patterns
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'journal_entries',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log('Journal entry update:', payload);
            if (payload.eventType === 'INSERT') {
              const newEntry = payload.new as any;
              setData(prev => ({
                ...prev,
                recentJournals: [
                  {
                    id: newEntry.id,
                    user_id: newEntry.user_id,
                    content: newEntry.content,
                    sentiment_score: newEntry.sentiment_score,
                    sentiment_label: newEntry.sentiment_label,
                    ai_insights: newEntry.ai_insights || [],
                    word_count: newEntry.word_count,
                    created_at: newEntry.created_at,
                    updated_at: newEntry.updated_at
                  },
                  ...prev.recentJournals.slice(0, 4)
                ],
                lastUpdate: new Date()
              }));
            }
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
          setData(prev => ({ 
            ...prev, 
            isConnected: status === 'SUBSCRIBED' 
          }));
        });

      // Load initial data
      loadInitialData();
    } catch (error) {
      console.error('Failed to create realtime connection:', error);
      scheduleReconnect();
    }
  };

  const scheduleReconnect = () => {
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, 5000); // Retry after 5 seconds
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setData(prev => ({ ...prev, isConnected: false }));
  };

  useEffect(() => {
    if (userId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [userId]);

  return {
    ...data,
    reconnect: connect,
    refresh: loadInitialData
  };
}