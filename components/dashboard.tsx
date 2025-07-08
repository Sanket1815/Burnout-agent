'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BurnoutMetrics } from '@/components/burnout-metrics';
import { JournalEntry } from '@/components/journal-entry';
import { WorkPatterns } from '@/components/work-patterns';
import { Recommendations } from '@/components/recommendations';
import { Settings } from '@/components/settings';
import { useRealtime } from '@/hooks/use-realtime';
import { apiService } from '@/lib/api';
import { User } from '@/lib/types';
import { toast } from 'sonner';
import { 
  Brain, 
  Calendar, 
  Mail, 
  PenTool, 
  Settings as SettingsIcon, 
  LogOut,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Real-time data hook
  const {
    burnoutScore,
    workPatterns,
    recentJournals,
    isConnected,
    lastUpdate,
    reconnect
  } = useRealtime(user.id);

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await apiService.requestDataSync();
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-sync Google data periodically
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      try {
        await apiService.syncGoogleData();
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    }, 5 * 60 * 1000); // Sync every 5 minutes

    return () => clearInterval(syncInterval);
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'moderate': return <Clock className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Burnout Monitor</h1>
                <p className="text-sm text-gray-600">Welcome back, {user.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Wifi className="w-4 h-4" />
                    <span className="text-sm hidden md:inline">Live</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-red-600">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-sm hidden md:inline">Offline</span>
                  </div>
                )}
              </div>

              {/* Last Update */}
              {lastUpdate && (
                <div className="text-right hidden md:block">
                  <p className="text-sm text-gray-600">Last update</p>
                  <p className="text-sm font-medium">
                    {lastUpdate.toLocaleTimeString()}
                  </p>
                </div>
              )}

              {/* Refresh Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              {/* Logout Button */}
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Real-time Status Banner */}
        {!isConnected && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <WifiOff className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800 font-medium">
                  Real-time connection lost
                </span>
                <span className="text-yellow-700 text-sm">
                  Data may not be current
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={reconnect}
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                Reconnect
              </Button>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Burnout Risk</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-2xl font-bold">
                      {burnoutScore?.overall.toFixed(1) || '0.0'}/10
                    </span>
                    <Badge variant="outline" className={getRiskColor(burnoutScore?.risk_level || 'low')}>
                      {getRiskIcon(burnoutScore?.risk_level || 'low')}
                      <span className="ml-1 capitalize">{burnoutScore?.risk_level || 'low'}</span>
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {burnoutScore?.trend.direction === 'up' ? '+' : ''}
                    {burnoutScore?.trend.percentage || 0}%
                  </div>
                </div>
              </div>
              <Progress value={(burnoutScore?.overall || 0) * 10} className="mt-3" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Work Hours</p>
                  <p className="text-2xl font-bold">
                    {workPatterns[0]?.work_hours.toFixed(1) || '0.0'}h
                  </p>
                  <p className="text-sm text-yellow-600">Today</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Email Load</p>
                  <p className="text-2xl font-bold">
                    {workPatterns[0]?.email_count || 0}
                  </p>
                  <p className="text-sm text-green-600">Today</p>
                </div>
                <Mail className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Wellness Score</p>
                  <p className="text-2xl font-bold">
                    {burnoutScore ? (10 - burnoutScore.overall).toFixed(1) : '10.0'}
                  </p>
                  <p className="text-sm text-blue-600">
                    {burnoutScore?.trend.direction === 'down' ? 'Improving' : 'Stable'}
                  </p>
                </div>
                <Brain className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Patterns</span>
            </TabsTrigger>
            <TabsTrigger value="journal" className="flex items-center space-x-2">
              <PenTool className="w-4 h-4" />
              <span className="hidden sm:inline">Journal</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <SettingsIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <BurnoutMetrics data={burnoutScore} />
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            <WorkPatterns data={workPatterns} />
          </TabsContent>

          <TabsContent value="journal" className="space-y-6">
            <JournalEntry recentEntries={recentJournals} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Recommendations />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Settings user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}