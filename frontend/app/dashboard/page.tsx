'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BurnoutMetrics from '@/components/dashboard/BurnoutMetrics';
import JournalEntry from '@/components/dashboard/JournalEntry';
import WorkPatterns from '@/components/dashboard/WorkPatterns';
import { apiClient } from '@/lib/api';
import { wsClient } from '@/lib/websocket';
import { BarChart3, BookOpen, Clock, LogOut, User, Zap } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const userData = await apiClient.getCurrentUser();
        setUser(userData);
        
        // Connect to WebSocket
        wsClient.connect(userData.id.toString());
      } catch (error) {
        console.error('Error initializing dashboard:', error);
        router.push('/auth/signin');
      } finally {
        setLoading(false);
      }
    };

    initDashboard();

    return () => {
      wsClient.disconnect();
    };
  }, [router]);

  const handleLogout = () => {
    apiClient.logout();
    wsClient.disconnect();
    router.push('/auth/signin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Burnout Detection Agent</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.full_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                {user?.email}
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="journal" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Journal
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Work Patterns
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Burnout Analysis</h2>
                <Button
                  onClick={() => apiClient.calculateBurnout()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Refresh Analysis
                </Button>
              </div>
              <BurnoutMetrics />
            </div>
          </TabsContent>

          <TabsContent value="journal">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Journal & Mood Tracking</h2>
              <JournalEntry />
            </div>
          </TabsContent>

          <TabsContent value="patterns">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Work Patterns Analysis</h2>
              <WorkPatterns />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}