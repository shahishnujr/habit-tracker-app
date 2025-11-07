# app/crud.py
from sqlmodel import Session, select
from typing import List
from .models import OnboardingAnswer, GeneratedHabit
from .schemas import OnboardingAnswerIn
from datetime import datetime

def save_onboarding_answers(session: Session, answers: List[OnboardingAnswerIn]):
    objs = []
    for a in answers:
        obj = OnboardingAnswer(
            user_id=a.user_id,
            question=a.question,
            answer=a.answer,
            created_at=datetime.utcnow()
        )
        session.add(obj)
        objs.append(obj)
    session.commit()
    for obj in objs:
        session.refresh(obj)
    return objs

def save_generated_habits(session: Session, user_id: int, habits: List[dict], source="llm-v1"):
    saved = []
    for h in habits:
        gh = GeneratedHabit(
            user_id=user_id,
            title=h.get("title"),
            description=h.get("description"),
            frequency=h.get("frequency"),
            difficulty=h.get("difficulty"),
            metadata_json=h.get("metadata") or h.get("metadata_json"),
            source=source
        )
        session.add(gh)
        saved.append(gh)
    session.commit()
    for gh in saved:
        session.refresh(gh)
    return saved

def get_generated_habits_for_user(session: Session, user_id: int):
    statement = select(GeneratedHabit).where(GeneratedHabit.user_id == user_id).order_by(GeneratedHabit.created_at.desc())
    results = session.exec(statement).all()
    return results

def get_onboarding_answers_for_user(session: Session, user_id: int):
    statement = select(OnboardingAnswer).where(OnboardingAnswer.user_id == user_id).order_by(OnboardingAnswer.created_at.desc())
    return session.exec(statement).all()
