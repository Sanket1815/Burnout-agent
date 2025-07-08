'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { Clock, TrendingUp, Calendar, Zap } from 'lucide-react';

interface WorkPattern {
  total_hours: number;
  avg_daily_hours: number;
  most_productive_hours: Array<{ hour: number; minutes: number }>;
  hourly_distribution: Record<string, number>;
  session_count: number;
}

export default function WorkPatterns() {
  const [patterns, setPatterns] = useState<WorkPattern | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchPatterns();
  }, []);

  const fetchPatterns = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getWorkPatterns();
      setPatterns(data);
    } catch (error) {
      console.error('Error fetching work patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await apiClient.syncCalendar();
      await apiClient.syncEmails();
      await fetchPatterns();
    } catch (error) {
      console.error('Error syncing data:', error);
    } finally {
      setSyncing(false);
    }
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!patterns) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Work Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No work pattern data available</p>
            <Button onClick={handleSync} disabled={syncing} className="bg-blue-600 hover:bg-blue-700">
              {syncing ? 'Syncing...' : 'Sync Data'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Work Patterns</h2>
        <Button onClick={handleSync} disabled={syncing} size="sm">
          {syncing ? 'Syncing...' : 'Sync Data'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Clock className="w-4 h-4 text-blue-500" />
              Total Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {patterns.total_hours.toFixed(1)}h
            </div>
            <div className="text-sm text-gray-600">This Week</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4 text-green-500" />
              Daily Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {patterns.avg_daily_hours.toFixed(1)}h
            </div>
            <div className="text-sm text-gray-600">Per Day</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Zap className="w-4 h-4 text-orange-500" />
              Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {patterns.session_count}
            </div>
            <div className="text-sm text-gray-600">Work Sessions</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              Peak Hour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {patterns.most_productive_hours[0] ? formatHour(patterns.most_productive_hours[0].hour) : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Most Productive</div>
          </CardContent>
        </Card>
      </div>

      {/* Most Productive Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Most Productive Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {patterns.most_productive_hours.slice(0, 3).map((hour, index) => (
              <div key={hour.hour} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-gold-100 text-gold-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{formatHour(hour.hour)}</div>
                    <div className="text-sm text-gray-600">{(hour.minutes / 60).toFixed(1)} hours</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(hour.minutes / Math.max(...patterns.most_productive_hours.map(h => h.minutes))) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}