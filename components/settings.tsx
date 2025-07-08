'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  Calendar, 
  Mail, 
  Bell, 
  Shield, 
  Clock, 
  Brain,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export function Settings() {
  const [notifications, setNotifications] = useState({
    dailyAnalysis: true,
    weeklyReport: true,
    burnoutAlert: true,
    recommendations: false
  });

  const [workHours, setWorkHours] = useState({
    start: '09:00',
    end: '17:00',
    timezone: 'UTC-8'
  });

  const [analysis, setAnalysis] = useState({
    frequency: 'daily',
    includeWeekends: false,
    sentimentAnalysis: true,
    emailAnalysis: true
  });

  const [isConnected, setIsConnected] = useState({
    calendar: true,
    gmail: true
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
  };

  const handleReconnect = async (service: string) => {
    // Simulate OAuth reconnection
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsConnected(prev => ({ ...prev, [service]: true }));
  };

  return (
    <div className="space-y-6">
      {/* Account Connections */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>Account Connections</span>
          </CardTitle>
          <CardDescription>
            Manage your Google account integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-medium">Google Calendar</div>
                <div className="text-sm text-gray-600">Access to work schedule and meetings</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant={isConnected.calendar ? "default" : "destructive"}>
                {isConnected.calendar ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Disconnected
                  </>
                )}
              </Badge>
              {!isConnected.calendar && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleReconnect('calendar')}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reconnect
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-red-500" />
              <div>
                <div className="font-medium">Gmail</div>
                <div className="text-sm text-gray-600">Email activity patterns (metadata only)</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant={isConnected.gmail ? "default" : "destructive"}>
                {isConnected.gmail ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Disconnected
                  </>
                )}
              </Badge>
              {!isConnected.gmail && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleReconnect('gmail')}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reconnect
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Hours Configuration */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-green-600" />
            <span>Work Hours</span>
          </CardTitle>
          <CardDescription>
            Set your typical work schedule for accurate analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={workHours.start}
                onChange={(e) => setWorkHours(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={workHours.end}
                onChange={(e) => setWorkHours(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={workHours.timezone} onValueChange={(value) => setWorkHours(prev => ({ ...prev, timezone: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                  <SelectItem value="UTC-7">Mountain Time (UTC-7)</SelectItem>
                  <SelectItem value="UTC-6">Central Time (UTC-6)</SelectItem>
                  <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                  <SelectItem value="UTC+0">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Settings */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>Analysis Settings</span>
          </CardTitle>
          <CardDescription>
            Configure how your data is analyzed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Analysis Frequency</Label>
                <div className="text-sm text-gray-600">
                  How often to analyze your work patterns
                </div>
              </div>
              <Select value={analysis.frequency} onValueChange={(value) => setAnalysis(prev => ({ ...prev, frequency: value }))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekends">Include Weekends</Label>
                <div className="text-sm text-gray-600">
                  Analyze weekend work activity
                </div>
              </div>
              <Switch
                id="weekends"
                checked={analysis.includeWeekends}
                onCheckedChange={(checked) => setAnalysis(prev => ({ ...prev, includeWeekends: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sentiment">Sentiment Analysis</Label>
                <div className="text-sm text-gray-600">
                  Analyze journal entries for emotional patterns
                </div>
              </div>
              <Switch
                id="sentiment"
                checked={analysis.sentimentAnalysis}
                onCheckedChange={(checked) => setAnalysis(prev => ({ ...prev, sentimentAnalysis: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email">Email Analysis</Label>
                <div className="text-sm text-gray-600">
                  Analyze email patterns for stress indicators
                </div>
              </div>
              <Switch
                id="email"
                checked={analysis.emailAnalysis}
                onCheckedChange={(checked) => setAnalysis(prev => ({ ...prev, emailAnalysis: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-yellow-600" />
            <span>Notifications</span>
          </CardTitle>
          <CardDescription>
            Choose when and how you want to be notified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="daily-analysis">Daily Analysis</Label>
              <div className="text-sm text-gray-600">
                Receive daily burnout risk updates
              </div>
            </div>
            <Switch
              id="daily-analysis"
              checked={notifications.dailyAnalysis}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, dailyAnalysis: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekly-report">Weekly Report</Label>
              <div className="text-sm text-gray-600">
                Get comprehensive weekly wellness reports
              </div>
            </div>
            <Switch
              id="weekly-report"
              checked={notifications.weeklyReport}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReport: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="burnout-alert">Burnout Alerts</Label>
              <div className="text-sm text-gray-600">
                Get notified when burnout risk is high
              </div>
            </div>
            <Switch
              id="burnout-alert"
              checked={notifications.burnoutAlert}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, burnoutAlert: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="recommendations">Wellness Recommendations</Label>
              <div className="text-sm text-gray-600">
                Receive personalized wellness suggestions
              </div>
            </div>
            <Switch
              id="recommendations"
              checked={notifications.recommendations}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, recommendations: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 px-8"
        >
          {isSaving ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <SettingsIcon className="w-4 h-4" />
              <span>Save Settings</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}