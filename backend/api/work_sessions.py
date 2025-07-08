from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from database.database import get_db
from database.models import WorkSession
from models.schemas import WorkSessionCreate, WorkSessionResponse
from api.auth import get_current_user_id

router = APIRouter()

@router.post("/", response_model=WorkSessionResponse)
async def create_work_session(
    session_data: WorkSessionCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create a new work session"""
    
    # Calculate duration
    duration = (session_data.end_time - session_data.start_time).total_seconds() / 60
    
    work_session = WorkSession(
        user_id=user_id,
        start_time=session_data.start_time,
        end_time=session_data.end_time,
        duration_minutes=int(duration),
        activity_type=session_data.activity_type,
        productivity_score=session_data.productivity_score
    )
    
    db.add(work_session)
    db.commit()
    db.refresh(work_session)
    
    return WorkSessionResponse(
        id=work_session.id,
        start_time=work_session.start_time,
        end_time=work_session.end_time,
        duration_minutes=work_session.duration_minutes,
        activity_type=work_session.activity_type,
        productivity_score=work_session.productivity_score,
        created_at=work_session.created_at
    )

@router.get("/", response_model=List[WorkSessionResponse])
async def get_work_sessions(
    timeframe: str = Query("7d", description="Timeframe for sessions (7d, 30d)"),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get work sessions for the current user"""
    
    # Parse timeframe
    days = 7 if timeframe == "7d" else 30
    start_date = datetime.utcnow() - timedelta(days=days)
    
    sessions = db.query(WorkSession).filter(
        WorkSession.user_id == user_id,
        WorkSession.start_time >= start_date
    ).order_by(WorkSession.start_time.desc()).all()
    
    return [WorkSessionResponse(
        id=session.id,
        start_time=session.start_time,
        end_time=session.end_time,
        duration_minutes=session.duration_minutes,
        activity_type=session.activity_type,
        productivity_score=session.productivity_score,
        created_at=session.created_at
    ) for session in sessions]

@router.get("/patterns")
async def get_work_patterns(
    timeframe: str = Query("7d", description="Timeframe for analysis (7d, 30d)"),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get work pattern analysis for the current user"""
    
    # Parse timeframe
    days = 7 if timeframe == "7d" else 30
    start_date = datetime.utcnow() - timedelta(days=days)
    
    sessions = db.query(WorkSession).filter(
        WorkSession.user_id == user_id,
        WorkSession.start_time >= start_date
    ).all()
    
    if not sessions:
        return {"message": "No work sessions found", "patterns": {}}
    
    # Calculate patterns
    total_hours = sum(session.duration_minutes for session in sessions) / 60
    avg_daily_hours = total_hours / days
    
    # Group by hour of day
    hourly_distribution = {}
    for session in sessions:
        hour = session.start_time.hour
        if hour not in hourly_distribution:
            hourly_distribution[hour] = 0
        hourly_distribution[hour] += session.duration_minutes
    
    # Most productive hours
    most_productive_hours = sorted(hourly_distribution.items(), key=lambda x: x[1], reverse=True)[:3]
    
    return {
        "total_hours": total_hours,
        "avg_daily_hours": avg_daily_hours,
        "most_productive_hours": [{"hour": hour, "minutes": minutes} for hour, minutes in most_productive_hours],
        "hourly_distribution": hourly_distribution,
        "session_count": len(sessions)
    }

work_sessions_router = router