'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { BookOpen, Send, Clock } from 'lucide-react';

interface JournalEntry {
  id: number;
  content: string;
  sentiment_score: number;
  emotion_analysis: any;
  created_at: string;
}

export default function JournalEntry() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getRecentJournalEntries(5);
      setEntries(data);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.trim()) return;

    setSubmitting(true);
    try {
      const entry = await apiClient.createJournalEntry(newEntry);
      setEntries([entry, ...entries.slice(0, 4)]);
      setNewEntry('');
    } catch (error) {
      console.error('Error creating journal entry:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.2) return 'bg-green-100 text-green-800';
    if (score < -0.2) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getSentimentLabel = (score: number) => {
    if (score > 0.2) return 'Positive';
    if (score < -0.2) return 'Negative';
    return 'Neutral';
  };

  return (
    <div className="space-y-6">
      {/* New Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Journal Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              placeholder="How are you feeling today? Write about your work, stress levels, or anything on your mind..."
              className="min-h-[120px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submitting || !newEntry.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {submitting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Save Entry
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No journal entries yet. Start writing to track your mood and stress levels.
            </div>
          ) : (
            <div className="space-y-6">
              {entries.map((entry) => (
                <div key={entry.id} className="border-l-4 border-blue-200 pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-500">
                      {new Date(entry.created_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    {entry.sentiment_score !== null && (
                      <Badge className={getSentimentColor(entry.sentiment_score)}>
                        {getSentimentLabel(entry.sentiment_score)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{entry.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}