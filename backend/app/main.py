# app/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from typing import List
from . import db, crud, llm_client
from .schemas import OnboardingSubmitRequest, OnboardingResponse, GeneratedHabitOut
from .models import OnboardingAnswer
import os

app = FastAPI(title="Habit Tracker Backend")

# CORS for your Next.js frontend during dev
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    db.create_db_and_tables()

@app.post("/onboarding/submit", response_model=OnboardingResponse)
def submit_onboarding(payload: OnboardingSubmitRequest, session: Session = Depends(db.get_session)):
    # 1) Save incoming answers
    answers_in = payload.answers
    if not answers_in or len(answers_in) == 0:
        raise HTTPException(status_code=400, detail="No answers provided.")
    crud.save_onboarding_answers(session, answers_in)

    # 2) Prepare answers for LLM (list of {question, answer})
    answers_for_llm = [{"question": a.question, "answer": a.answer} for a in answers_in]

    # 3) Call LLM to generate personalized habits
    try:
        generated = llm_client.generate_personalized_habits(answers_for_llm, n_habits=4)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM generation failed: {e}")

    # 4) Save generated habits
    saved = crud.save_generated_habits(session, payload.user_id, generated, source="llm-v1")

    # 5) Build response (use metadata_json column — NOT s.metadata)
    out = []
    for s in saved:
        out.append(GeneratedHabitOut(
            id=s.id,
            title=s.title,
            description=s.description,
            frequency=s.frequency,
            difficulty=s.difficulty,
            metadata=s.metadata_json  # <-- use metadata_json here
        ))
    return OnboardingResponse(user_id=payload.user_id, generated_habits=out)

@app.get("/onboarding/{user_id}", response_model=OnboardingResponse)
def get_onboarding(user_id: int, session: Session = Depends(db.get_session)):
    habits = crud.get_generated_habits_for_user(session, user_id)
    out = [
        GeneratedHabitOut(
            id=h.id,
            title=h.title,
            description=h.description,
            frequency=h.frequency,
            difficulty=h.difficulty,
            metadata=h.metadata_json  # <-- also here
        ) for h in habits
    ]
    return OnboardingResponse(user_id=user_id, generated_habits=out)
