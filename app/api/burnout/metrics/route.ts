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

    const burnoutScore = await dbHelpers.getLatestBurnoutScore(userId);
    
    if (!burnoutScore) {
      // Generate mock data for demo
      const mockScore = {
        overall_score: Math.random() * 10,
        risk_level: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)],
        work_hours_score: Math.random() * 10,
        email_stress_score: Math.random() * 10,
        meeting_load_score: Math.random() * 10,
        break_frequency_score: Math.random() * 10,
        sentiment_score: Math.random() * 10,
        trend_direction: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)],
        trend_percentage: Math.random() * 20,
        created_at: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        data: {
          score: mockScore.overall_score,
          risk_level: mockScore.risk_level,
          factors: {
            work_hours: mockScore.work_hours_score,
            email_stress: mockScore.email_stress_score,
            meeting_load: mockScore.meeting_load_score,
            break_frequency: mockScore.break_frequency_score,
            sentiment: mockScore.sentiment_score
          },
          trend: {
            direction: mockScore.trend_direction,
            percentage: mockScore.trend_percentage
          },
          last_updated: mockScore.created_at
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        score: burnoutScore.overall_score,
        risk_level: burnoutScore.risk_level,
        factors: {
          work_hours: burnoutScore.work_hours_score,
          email_stress: burnoutScore.email_stress_score,
          meeting_load: burnoutScore.meeting_load_score,
          break_frequency: burnoutScore.break_frequency_score,
          sentiment: burnoutScore.sentiment_score
        },
        trend: {
          direction: burnoutScore.trend_direction,
          percentage: burnoutScore.trend_percentage
        },
        last_updated: burnoutScore.created_at
      }
    });
  } catch (error: any) {
    console.error('Burnout metrics error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch burnout metrics' },
      { status: 500 }
    );
  }
}