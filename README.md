# 🧠 AI-Based Daily Habit Tracker

A full-stack web application that helps users build, track, and maintain daily habits through AI-driven personalized habit suggestions.  
Developed using **Next.js (TypeScript)** for the frontend and **FastAPI (Python)** for the backend.

---

## 🚀 Features

- ✨ AI-powered onboarding to suggest personalized habits (using OpenAI + LangChain)
- 🧩 Create, edit, and manage habits on your dashboard
- 📅 Visual history calendar for daily check-ins
- 📤 Export progress data (CSV/JSON)
- 💾 LocalStorage persistence for quick access
- 🧱 FastAPI backend with modular endpoints
- 🎨 Glassmorphism UI built with Tailwind CSS + Framer Motion

---

## 🧩 Tech Stack

| Layer | Technology |
|--------|-------------|
| Frontend | Next.js (React + TypeScript), Tailwind CSS, Framer Motion |
| Backend | FastAPI, LangChain, OpenAI API |
| Database | SQLite (SQLModel ORM) |
| Tools | VS Code, Git, Postman |
| Deployment | Localhost / Any cloud platform (Render, Vercel) |

---

## ⚙️ Installation & Setup

### 🖥️ Frontend (Next.js)
```bash
cd habit-tracker-frontend
npm install
npm run dev
```
App runs on: [http://localhost:3000](http://localhost:3000)

### ⚙️ Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🔗 API Endpoints (Summary)

| Method | Endpoint | Description |
|---------|-----------|--------------|
| POST | `/onboarding/submit` | Submit onboarding answers and receive AI-generated habit suggestions |
| GET | `/habits/{user_id}` | Retrieve active habits for a user |
| POST | `/habits` | Add a new habit |
| GET | `/export/{user_id}` | Export user's habit data |

---

## 🧠 Project Structure

```
habit-tracker/
│
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI entry point
│   │   ├── crud.py           # Database operations
│   │   ├── db.py             # Database setup
│   │   ├── models.py         # ORM models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── llm_client.py     # OpenAI + LangChain logic
│   └── requirements.txt
│
├── habit-tracker-frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── onboarding/
│   │   ├── history/
│   │   └── export/
│   └── components/
│       ├── HabitCard.tsx
│       ├── OnboardingWizard.tsx
│       ├── QuoteWidget.tsx
│
└── README.md
```

---

## 🧾 Environment Variables

Create a `.env` file inside your `backend/` directory:

```
OPENAI_API_KEY=sk-xxxxxx
OPENAI_MODEL=gpt-4o-mini
DB_URL=sqlite:///./ai-habit.db
```

---

## 🧪 Testing Instructions

- Run **FastAPI Swagger UI** at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Use the `/onboarding/submit` endpoint with example payloads
- Check browser console / LocalStorage to verify habit persistence
- Test regression by restarting frontend and verifying data reloading

---

## 🧑‍💻 Developer Notes

This project was developed as part of the **Software Engineering Laboratory (CSE302L)** coursework.  
It demonstrates software design principles, modular development, testing, and integration of AI components within a full-stack system.

---

## 🏷️ Author

**Name:** Shahishnu J R  
**Reg No:** 22BCE1046  
**Institution:** Vellore Institute of Technology (VIT)  
**Course:** Software Engineering Lab (CSE302L)

---

## 📜 License

This project is open-source for educational purposes.
