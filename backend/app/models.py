# app/models.py
from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime

class User(SQLModel, table=True):   # placeholder; authentication not implemented
    id: Optional[int] = Field(default=None, primary_key=True)
    name: Optional[str] = None
    email: Optional[str] = None

class OnboardingAnswer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    question: str
    answer: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class GeneratedHabit(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    title: str
    description: Optional[str] = None
    frequency: Optional[str] = None        # e.g., "Daily", "3x/week"
    difficulty: Optional[str] = None      # e.g., "Easy", "Moderate"
    metadata_json: Optional[str] = None   # renamed to avoid SQLAlchemy conflict
    source: Optional[str] = None          # e.g., "llm-v1"
    created_at: datetime = Field(default_factory=datetime.utcnow)
