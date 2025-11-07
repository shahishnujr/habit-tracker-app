# app/llm_client.py  (Option A - LangChain)
import os
import re
import json
from typing import List, Dict
from dotenv import load_dotenv

# load .env from backend/
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Modern LangChain imports (avoid root-module deprecation warnings)
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.chat_models import ChatOpenAI


def make_prompt_from_answers(answers: List[Dict]) -> str:
    lines = []
    lines.append("You are an assistant that suggests small, evidence-backed daily or weekly habits tailored to a user.")
    lines.append("The user provided these onboarding Q&A pairs:")
    for i, a in enumerate(answers, 1):
        lines.append(f"{i}. Q: {a['question'].strip()}  A: {a['answer'].strip()}")
    lines.append("")
    lines.append("Produce 4 personalized habit suggestions. For each habit, return a JSON object with fields:")
    lines.append('title (short), description (1-2 sentences), frequency (e.g., "Daily", "3x/week"), difficulty ("Easy"/"Moderate"/"Hard"), metadata (optional - JSON object or string).')
    lines.append("")
    lines.append("Return output as a JSON array ONLY. Do not include any commentary or explanation.")
    return "\n".join(lines)


def parse_llm_json(raw_text: str):
    # Try to extract the first JSON array found in the output
    m = re.search(r"(\[.*\])", raw_text, re.S)
    candidate = m.group(1) if m else raw_text
    try:
        data = json.loads(candidate)
        if isinstance(data, list):
            return data
    except Exception:
        # Last-resort: try to load the whole text
        try:
            return json.loads(raw_text.strip())
        except Exception:
            return []
    return []


def generate_personalized_habits(answers: List[Dict], n_habits: int = 4, temperature: float = 0.7) -> List[Dict]:
    """
    Returns list of dicts with keys: title, description, frequency, difficulty, metadata (string or JSON-string).
    """
    # If no API key is set, return deterministic sample data so you can test without OpenAI.
    if not OPENAI_API_KEY:
        return [
            {
                "title": "10-minute Morning Walk",
                "description": "A short brisk walk after waking to gently raise heart rate and improve sleep rhythm.",
                "frequency": "Daily",
                "difficulty": "Easy",
                "metadata": json.dumps({"duration_min": 10})
            },
            {
                "title": "Protein-rich Breakfast",
                "description": "Include a protein source in your breakfast to reduce mid-morning cravings.",
                "frequency": "Daily",
                "difficulty": "Easy",
                "metadata": None
            },
            {
                "title": "Screen-free Wind-down",
                "description": "No screens 30 minutes before bed and light stretching to improve sleep onset.",
                "frequency": "Daily",
                "difficulty": "Easy",
                "metadata": None
            },
            {
                "title": "Knee-friendly Strength",
                "description": "Two short low-impact strength sessions per week focusing on glutes and quads.",
                "frequency": "2x/week",
                "difficulty": "Moderate",
                "metadata": json.dumps({"exercises":["glute bridges","isometric quad sets"]})
            }
        ][:n_habits]

    prompt_text = make_prompt_from_answers(answers)

    # PromptTemplate expects an input variable named "prompt" here
    prompt_template = PromptTemplate(input_variables=["prompt"], template="{prompt}")

    llm = ChatOpenAI(temperature=temperature, max_tokens=600, openai_api_key=OPENAI_API_KEY)
    chain = LLMChain(llm=llm, prompt=prompt_template)

    try:
        raw = chain.run({"prompt": prompt_text})
    except Exception as e:
        raise RuntimeError(f"LLM call failed: {e}")

    habits = parse_llm_json(raw)

    # Normalization: ensure consistent keys
    normalized = []
    if isinstance(habits, list):
        for h in habits[:n_habits]:
            if not isinstance(h, dict):
                normalized.append({
                    "title": str(h)[:120],
                    "description": None,
                    "frequency": None,
                    "difficulty": None,
                    "metadata": None
                })
                continue

            raw_meta = h.get("metadata") or h.get("metadata_json")
            if raw_meta is None:
                meta_val = None
            elif isinstance(raw_meta, str):
                meta_val = raw_meta
            else:
                try:
                    meta_val = json.dumps(raw_meta)
                except Exception:
                    meta_val = str(raw_meta)

            normalized.append({
                "title": (h.get("title") or "").strip()[:120],
                "description": (h.get("description") or "").strip() if h.get("description") else None,
                "frequency": h.get("frequency"),
                "difficulty": h.get("difficulty"),
                "metadata": meta_val
            })
    return normalized
