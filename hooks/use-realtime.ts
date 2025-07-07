'use client';

import { useState, useEffect, useRef } from 'react';
import { dbHelpers } from '@/lib/db-helpers';
import { BurnoutScore, WorkPatternData, JournalEntry } from '@/lib/types';

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

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadInitialData = async () => {
    if (!userId) return;

    try {
      setData(prev => ({ ...prev, isConnected: true }));

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
          ai_insights: j.ai_insights || [],
          word_count: j.word_count,
          created_at: j.created_at,
          updated_at: j.updated_at
        }))
      }));

      setData(prev => ({ ...prev, lastUpdate: new Date() }));
    } catch (error) {
      console.error('Error loading initial data:', error);
      setData(prev => ({ ...prev, isConnected: false }));
      scheduleReconnect();
    }
  };

  const scheduleReconnect = () => {
    reconnectTimeoutRef.current = setTimeout(() => {
      loadInitialData();
    }, 5000); // Retry after 5 seconds
  };

  const startPolling = () => {
    // Poll for updates every 30 seconds
    intervalRef.current = setInterval(() => {
      loadInitialData();
    }, 30000);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (userId) {
      loadInitialData();
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [userId]);

  return {
    ...data,
    reconnect: loadInitialData,
    refresh: loadInitialData
  };
}