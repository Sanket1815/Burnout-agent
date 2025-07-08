from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# User schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    created_at: datetime

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Journal schemas
class JournalEntryCreate(BaseModel):
    content: str

class JournalEntryResponse(BaseModel):
    id: int
    content: str
    sentiment_score: Optional[float]
    emotion_analysis: Optional[Dict[str, Any]]
    created_at: datetime

# Work session schemas
class WorkSessionCreate(BaseModel):
    start_time: datetime
    end_time: datetime
    activity_type: str
    productivity_score: Optional[float] = None

class WorkSessionResponse(BaseModel):
    id: int
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    activity_type: str
    productivity_score: Optional[float]
    created_at: datetime

# Burnout schemas
class BurnoutScoreResponse(BaseModel):
    id: int
    overall_score: float
    work_hours_score: float
    sentiment_score: float
    meeting_load_score: float
    email_stress_score: float
    burnout_level: str
    calculated_at: datetime

class BurnoutMetrics(BaseModel):
    current_score: float
    burnout_level: str
    weekly_trend: List[float]
    work_hours_avg: float
    meeting_load: int
    email_stress: float
    journal_sentiment: float

# Meeting schemas
class MeetingResponse(BaseModel):
    id: int
    title: str
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    attendees_count: int
    is_after_hours: bool

# Email schemas
class EmailResponse(BaseModel):
    id: int
    subject: str
    sent_at: datetime
    is_sent: bool
    is_after_hours: bool
    sentiment_score: Optional[float]
    stress_indicators: Optional[Dict[str, Any]]