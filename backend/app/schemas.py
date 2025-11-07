# app/schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional

class OnboardingAnswerIn(BaseModel):
    user_id: int
    question: str
    answer: str

class OnboardingSubmitRequest(BaseModel):
    user_id: int
    answers: List[OnboardingAnswerIn]

class GeneratedHabitOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    frequency: Optional[str]
    difficulty: Optional[str]
    # expose as "metadata" externally, store as metadata_json internally
    metadata: Optional[str] = Field(default=None, alias="metadata")

    class Config:
        allow_population_by_field_name = True
        # keep aliases when returning dict/json
        by_alias = True

class OnboardingResponse(BaseModel):
    user_id: int
    generated_habits: List[GeneratedHabitOut]
