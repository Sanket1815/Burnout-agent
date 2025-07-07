'use client';

import { useState, useEffect, useRef } from 'react';
import { BurnoutScore, WorkPatternData, JournalEntry } from '@/lib/types';
import { apiService } from '@/lib/api';

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

      // Load burnout metrics
      try {
        const metricsResponse = await apiService.getBurnoutMetrics();
        if (metricsResponse.success && metricsResponse.data) {
          const metrics = metricsResponse.data;
          setData(prev => ({
            ...prev,
            burnoutScore: {
              overall: metrics.score,
              risk_level: metrics.risk_level as 'low' | 'moderate' | 'high',
              factors: metrics.factors,
              trend: metrics.trend,
              last_updated: metrics.last_updated
            }
          }));
        }
      } catch (error) {
        console.error('Error loading burnout metrics:', error);
      }

      // Load journal entries
      try {
        const journalResponse = await apiService.getJournalEntries(5);
        if (journalResponse.success && journalResponse.data) {
          setData(prev => ({
            ...prev,
            recentJournals: journalResponse.data.entries.map((j: any) => ({
              id: j.id,
              user_id: userId,
              content: j.content,
              sentiment_score: j.sentiment_score,
              sentiment_label: j.sentiment_label as 'positive' | 'neutral' | 'negative',
              ai_insights: j.ai_insights || [],
              word_count: j.content.split(/\s+/).length,
              created_at: j.created_at,
              updated_at: j.created_at
            }))
          }));
        }
      } catch (error) {
        console.error('Error loading journal entries:', error);
      }

      // Generate mock work patterns for demo
      const mockPatterns: WorkPatternData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockPatterns.push({
          date: date.toISOString().split('T')[0],
          work_hours: 7 + Math.random() * 3,
          meeting_count: Math.floor(Math.random() * 8) + 2,
          meeting_duration: Math.random() * 4 + 1,
          email_sent: Math.floor(Math.random() * 20) + 5,
          email_received: Math.floor(Math.random() * 50) + 10,
          break_count: Math.floor(Math.random() * 5) + 1,
          break_duration: Math.random() * 60 + 15,
          after_hours_activity: Math.random() > 0.7
        });
      }

      setData(prev => ({
        ...prev,
        workPatterns: mockPatterns,
        lastUpdate: new Date()
      }));

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