'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Brain } from 'lucide-react';
import { BurnoutScore } from '@/lib/types';
import useSWR from 'swr';
import { apiService } from '@/lib/api';

interface BurnoutMetricsProps {
  data: BurnoutScore | null;
}

export function BurnoutMetrics({ data }: BurnoutMetricsProps) {
  // Fetch historical data for trends
  const { data: trendData } = useSWR(
    '/api/burnout/trends',
    () => apiService.getBurnoutMetrics('30d'),
    { refreshInterval: 60000 } // Refresh every minute
  );

  // Mock weekly data - replace with real API data
  const weeklyData = [
    { day: 'Mon', burnout: data?.factors.work_hours || 4.2, sentiment: 0.6, workHours: 8.5 },
    { day: 'Tue', burnout: data?.factors.email_stress || 5.1, sentiment: 0.3, workHours: 9.2 },
    { day: 'Wed', burnout: data?.factors.meeting_load || 6.8, sentiment: -0.2, workHours: 10.1 },
    { day: 'Thu', burnout: data?.overall || 7.2, sentiment: -0.5, workHours: 9.8 },
    { day: 'Fri', burnout: 6.2, sentiment: 0.1, workHours: 8.7 },
    { day: 'Sat', burnout: 3.1, sentiment: 0.8, workHours: 0 },
    { day: 'Sun', burnout: 2.8, sentiment: 0.9, workHours: 0 },
  ];

  const categories = [
    { 
      name: 'Work Hours', 
      score: data?.factors.work_hours || 0, 
      status: (data?.factors.work_hours || 0) > 7 ? 'warning' : 'good',
      description: 'Daily work hour patterns',
      icon: Clock,
      trend: data?.trend.direction === 'up' ? `+${data.trend.percentage}%` : `-${data?.trend.percentage || 0}%`
    },
    { 
      name: 'Email Stress', 
      score: data?.factors.email_stress || 0, 
      status: (data?.factors.email_stress || 0) > 6 ? 'warning' : 'moderate',
      description: 'Email activity patterns',
      icon: AlertTriangle,
      trend: '+5%'
    },
    { 
      name: 'Meeting Load', 
      score: data?.factors.meeting_load || 0, 
      status: (data?.factors.meeting_load || 0) > 6 ? 'warning' : 'good',
      description: 'Meeting density and frequency',
      icon: Brain,
      trend: '+18%'
    },
    { 
      name: 'Break Time', 
      score: data?.factors.break_frequency || 0, 
      status: (data?.factors.break_frequency || 0) < 5 ? 'good' : 'warning',
      description: 'Break frequency and duration',
      icon: CheckCircle,
      trend: '-8%'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'warning': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!data) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Loading burnout metrics...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Burnout Trend */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Real-time Burnout Risk Trend</span>
          </CardTitle>
          <CardDescription>
            Your burnout risk levels updated in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-800">Current Risk Level</h3>
                <p className="text-blue-700 capitalize">{data.risk_level}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-800">
                  {data.overall.toFixed(1)}/10
                </div>
                <div className="text-sm text-blue-600">
                  Last updated: {new Date(data.last_updated).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#666" />
                <YAxis domain={[0, 10]} stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="burnout" 
                  stroke="#3b82f6" 
                  fill="url(#burnoutGradient)"
                  strokeWidth={3}
                />
                <defs>
                  <linearGradient id="burnoutGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category, index) => {
          const Icon = category.icon;
          const isIncreasing = category.trend.startsWith('+');
          
          return (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      category.status === 'good' ? 'bg-green-100' :
                      category.status === 'moderate' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        category.status === 'good' ? 'text-green-600' :
                        category.status === 'moderate' ? 'text-yellow-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800 mb-1">
                      {category.score.toFixed(1)}/10
                    </div>
                    <div className={`flex items-center text-sm ${
                      isIncreasing ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {isIncreasing ? 
                        <TrendingUp className="w-3 h-3 mr-1" /> : 
                        <TrendingDown className="w-3 h-3 mr-1" />
                      }
                      {category.trend}
                    </div>
                  </div>
                </div>
                <Progress 
                  value={category.score * 10} 
                  className="mb-3"
                />
                <Badge variant="outline" className={getStatusColor(category.status)}>
                  {category.status === 'good' ? 'Healthy' :
                   category.status === 'moderate' ? 'Monitor' : 'Needs Attention'}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}