// src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/app/layouts/DashboardLayout";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type Habit = {
  id: string | number;
  title: string;
  description?: string;
  frequency?: string;
  difficulty?: string;
  source?: string;
};

const ACTIVE_KEY = "jtj_active_habits";

export default function DashboardPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const router = useRouter();

  const loadHabits = useCallback(() => {
    const raw = localStorage.getItem(ACTIVE_KEY);
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      setHabits(parsed);
    } catch {
      setHabits([]);
    }
  }, []);

  useEffect(() => {
    loadHabits();

    // Update when other tabs/pages change localStorage
    const onStorage = (e: StorageEvent) => {
      if (e.key === ACTIVE_KEY) loadHabits();
    };
    window.addEventListener("storage", onStorage);

    // Also refresh when page becomes visible (useful when navigating back)
    const onVisibility = () => {
      if (!document.hidden) loadHabits();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [loadHabits]);

  const handleRemove = (id: string | number) => {
    const next = habits.filter((x) => x.id !== id);
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(next));
    setHabits(next);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Your Habits</h1>
            <p className="text-sm text-gray-300 mt-1">View and manage habits you’ve added. Create a new one or import suggestions from Onboarding.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/onboarding" className="px-4 py-2 border border-white/10 rounded-md bg-white/5 text-white hover:bg-white/6 transition">
              Onboarding suggestions
            </Link>

            <Link href="dashboard/create" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-lg shadow-lg hover:scale-[1.01] transform transition">
              {/* plus icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
              Create new habit
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          {/* Empty state */}
          <AnimatePresence>
            {habits.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl border border-white/10 bg-gradient-to-tr from-white/3 to-white/2 p-8">
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white">No habits yet</h2>
                    <p className="text-sm text-gray-300 mt-1 max-w-xl">
                      Your dashboard is empty — create a habit or run the Onboarding to get personalized suggestions. Added habits will appear here.
                    </p>
                    <div className="mt-4 flex gap-3">
                      <Link href="/create" className="px-4 py-2 bg-indigo-600 rounded text-white shadow hover:bg-indigo-700">Create a habit</Link>
                      <Link href="/onboarding" className="px-4 py-2 border rounded text-white/90">Get suggestions</Link>
                    </div>
                  </div>

                  <div className="hidden sm:block">
                    <div className="w-[220px] h-[140px] rounded-2xl bg-gradient-to-tr from-indigo-700/40 to-violet-700/25 backdrop-blur p-4 flex items-center justify-center">
                      <div className="text-white/90 text-center">
                        <div className="text-3xl font-bold">🚀</div>
                        <div className="text-sm mt-2">Start small. Win daily.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Habits grid */}
          {habits.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {habits.map((h) => (
                <motion.div key={h.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-lg font-semibold">
                          {String(h.title || "H").slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-lg">{h.title}</div>
                          {h.description && <div className="text-sm text-gray-300 mt-1 max-w-[22rem]">{h.description}</div>}
                          <div className="text-[11px] text-gray-400 mt-2">{h.frequency ?? "—"} • {h.difficulty ?? "—"}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => handleRemove(h.id)} className="text-sm text-red-400 hover:underline">Remove</button>
                      <div className="text-xs text-gray-400">{h.source ?? "manual"}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
