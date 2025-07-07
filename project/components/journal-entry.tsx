'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, PenTool, Save, Smile, Meh, Frown, TrendingUp, Brain } from 'lucide-react';
import { format } from 'date-fns';
import { dbHelpers } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { JournalEntry as JournalEntryType } from '@/lib/types';

interface JournalEntryProps {
  recentEntries?: JournalEntryType[];
}

export function JournalEntry({ recentEntries = [] }: JournalEntryProps) {
  const [journalText, setJournalText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sentimentScore, setSentimentScore] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  const analyzeSentiment = async () => {
    if (!journalText.trim()) return;
    
    setIsAnalyzing(true);
    try {
      // Simple sentiment analysis - in production, use Google AI or other service
      const words = journalText.toLowerCase().split(/\s+/);
      const positiveWords = ['good', 'great', 'happy', 'excellent', 'wonderful', 'amazing', 'fantastic', 'love', 'enjoy', 'excited', 'productive', 'accomplished', 'satisfied', 'balanced', 'relaxed'];
      const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'stressed', 'overwhelmed', 'exhausted', 'frustrated', 'angry', 'sad', 'worried', 'anxious', 'burnout', 'tired', 'difficult'];
      
      let score = 0;
      words.forEach(word => {
        if (positiveWords.includes(word)) score += 0.1;
        if (negativeWords.includes(word)) score -= 0.1;
      });
      
      // Normalize to -1 to 1 range
      score = Math.max(-1, Math.min(1, score));
      setSentimentScore(score);
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      toast.error('Failed to analyze sentiment');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveEntry = async () => {
    if (!journalText.trim() || !user) return;
    
    setIsSaving(true);
    try {
      const wordCount = journalText.trim().split(/\s+/).length;
      const finalSentimentScore = sentimentScore || 0;
      
      let sentimentLabel: 'positive' | 'neutral' | 'negative' = 'neutral';
      if (finalSentimentScore > 0.3) sentimentLabel = 'positive';
      else if (finalSentimentScore < -0.3) sentimentLabel = 'negative';

      await dbHelpers.saveJournalEntry({
        user_id: user.id,
        content: journalText.trim(),
        sentiment_score: finalSentimentScore,
        sentiment_label: sentimentLabel,
        word_count: wordCount,
        ai_insights: []
      });

      toast.success('Journal entry saved successfully!');
      setJournalText('');
      setSentimentScore(null);
    } catch (error) {
      console.error('Save journal entry error:', error);
      toast.error('Failed to save journal entry');
    } finally {
      setIsSaving(false);
    }
  };

  const getSentimentIcon = (score: number) => {
    if (score > 0.3) return <Smile className="w-4 h-4 text-green-500" />;
    if (score < -0.3) return <Frown className="w-4 h-4 text-red-500" />;
    return <Meh className="w-4 h-4 text-yellow-500" />;
  };

  const getSentimentLabel = (score: number) => {
    if (score > 0.3) return 'Positive';
    if (score < -0.3) return 'Negative';
    return 'Neutral';
  };

  const getSentimentColor = (label: string) => {
    switch (label) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Today's Journal Entry */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PenTool className="w-5 h-5 text-blue-600" />
            <span>Today's Journal Entry</span>
          </CardTitle>
          <CardDescription>
            Share your thoughts and feelings. Our AI will analyze the sentiment to track your wellness.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Textarea
              placeholder="How are you feeling today? Describe your work experience, stress levels, or anything on your mind..."
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              className="min-h-32 text-base leading-relaxed"
            />
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {journalText.length} characters
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={analyzeSentiment}
                  disabled={!journalText.trim() || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Brain className="w-4 h-4" />
                      <span>Analyze Sentiment</span>
                    </div>
                  )}
                </Button>
                
                <Button
                  onClick={saveEntry}
                  disabled={!journalText.trim() || isSaving}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {isSaving ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>Save Entry</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Sentiment Analysis Result */}
          {sentimentScore !== null && (
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Brain className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">AI Sentiment Analysis</h3>
                      <p className="text-sm text-gray-600">Based on your journal entry</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getSentimentIcon(sentimentScore)}
                    <span className="font-medium">
                      {getSentimentLabel(sentimentScore)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sentiment Score</span>
                    <span className="font-medium">
                      {sentimentScore > 0 ? '+' : ''}{sentimentScore.toFixed(2)}
                    </span>
                  </div>
                  <Progress 
                    value={(sentimentScore + 1) * 50} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Negative</span>
                    <span>Neutral</span>
                    <span>Positive</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Previous Entries */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <span>Recent Entries</span>
          </CardTitle>
          <CardDescription>
            Your journal history and sentiment trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentEntries.length > 0 ? (
              recentEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-medium text-gray-800">
                        {format(new Date(entry.created_at), 'MMMM dd, yyyy')}
                      </span>
                      <Badge variant="outline" className={getSentimentColor(entry.sentiment_label)}>
                        {getSentimentIcon(entry.sentiment_score)}
                        <span className="ml-1 capitalize">{entry.sentiment_label}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {entry.content.substring(0, 150)}
                      {entry.content.length > 150 ? '...' : ''}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-semibold text-gray-800">
                      {entry.sentiment_score > 0 ? '+' : ''}{entry.sentiment_score.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500">Sentiment</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <PenTool className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No journal entries yet. Start writing to track your wellness!</p>
              </div>
            )}
          </div>

          {recentEntries.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Weekly Trend</span>
              </div>
              <p className="text-sm text-blue-700">
                {recentEntries.length > 1 ? 
                  `Your sentiment has ${recentEntries[0].sentiment_score > recentEntries[1].sentiment_score ? 'improved' : 'declined'} since your last entry.` :
                  'Keep journaling to track your sentiment trends!'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}