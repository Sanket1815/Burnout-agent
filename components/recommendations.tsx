'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Coffee, 
  Calendar, 
  Clock, 
  Mail, 
  BookOpen, 
  Activity, 
  Shield, 
  CheckCircle,
  Star,
  TrendingUp,
  Lightbulb
} from 'lucide-react';

export function Recommendations() {
  const recommendations = [
    {
      id: 1,
      title: 'Schedule Regular Breaks',
      description: 'Take a 15-minute break every 2 hours to prevent mental fatigue and maintain productivity.',
      priority: 'high',
      category: 'wellness',
      impact: 'High',
      effort: 'Low',
      icon: Coffee,
      actionable: true,
      timeframe: 'Immediate',
      details: [
        'Set calendar reminders for breaks',
        'Step away from your desk',
        'Practice deep breathing or stretching',
        'Avoid screens during break time'
      ]
    },
    {
      id: 2,
      title: 'Limit Meeting Blocks',
      description: 'Reduce back-to-back meetings to allow for processing time and mental recovery.',
      priority: 'high',
      category: 'productivity',
      impact: 'High',
      effort: 'Medium',
      icon: Calendar,
      actionable: true,
      timeframe: 'This week',
      details: [
        'Block 15 minutes between meetings',
        'Decline non-essential meetings',
        'Suggest shorter meeting durations',
        'Use asynchronous communication when possible'
      ]
    },
    {
      id: 3,
      title: 'Email Boundaries',
      description: 'Set specific times for checking email to reduce constant interruptions and stress.',
      priority: 'medium',
      category: 'focus',
      impact: 'Medium',
      effort: 'Low',
      icon: Mail,
      actionable: true,
      timeframe: 'Next week',
      details: [
        'Check email at designated times only',
        'Turn off email notifications',
        'Use email templates for common responses',
        'Set an email curfew after 6 PM'
      ]
    },
    {
      id: 4,
      title: 'Mindfulness Practice',
      description: 'Incorporate 10 minutes of daily mindfulness to reduce stress and improve focus.',
      priority: 'medium',
      category: 'wellness',
      impact: 'High',
      effort: 'Low',
      icon: Brain,
      actionable: true,
      timeframe: 'Start today',
      details: [
        'Use a meditation app for guidance',
        'Practice during lunch break',
        'Focus on breathing exercises',
        'Try progressive muscle relaxation'
      ]
    },
    {
      id: 5,
      title: 'Work Hour Boundaries',
      description: 'Establish clear start and end times for work to improve work-life balance.',
      priority: 'high',
      category: 'balance',
      impact: 'High',
      effort: 'Medium',
      icon: Clock,
      actionable: true,
      timeframe: 'This week',
      details: [
        'Set a firm end time for work',
        'Create a shutdown routine',
        'Communicate boundaries to colleagues',
        'Use separate devices for personal time'
      ]
    },
    {
      id: 6,
      title: 'Learn Stress Management',
      description: 'Develop coping strategies for high-stress situations and demanding periods.',
      priority: 'low',
      category: 'skills',
      impact: 'High',
      effort: 'High',
      icon: BookOpen,
      actionable: false,
      timeframe: 'Next month',
      details: [
        'Take an online stress management course',
        'Read books on resilience',
        'Practice stress-reduction techniques',
        'Consider professional coaching'
      ]
    }
  ];

  const wellnessScore = 72;
  const improvementPotential = 23;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'wellness': return 'bg-blue-100 text-blue-800';
      case 'productivity': return 'bg-green-100 text-green-800';
      case 'focus': return 'bg-purple-100 text-purple-800';
      case 'balance': return 'bg-orange-100 text-orange-800';
      case 'skills': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Wellness Overview */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white rounded-full shadow-sm">
                <Lightbulb className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">AI Wellness Insights</h2>
                <p className="text-gray-600">Personalized recommendations for your well-being</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{wellnessScore}%</div>
              <div className="text-sm text-gray-600">Current Wellness</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Wellness Score</span>
                <span>{wellnessScore}%</span>
              </div>
              <Progress value={wellnessScore} className="h-3 mb-2" />
              <p className="text-xs text-gray-600">Based on work patterns and journal sentiment</p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Improvement Potential</span>
                <span>+{improvementPotential}%</span>
              </div>
              <Progress value={improvementPotential} className="h-3 mb-2" />
              <p className="text-xs text-gray-600">Achievable with recommended actions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span>Recommended Actions</span>
          </CardTitle>
          <CardDescription>
            Prioritized suggestions to improve your work-life balance and prevent burnout
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {recommendations.map((rec) => {
              const Icon = rec.icon;
              return (
                <Card key={rec.id} className="border border-gray-200 hover:shadow-md transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-800 mb-2">
                            {rec.title}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {rec.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                              {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                            </Badge>
                            <Badge variant="secondary" className={getCategoryColor(rec.category)}>
                              {rec.category.charAt(0).toUpperCase() + rec.category.slice(1)}
                            </Badge>
                            <Badge variant="outline">
                              Impact: {rec.impact}
                            </Badge>
                            <Badge variant="outline">
                              Effort: {rec.effort}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm font-medium text-gray-800 mb-1">
                          {rec.timeframe}
                        </div>
                        {rec.actionable && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Take Action
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-4">
                      <h4 className="font-medium text-gray-800 mb-2">Action Steps:</h4>
                      <ul className="space-y-1">
                        {rec.details.map((detail, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Progress Tracking */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>Progress Tracking</span>
          </CardTitle>
          <CardDescription>
            Monitor your improvement over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">3</div>
              <div className="text-sm text-green-700">Actions Completed</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">7 days</div>
              <div className="text-sm text-blue-700">Average Implementation</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">+15%</div>
              <div className="text-sm text-purple-700">Wellness Improvement</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}