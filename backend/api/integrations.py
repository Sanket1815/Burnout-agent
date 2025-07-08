from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json

from database.database import get_db
from database.models import Meeting, Email
from services.vertex_ai_service import vertex_ai_service
from api.auth import get_current_user_id

router = APIRouter()

@router.post("/sync/calendar")
async def sync_calendar(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Sync calendar data from Google Calendar API"""
    
    # Mock calendar sync - in production, this would connect to Google Calendar API
    mock_meetings = [
        {
            "title": "Team Standup",
            "start_time": "2024-01-15T09:00:00Z",
            "end_time": "2024-01-15T09:30:00Z",
            "attendees_count": 5,
            "is_after_hours": False
        },
        {
            "title": "Project Review",
            "start_time": "2024-01-15T14:00:00Z",
            "end_time": "2024-01-15T15:00:00Z",
            "attendees_count": 3,
            "is_after_hours": False
        },
        {
            "title": "Client Call",
            "start_time": "2024-01-15T19:00:00Z",
            "end_time": "2024-01-15T20:00:00Z",
            "attendees_count": 2,
            "is_after_hours": True
        }
    ]
    
    # Save meetings to database
    for meeting_data in mock_meetings:
        from datetime import datetime
        
        start_time = datetime.fromisoformat(meeting_data["start_time"].replace('Z', '+00:00'))
        end_time = datetime.fromisoformat(meeting_data["end_time"].replace('Z', '+00:00'))
        duration = int((end_time - start_time).total_seconds() / 60)
        
        meeting = Meeting(
            user_id=user_id,
            title=meeting_data["title"],
            start_time=start_time,
            end_time=end_time,
            duration_minutes=duration,
            attendees_count=meeting_data["attendees_count"],
            is_after_hours=meeting_data["is_after_hours"]
        )
        
        db.add(meeting)
    
    db.commit()
    
    return {"message": f"Successfully synced {len(mock_meetings)} meetings"}

@router.post("/sync/emails")
async def sync_emails(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Sync email data from Gmail API"""
    
    # Mock email sync - in production, this would connect to Gmail API
    mock_emails = [
        {
            "subject": "Urgent: Project deadline moved up",
            "body": "Hi team, we need to move the project deadline up by 2 days. Please prioritize this work.",
            "sent_at": "2024-01-15T08:30:00Z",
            "is_sent": False,
            "is_after_hours": False
        },
        {
            "subject": "Re: Client feedback",
            "body": "Thanks for the feedback. I'll work on the changes tonight and send an updated version.",
            "sent_at": "2024-01-15T21:15:00Z",
            "is_sent": True,
            "is_after_hours": True
        }
    ]
    
    # Save emails to database with sentiment analysis
    for email_data in mock_emails:
        from datetime import datetime
        
        sent_at = datetime.fromisoformat(email_data["sent_at"].replace('Z', '+00:00'))
        
        # Analyze sentiment and stress indicators
        sentiment_analysis = vertex_ai_service.analyze_sentiment(email_data["body"])
        stress_analysis = vertex_ai_service.analyze_stress_indicators(email_data["body"])
        
        email = Email(
            user_id=user_id,
            subject=email_data["subject"],
            body=email_data["body"],
            sent_at=sent_at,
            is_sent=email_data["is_sent"],
            is_after_hours=email_data["is_after_hours"],
            sentiment_score=sentiment_analysis["sentiment_score"],
            stress_indicators=stress_analysis
        )
        
        db.add(email)
    
    db.commit()
    
    return {"message": f"Successfully synced {len(mock_emails)} emails"}

@router.get("/meetings/recent")
async def get_recent_meetings(
    limit: int = 10,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get recent meetings for the current user"""
    
    meetings = db.query(Meeting).filter(
        Meeting.user_id == user_id
    ).order_by(Meeting.start_time.desc()).limit(limit).all()
    
    return [
        {
            "id": meeting.id,
            "title": meeting.title,
            "start_time": meeting.start_time,
            "end_time": meeting.end_time,
            "duration_minutes": meeting.duration_minutes,
            "attendees_count": meeting.attendees_count,
            "is_after_hours": meeting.is_after_hours
        }
        for meeting in meetings
    ]

@router.get("/emails/recent")
async def get_recent_emails(
    limit: int = 10,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get recent emails for the current user"""
    
    emails = db.query(Email).filter(
        Email.user_id == user_id
    ).order_by(Email.sent_at.desc()).limit(limit).all()
    
    return [
        {
            "id": email.id,
            "subject": email.subject,
            "sent_at": email.sent_at,
            "is_sent": email.is_sent,
            "is_after_hours": email.is_after_hours,
            "sentiment_score": email.sentiment_score,
            "stress_indicators": email.stress_indicators
        }
        for email in emails
    ]

integrations_router = router