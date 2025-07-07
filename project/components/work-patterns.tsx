'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Clock, Mail, Coffee, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { WorkPatternData } from '@/lib/types';
import { format, parseISO } from 'date-fns';

interface WorkPatternsProps {
  data: WorkPatternData[];
}

export function WorkPatterns({ data }: WorkPatternsProps) {
  // Transform data for charts
  const weeklyHours = data.map(pattern => ({
    day: format(parseISO(pattern.date), 'EEE'),
    hours: pattern.work_hours,
    meetings: pattern.meeting_count,
    emails: pattern.email_sent + pattern.email_received
  }));

  const meetingDistribution = [
    { name: '1-on-1s', value: 25, color: '#3b82f6' },
    { name: 'Team Meetings', value: 35, color: '#10b981' },
    { name: 'Client Calls', value: 20, color: '#f59e0b' },
    { name: 'Reviews', value: 15, color: '#ef4444' },
    { name: 'Training', value: 5, color: '#8b5cf6' },
  ];

  const emailPatterns = data.map(pattern => ({
    date: format(parseISO(pattern.date), 'MMM dd'),
    sent: pattern.email_sent,
    received: pattern.email_received
  }));

  // Calculate insights
  const totalHours = data.reduce((sum, pattern) => sum + pattern.work_hours, 0);
  const avgHours = totalHours / Math.max(data.length, 1);
  const overtimeDays = data.filter(pattern => pattern.work_hours > 8).length;
  const afterHoursDays = data.filter(pattern => pattern.after_hours_activity).length;
  const avgMeetings = data.reduce((sum, pattern) => sum + pattern.meeting_count, 0) / Math.max(data.length, 1);

  const insights = [
    {
      title: avgHours > 8 ? 'Long Work Days' : 'Healthy Work Hours',
      description: avgHours > 8 ? 
        `You've averaged ${avgHours.toFixed(1)} hours per day this week` :
        `You're maintaining good work-life balance with ${avgHours.toFixed(1)} hours per day`,
      type: avgHours > 8 ? 'warning' : 'success',
      icon: Clock,
      value: `${avgHours.toFixed(1)} hrs avg`
    },
    {
      title: avgMeetings > 6 ? 'Meeting Overload' : 'Balanced Meeting Schedule',
      description: avgMeetings > 6 ?
        'Consider blocking focus time between meetings' :
        'Good balance of meetings and focus time',
      type: avgMeetings > 6 ? 'alert' : 'success',
      icon: AlertTriangle,
      value: `${avgMeetings.toFixed(1)} meetings/day`
    },
    {
      title: data.some(p => p.break_count > 3) ? 'Good Break Pattern' : 'Need More Breaks',
      description: data.some(p => p.break_count > 3) ?
        'You\'re taking regular breaks between work' :
        'Consider taking more breaks throughout the day',
      type: data.some(p => p.break_count > 3) ? 'success' : 'warning',
      icon: CheckCircle,
      value: `${Math.round(data.reduce((sum, p) => sum + p.break_count, 0) / Math.max(data.length, 1))} breaks/day`
    },
    {
      title: afterHoursDays > 0 ? 'After-Hours Activity' : 'Good Boundaries',
      description: afterHoursDays > 0 ?
        'Working after hours may indicate overload' :
        'You\'re maintaining good work-life boundaries',
      type: afterHoursDays > 0 ? 'warning' : 'success',
      icon: Mail,
      value: `${afterHoursDays} days`
    }
  ];

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'alert': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  if (data.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No work pattern data available yet.</p>
                <p className="text-sm text-gray-500 mt-2">Connect your Google Calendar to start tracking.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Work Hours Overview */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Weekly Work Hours</span>
          </CardTitle>
          <CardDescription>
            Your daily work hours based on calendar analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="hours" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Weekly Summary</span>
            </div>
            <p className="text-sm text-blue-700">
              Total: {totalHours.toFixed(1)} hours • Average: {avgHours.toFixed(1)} hours/day • Overtime: {overtimeDays} days
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Distribution and Email Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Meeting Types</CardTitle>
            <CardDescription>
              Distribution of your meeting categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={meetingDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {meetingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {meetingDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Email Activity</CardTitle>
            <CardDescription>
              Daily email sending and receiving patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emailPatterns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#666"
                    fontSize={12}
                  />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="sent" 
                    fill="#10b981"
                    radius={[2, 2, 0, 0]}
                    name="Sent"
                  />
                  <Bar 
                    dataKey="received" 
                    fill="#3b82f6"
                    radius={[2, 2, 0, 0]}
                    name="Received"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Work Pattern Insights</CardTitle>
          <CardDescription>
            AI-generated insights based on your work patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-white/50">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{insight.title}</h3>
                      <p className="text-sm opacity-90 mb-2">{insight.description}</p>
                      <Badge variant="outline" className="text-xs">
                        {insight.value}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Weekly Goals</CardTitle>
          <CardDescription>
            Track your progress towards healthier work patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Work-Life Balance</span>
                <span className="font-medium">{Math.round(Math.max(0, (8 - avgHours) / 8 * 100))}%</span>
              </div>
              <Progress value={Math.max(0, (8 - avgHours) / 8 * 100)} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                Goal: Maintain 8-hour workdays
              </p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Meeting Efficiency</span>
                <span className="font-medium">{Math.round(Math.max(0, (6 - avgMeetings) / 6 * 100))}%</span>
              </div>
              <Progress value={Math.max(0, (6 - avgMeetings) / 6 * 100)} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                Goal: Limit to 6 meetings per day
              </p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Break Frequency</span>
                <span className="font-medium">
                  {Math.round(Math.min(100, (data.reduce((sum, p) => sum + p.break_count, 0) / Math.max(data.length, 1)) / 3 * 100))}%
                </span>
              </div>
              <Progress 
                value={Math.min(100, (data.reduce((sum, p) => sum + p.break_count, 0) / Math.max(data.length, 1)) / 3 * 100)} 
                className="h-2" 
              />
              <p className="text-xs text-gray-500 mt-1">
                Goal: 3+ breaks per day
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}