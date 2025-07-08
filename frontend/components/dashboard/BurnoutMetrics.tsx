'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { wsClient } from '@/lib/websocket';
import { AlertTriangle, TrendingUp, Clock, Mail, Calendar } from 'lucide-react';

interface BurnoutMetrics {
  current_score: number;
  burnout_level: 'low' | 'moderate' | 'high';
  weekly_trend: number[];
  work_hours_avg: number;
  meeting_load: number;
  email_stress: number;
  journal_sentiment: number;
}

export default function BurnoutMetrics() {
  const [metrics, setMetrics] = useState<BurnoutMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    
    // Set up WebSocket listener for real-time updates
    const handleBurnoutUpdate = (event: CustomEvent) => {
      setMetrics(prev => prev ? { ...prev, ...event.detail } : null);
    };

    window.addEventListener('burnout_update', handleBurnoutUpdate);
    
    return () => {
      window.removeEventListener('burnout_update', handleBurnoutUpdate);
    };
  }, []);

  const fetchMetrics = async () => {
    try {
      const data = await apiClient.getBurnoutMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching burnout metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return <div className="text-center py-8">No metrics available</div>;
  }

  const getBurnoutColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getBurnoutBadgeColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Burnout Score */}
      <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            Overall Burnout Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl font-bold text-gray-900">
              {(metrics.current_score * 100).toFixed(1)}%
            </div>
            <Badge className={getBurnoutBadgeColor(metrics.burnout_level)}>
              {metrics.burnout_level.toUpperCase()}
            </Badge>
          </div>
          <Progress
            value={metrics.current_score * 100}
            className="h-3"
            indicatorClassName={getBurnoutColor(metrics.burnout_level)}
          />
          <p className="text-sm text-gray-600 mt-2">
            {metrics.burnout_level === 'low' && 'You\'re managing stress well. Keep it up!'}
            {metrics.burnout_level === 'moderate' && 'Consider taking some time to recharge.'}
            {metrics.burnout_level === 'high' && 'High stress detected. Please prioritize self-care.'}
          </p>
        </CardContent>
      </Card>

      {/* Individual Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Clock className="w-4 h-4 text-orange-500" />
              Work Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metrics.work_hours_avg.toFixed(1)}h
            </div>
            <div className="text-sm text-gray-600">Daily Average</div>
            <Progress
              value={(metrics.work_hours_avg / 12) * 100}
              className="mt-2 h-2"
              indicatorClassName="bg-orange-500"
            />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4 text-purple-500" />
              Meeting Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metrics.meeting_load}
            </div>
            <div className="text-sm text-gray-600">This Week</div>
            <Progress
              value={(metrics.meeting_load / 35) * 100}
              className="mt-2 h-2"
              indicatorClassName="bg-purple-500"
            />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Mail className="w-4 h-4 text-red-500" />
              Email Stress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {(metrics.email_stress * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Stress Level</div>
            <Progress
              value={metrics.email_stress * 100}
              className="mt-2 h-2"
              indicatorClassName="bg-red-500"
            />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Journal Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metrics.journal_sentiment >= 0 ? '+' : ''}{(metrics.journal_sentiment * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Mood Score</div>
            <Progress
              value={Math.abs(metrics.journal_sentiment) * 100}
              className="mt-2 h-2"
              indicatorClassName={metrics.journal_sentiment >= 0 ? "bg-green-500" : "bg-red-500"}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}