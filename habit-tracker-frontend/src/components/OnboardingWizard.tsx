"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { BackgroundBeams } from "./BackgroundBeams";

type Question = {
  id: number;
  text: string;
  options: string[];
};

type GeneratedHabit = {
  id: number;
  title: string;
  description?: string | null;
  frequency?: string | null;
  difficulty?: string | null;
  metadata?: string | null;
};

const questions: Question[] = [
  {
    id: 1,
    text: "What is your current goal?",
    options: ["Fitness", "Mindfulness", "Productivity", "Sleep", "Custom"],
  },
  {
    id: 2,
    text: "How much time can you commit daily?",
    options: ["< 5 mins", "10–20 mins", "> 30 mins", "Custom"],
  },
  {
    id: 3,
    text: "When would you prefer to do habits?",
    options: ["Morning", "Evening", "Throughout day", "Custom"],
  },
  {
    id: 4,
    text: "Do you want reminders?",
    options: ["Yes", "No", "Custom"],
  },
];

export default function OnboardingWizard({
  backendOrigin = (process.env.NEXT_PUBLIC_BACKEND_ORIGIN as string) ?? "http://127.0.0.1:8000",
  userId = 1,
}: {
  backendOrigin?: string;
  userId?: number;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(
    () => Array(questions.length).fill("")
  );
  const [customValue, setCustomValue] = useState<string>("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<GeneratedHabit[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLast = step >= questions.length;

  const _titleKey = (t?: string) => (t || "").trim().toLowerCase();

  const handleSelect = (opt: string) => {
    if (opt === "Custom") {
      setAnswers((prev) => {
        const next = [...prev];
        next[step] = "Custom";
        return next;
      });
      setCustomValue("");
      setShowCustomInput(true);
      return;
    }
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = opt;
      return next;
    });
    setShowCustomInput(false);
    setStep((p) => Math.min(questions.length, p + 1));
  };

  const handleSaveCustom = () => {
    const trimmed = customValue.trim();
    if (!trimmed) {
      alert("Please enter a value for the custom answer or press Cancel.");
      return;
    }
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = trimmed;
      return next;
    });
    setShowCustomInput(false);
    setCustomValue("");
    setStep((p) => Math.min(questions.length, p + 1));
  };

  const handleCancelCustom = () => {
    setAnswers((prev) => {
      const next = [...prev];
      if (next[step] === "Custom") next[step] = "";
      return next;
    });
    setShowCustomInput(false);
    setCustomValue("");
  };

  const handleBack = () => {
    if (showCustomInput) {
      handleCancelCustom();
      return;
    }
    setStep((s) => Math.max(0, s - 1));
  };

  async function submitToBackend() {
    setError(null);
    setLoading(true);
    setGenerated(null);
    try {
      for (let i = 0; i < questions.length; i++) {
        if (!answers[i] || answers[i].trim() === "") {
          throw new Error("Please answer all questions before generating suggestions.");
        }
      }

      const payloadAnswers = questions.map((q, idx) => ({
        user_id: userId,
        question: q.text,
        answer: answers[idx] ?? "",
      }));

      const res = await fetch(`${backendOrigin.replace(/\/$/, "")}/onboarding/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, answers: payloadAnswers }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Server ${res.status}: ${txt}`);
      }

      const json = await res.json();
      const fromServer: GeneratedHabit[] = json.generated_habits ?? [];
      setGenerated(fromServer);

      // Persist raw generated list (LLM output) so user can review later
      try {
        localStorage.setItem("jtj_generated_habits", JSON.stringify(fromServer));
      } catch {}

      // IMPORTANT: do NOT automatically merge into active habits or redirect.
      // User will manually choose which suggestions to add (per your request).

    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to generate suggestions");
    } finally {
      setLoading(false);
    }
  }

  // Add single suggestion to active habits (user chooses)
  const addSingleHabit = (h: GeneratedHabit) => {
    try {
      const key = "jtj_active_habits";
      const raw = localStorage.getItem(key);
      let arr: any[] = raw ? JSON.parse(raw) : [];
      const exists = arr.some((a) => _titleKey(a.title) === _titleKey(h.title));
      if (!exists) {
        arr.push({
          id: h.id ?? `gen-${Date.now()}`,
          title: h.title,
          description: h.description ?? "",
          frequency: h.frequency ?? "",
          difficulty: h.difficulty ?? "",
          metadata: h.metadata ?? null,
          source: "generated",
        });
        localStorage.setItem(key, JSON.stringify(arr));
        alert("Added to your habits");
      } else {
        alert("Habit already exists in your list.");
      }
    } catch {
      alert("Failed to save habit");
    }
  };

  return (
    <main className="relative w-full h-full flex justify-center items-center">
      <BackgroundBeams className="pointer-events-none absolute inset-0 z-0" />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.35 }}
          className="relative z-10 w-full max-w-md p-6 sm:p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-[0_0_30px_rgba(99,102,241,0.3)]"
        >
          {!isLast ? (
            <>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-white text-center">
                {questions[step].text}
              </h2>

              <div className="flex flex-col space-y-3">
                {questions[step].options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    className="w-full py-2 px-4 rounded-lg bg-white/10 hover:bg-indigo-600 transition text-left text-white"
                  >
                    {opt}
                  </button>
                ))}

                {showCustomInput && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      className="w-full rounded-md border p-2 text-black"
                      placeholder="Write your custom answer..."
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveCustom}
                        className="px-3 py-2 bg-indigo-600 text-white rounded"
                      >
                        Save & Continue
                      </button>
                      <button
                        onClick={handleCancelCustom}
                        className="px-3 py-2 border rounded text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {answers[step] && !showCustomInput && (
                  <div className="mt-2 text-sm text-white/80">Selected: {answers[step]}</div>
                )}
              </div>

              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={handleBack}
                  disabled={step === 0}
                  className="px-3 py-2 border rounded text-white/80 disabled:opacity-50"
                >
                  Back
                </button>

                <div className="text-sm text-white/80">
                  Step {Math.min(step + 1, questions.length)} of {questions.length}
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-white text-center">
                We suggest these habits:
              </h2>

              {loading && <div className="text-center text-white/90">Generating suggestions…</div>}
              {error && <div className="text-sm text-red-400 mb-3">{error}</div>}

              {generated ? (
                <ul className="space-y-3 mb-5">
                  {generated.length === 0 && <li className="text-white/80">No suggestions returned.</li>}
                  {generated.map((h) => (
                    <li
                      key={h.id ?? `${h.title}`}
                      className="py-2 px-4 bg-white/10 rounded-lg flex justify-between items-center text-white"
                    >
                      <div>
                        <div className="font-medium">{h.title}</div>
                        <div className="text-xs text-white/70">{h.description}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => addSingleHabit(h)}
                          className="text-indigo-400 hover:underline"
                        >
                          Add
                        </button>
                        <span className="text-xs text-white/60">{h.frequency ?? ""}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mb-5 text-white/80">
                  Click generate to get personalized suggestions based on your answers.
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep(questions.length - 1);
                    setGenerated(null);
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2 border rounded text-white"
                >
                  Review answers
                </button>

                <button
                  onClick={() => submitToBackend()}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-indigo-600 rounded text-white disabled:opacity-60"
                >
                  {loading ? "Generating…" : "Generate suggestions"}
                </button>

                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-white/5 rounded text-white border border-white/10"
                >
                  Done
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
