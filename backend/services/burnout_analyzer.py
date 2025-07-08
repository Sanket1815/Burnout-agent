from datetime import datetime, timedelta
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
import statistics

from database.models import User, WorkSession, JournalEntry, Meeting, Email, BurnoutScore

class BurnoutAnalyzer:
    def __init__(self):
        self.work_hours_weight = 0.25
        self.sentiment_weight = 0.25
        self.meeting_load_weight = 0.25
        self.email_stress_weight = 0.25
    
    def calculate_burnout_score(self, db: Session, user_id: int, timeframe_days: int = 7) -> Dict:
        """Calculate comprehensive burnout score for a user"""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=timeframe_days)
        
        # Calculate individual metrics
        work_hours_score = self._calculate_work_hours_score(db, user_id, start_date, end_date)
        sentiment_score = self._calculate_sentiment_score(db, user_id, start_date, end_date)
        meeting_load_score = self._calculate_meeting_load_score(db, user_id, start_date, end_date)
        email_stress_score = self._calculate_email_stress_score(db, user_id, start_date, end_date)
        
        # Calculate weighted overall score
        overall_score = (
            work_hours_score * self.work_hours_weight +
            sentiment_score * self.sentiment_weight +
            meeting_load_score * self.meeting_load_weight +
            email_stress_score * self.email_stress_weight
        )
        
        # Determine burnout level
        burnout_level = self._classify_burnout_level(overall_score)
        
        # Save to database
        burnout_record = BurnoutScore(
            user_id=user_id,
            overall_score=overall_score,
            work_hours_score=work_hours_score,
            sentiment_score=sentiment_score,
            meeting_load_score=meeting_load_score,
            email_stress_score=email_stress_score,
            burnout_level=burnout_level
        )
        db.add(burnout_record)
        db.commit()
        
        return {
            "overall_score": overall_score,
            "work_hours_score": work_hours_score,
            "sentiment_score": sentiment_score,
            "meeting_load_score": meeting_load_score,
            "email_stress_score": email_stress_score,
            "burnout_level": burnout_level,
            "calculated_at": datetime.utcnow()
        }
    
    def _calculate_work_hours_score(self, db: Session, user_id: int, start_date: datetime, end_date: datetime) -> float:
        """Calculate work hours stress score (0-1)"""
        work_sessions = db.query(WorkSession).filter(
            WorkSession.user_id == user_id,
            WorkSession.start_time >= start_date,
            WorkSession.start_time <= end_date
        ).all()
        
        if not work_sessions:
            return 0.0
        
        # Calculate daily work hours
        daily_hours = {}
        for session in work_sessions:
            date = session.start_time.date()
            if date not in daily_hours:
                daily_hours[date] = 0
            daily_hours[date] += session.duration_minutes / 60
        
        # Calculate average daily hours
        avg_daily_hours = sum(daily_hours.values()) / len(daily_hours)
        
        # Score based on work hours (8 hours = 0.5, 12+ hours = 1.0)
        if avg_daily_hours <= 8:
            return avg_daily_hours / 16  # Linear scale up to 8 hours
        else:
            return 0.5 + min((avg_daily_hours - 8) / 8, 0.5)  # Accelerated scale after 8 hours
    
    def _calculate_sentiment_score(self, db: Session, user_id: int, start_date: datetime, end_date: datetime) -> float:
        """Calculate sentiment stress score (0-1)"""
        journal_entries = db.query(JournalEntry).filter(
            JournalEntry.user_id == user_id,
            JournalEntry.created_at >= start_date,
            JournalEntry.created_at <= end_date,
            JournalEntry.sentiment_score.isnot(None)
        ).all()
        
        if not journal_entries:
            return 0.0
        
        # Calculate average sentiment (assuming sentiment is -1 to 1)
        avg_sentiment = sum(entry.sentiment_score for entry in journal_entries) / len(journal_entries)
        
        # Convert to stress score (negative sentiment = higher stress)
        return max(0, -avg_sentiment)  # Convert negative sentiment to positive stress score
    
    def _calculate_meeting_load_score(self, db: Session, user_id: int, start_date: datetime, end_date: datetime) -> float:
        """Calculate meeting load stress score (0-1)"""
        meetings = db.query(Meeting).filter(
            Meeting.user_id == user_id,
            Meeting.start_time >= start_date,
            Meeting.start_time <= end_date
        ).all()
        
        if not meetings:
            return 0.0
        
        # Calculate meeting metrics
        total_meetings = len(meetings)
        total_duration = sum(meeting.duration_minutes for meeting in meetings)
        after_hours_meetings = sum(1 for meeting in meetings if meeting.is_after_hours)
        
        # Scoring factors
        meeting_frequency_score = min(total_meetings / 35, 1.0)  # 5 meetings per day = 1.0
        meeting_duration_score = min(total_duration / (7 * 480), 1.0)  # 8 hours of meetings per day = 1.0
        after_hours_score = min(after_hours_meetings / 7, 1.0)  # 1 after-hours meeting per day = 1.0
        
        # Weighted combination
        return (meeting_frequency_score * 0.4 + meeting_duration_score * 0.4 + after_hours_score * 0.2)
    
    def _calculate_email_stress_score(self, db: Session, user_id: int, start_date: datetime, end_date: datetime) -> float:
        """Calculate email stress score (0-1)"""
        emails = db.query(Email).filter(
            Email.user_id == user_id,
            Email.sent_at >= start_date,
            Email.sent_at <= end_date
        ).all()
        
        if not emails:
            return 0.0
        
        # Calculate email metrics
        total_emails = len(emails)
        after_hours_emails = sum(1 for email in emails if email.is_after_hours)
        
        # Sentiment analysis
        sentiment_emails = [email for email in emails if email.sentiment_score is not None]
        avg_email_sentiment = 0
        if sentiment_emails:
            avg_email_sentiment = sum(email.sentiment_score for email in sentiment_emails) / len(sentiment_emails)
        
        # Scoring factors
        email_volume_score = min(total_emails / 140, 1.0)  # 20 emails per day = 1.0
        after_hours_score = min(after_hours_emails / 14, 1.0)  # 2 after-hours emails per day = 1.0
        sentiment_stress_score = max(0, -avg_email_sentiment)  # Convert negative sentiment to stress
        
        # Weighted combination
        return (email_volume_score * 0.4 + after_hours_score * 0.3 + sentiment_stress_score * 0.3)
    
    def _classify_burnout_level(self, score: float) -> str:
        """Classify burnout level based on score"""
        if score <= 0.3:
            return "low"
        elif score <= 0.6:
            return "moderate"
        else:
            return "high"
    
    def get_burnout_trend(self, db: Session, user_id: int, days: int = 30) -> List[float]:
        """Get burnout trend over specified days"""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        scores = db.query(BurnoutScore).filter(
            BurnoutScore.user_id == user_id,
            BurnoutScore.calculated_at >= start_date,
            BurnoutScore.calculated_at <= end_date
        ).order_by(BurnoutScore.calculated_at).all()
        
        return [score.overall_score for score in scores]

burnout_analyzer = BurnoutAnalyzer()