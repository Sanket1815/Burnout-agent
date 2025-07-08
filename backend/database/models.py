from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    journal_entries = relationship("JournalEntry", back_populates="user")
    work_sessions = relationship("WorkSession", back_populates="user")
    burnout_scores = relationship("BurnoutScore", back_populates="user")
    meetings = relationship("Meeting", back_populates="user")
    emails = relationship("Email", back_populates="user")

class JournalEntry(Base):
    __tablename__ = "journal_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    sentiment_score = Column(Float)
    emotion_analysis = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="journal_entries")

class WorkSession(Base):
    __tablename__ = "work_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    duration_minutes = Column(Integer)
    activity_type = Column(String)
    productivity_score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="work_sessions")

class BurnoutScore(Base):
    __tablename__ = "burnout_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    overall_score = Column(Float)
    work_hours_score = Column(Float)
    sentiment_score = Column(Float)
    meeting_load_score = Column(Float)
    email_stress_score = Column(Float)
    burnout_level = Column(String)  # low, moderate, high
    calculated_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="burnout_scores")

class Meeting(Base):
    __tablename__ = "meetings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    duration_minutes = Column(Integer)
    attendees_count = Column(Integer)
    is_after_hours = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="meetings")

class Email(Base):
    __tablename__ = "emails"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    subject = Column(String)
    body = Column(Text)
    sent_at = Column(DateTime)
    is_sent = Column(Boolean, default=True)
    is_after_hours = Column(Boolean, default=False)
    sentiment_score = Column(Float)
    stress_indicators = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="emails")