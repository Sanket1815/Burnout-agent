from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from database.database import get_db
from services.burnout_analyzer import burnout_analyzer
from services.websocket_manager import websocket_manager
from models.schemas import BurnoutMetrics, BurnoutScoreResponse
from api.auth import get_current_user_id

router = APIRouter()

@router.get("/metrics", response_model=BurnoutMetrics)
async def get_burnout_metrics(
    timeframe: str = Query("7d", description="Timeframe for metrics (7d, 30d)"),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get burnout metrics for the current user"""
    
    # Parse timeframe
    days = 7 if timeframe == "7d" else 30
    
    # Calculate current burnout score
    burnout_data = burnout_analyzer.calculate_burnout_score(db, user_id, days)
    
    # Get trend data
    trend = burnout_analyzer.get_burnout_trend(db, user_id, days)
    
    # Send real-time update via WebSocket
    await websocket_manager.send_burnout_update(str(user_id), burnout_data)
    
    return BurnoutMetrics(
        current_score=burnout_data["overall_score"],
        burnout_level=burnout_data["burnout_level"],
        weekly_trend=trend[-7:] if len(trend) >= 7 else trend,
        work_hours_avg=burnout_data["work_hours_score"] * 16,  # Convert back to hours
        meeting_load=int(burnout_data["meeting_load_score"] * 35),  # Convert back to meeting count
        email_stress=burnout_data["email_stress_score"],
        journal_sentiment=burnout_data["sentiment_score"]
    )

@router.get("/history", response_model=List[BurnoutScoreResponse])
async def get_burnout_history(
    limit: int = Query(30, description="Number of records to return"),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get burnout score history for the current user"""
    
    from database.models import BurnoutScore
    
    scores = db.query(BurnoutScore).filter(
        BurnoutScore.user_id == user_id
    ).order_by(BurnoutScore.calculated_at.desc()).limit(limit).all()
    
    return [BurnoutScoreResponse(
        id=score.id,
        overall_score=score.overall_score,
        work_hours_score=score.work_hours_score,
        sentiment_score=score.sentiment_score,
        meeting_load_score=score.meeting_load_score,
        email_stress_score=score.email_stress_score,
        burnout_level=score.burnout_level,
        calculated_at=score.calculated_at
    ) for score in scores]

@router.post("/calculate")
async def calculate_burnout(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Manually trigger burnout calculation"""
    
    burnout_data = burnout_analyzer.calculate_burnout_score(db, user_id, 7)
    
    # Send real-time update via WebSocket
    await websocket_manager.send_burnout_update(str(user_id), burnout_data)
    
    return {"message": "Burnout calculation completed", "data": burnout_data}

burnout_router = router