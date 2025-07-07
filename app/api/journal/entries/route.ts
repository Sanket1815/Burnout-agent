import { NextRequest, NextResponse } from 'next/server';
import { authHelpers } from '@/lib/auth';
import { dbHelpers } from '@/lib/db-helpers';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { userId } = authHelpers.verifyToken(token);

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const entries = await dbHelpers.getJournalEntries(userId, limit);
    
    return NextResponse.json({
      success: true,
      data: {
        entries: entries.map(entry => ({
          id: entry.id,
          content: entry.content,
          sentiment_score: entry.sentiment_score,
          sentiment_label: entry.sentiment_label,
          created_at: entry.created_at,
          ai_insights: entry.ai_insights || []
        })),
        total: entries.length
      }
    });
  } catch (error: any) {
    console.error('Journal entries error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch journal entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { userId } = authHelpers.verifyToken(token);

    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Simple sentiment analysis
    const words = content.toLowerCase().split(/\s+/);
    const positiveWords = ['good', 'great', 'happy', 'excellent', 'wonderful', 'amazing', 'fantastic', 'love', 'enjoy', 'excited'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'stressed', 'overwhelmed', 'exhausted', 'frustrated', 'angry', 'sad'];
    
    let score = 0;
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 0.1;
      if (negativeWords.includes(word)) score -= 0.1;
    });
    
    score = Math.max(-1, Math.min(1, score));
    
    let sentimentLabel: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (score > 0.3) sentimentLabel = 'positive';
    else if (score < -0.3) sentimentLabel = 'negative';

    const entry = await dbHelpers.saveJournalEntry({
      user_id: userId,
      content: content.trim(),
      sentiment_score: score,
      sentiment_label: sentimentLabel,
      word_count: words.length,
      ai_insights: []
    });

    return NextResponse.json({
      success: true,
      data: {
        id: entry.id,
        content: entry.content,
        sentiment_score: entry.sentiment_score,
        sentiment_label: entry.sentiment_label,
        created_at: entry.created_at
      }
    });
  } catch (error: any) {
    console.error('Create journal entry error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create journal entry' },
      { status: 500 }
    );
  }
}