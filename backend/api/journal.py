from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from database.database import get_db
from database.models import JournalEntry
from services.vertex_ai_service import vertex_ai_service
from models.schemas import JournalEntryCreate, JournalEntryResponse
from api.auth import get_current_user_id

router = APIRouter()

@router.post("/", response_model=JournalEntryResponse)
async def create_journal_entry(
    entry_data: JournalEntryCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create a new journal entry with sentiment analysis"""
    
    # Analyze sentiment using Vertex AI
    sentiment_analysis = vertex_ai_service.analyze_sentiment(entry_data.content)
    
    # Create journal entry
    journal_entry = JournalEntry(
        user_id=user_id,
        content=entry_data.content,
        sentiment_score=sentiment_analysis["sentiment_score"],
        emotion_analysis=sentiment_analysis
    )
    
    db.add(journal_entry)
    db.commit()
    db.refresh(journal_entry)
    
    return JournalEntryResponse(
        id=journal_entry.id,
        content=journal_entry.content,
        sentiment_score=journal_entry.sentiment_score,
        emotion_analysis=journal_entry.emotion_analysis,
        created_at=journal_entry.created_at
    )

@router.get("/recent", response_model=List[JournalEntryResponse])
async def get_recent_journal_entries(
    limit: int = Query(10, description="Number of entries to return"),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get recent journal entries for the current user"""
    
    entries = db.query(JournalEntry).filter(
        JournalEntry.user_id == user_id
    ).order_by(JournalEntry.created_at.desc()).limit(limit).all()
    
    return [JournalEntryResponse(
        id=entry.id,
        content=entry.content,
        sentiment_score=entry.sentiment_score,
        emotion_analysis=entry.emotion_analysis,
        created_at=entry.created_at
    ) for entry in entries]

@router.get("/{entry_id}", response_model=JournalEntryResponse)
async def get_journal_entry(
    entry_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get a specific journal entry"""
    
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == user_id
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    
    return JournalEntryResponse(
        id=entry.id,
        content=entry.content,
        sentiment_score=entry.sentiment_score,
        emotion_analysis=entry.emotion_analysis,
        created_at=entry.created_at
    )

journal_router = router