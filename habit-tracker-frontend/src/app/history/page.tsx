// src/app/history/page.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import DashboardLayout from "@/app/layouts/DashboardLayout";
import { BackgroundBeams } from "@/components/BackgroundBeams";
import Link from "next/link";
import { motion } from "framer-motion";

type Habit = {
  id: string | number;
  title: string;
  description?: string;
  frequency?: string;
  difficulty?: string;
  source?: string;
};

type CheckIn = {
  habitId: string | number;
  date: string; // YYYY-MM-DD
};

const ACTIVE_KEY = "jtj_active_habits";
const CHECKIN_KEY = "jtj_checkins";

function formatYMD(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function daysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}
function monthLabel(date: Date) {
  return date.toLocaleString(undefined, { month: "long", year: "numeric" });
}
function weekdayLabels() {
  // Sunday-first to match prior UI
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
}

export default function HistoryPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [selectedHabitId, setSelectedHabitId] = useState<string | number | "all">("all");
  const [viewDate, setViewDate] = useState<Date>(() => new Date());

  // load from localStorage
  const loadFromStorage = useCallback(() => {
    try {
      const rawH = localStorage.getItem(ACTIVE_KEY);
      const parsedH = rawH ? JSON.parse(rawH) : [];
      setHabits(parsedH);
    } catch {
      setHabits([]);
    }

    try {
      const rawC = localStorage.getItem(CHECKIN_KEY);
      const parsedC = rawC ? JSON.parse(rawC) : [];
      setCheckins(parsedC);
    } catch {
      setCheckins([]);
    }
  }, []);

  useEffect(() => {
    loadFromStorage();

    const onStorage = (e: StorageEvent) => {
      if (!e.key || [ACTIVE_KEY, CHECKIN_KEY].includes(e.key)) loadFromStorage();
    };
    window.addEventListener("storage", onStorage);
    const onVisibility = () => {
      if (!document.hidden) loadFromStorage();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [loadFromStorage]);

  // Derived calendar data
  const firstOfMonth = useMemo(() => startOfMonth(viewDate), [viewDate]);
  const totalDays = useMemo(() => daysInMonth(viewDate), [viewDate]);
  const startWeekday = useMemo(() => firstOfMonth.getDay(), [firstOfMonth]); // 0..6

  // Filtered checkins for selected habit and current month
  const checkinSet = useMemo(() => {
    // Build a Set of date strings that are checked for the selected habit (or across all habits)
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth() + 1;
    const monthPrefix = `${y}-${String(m).padStart(2, "0")}-`;
    if (selectedHabitId === "all") {
      // include any habit
      return new Set(
        checkins
          .filter((c) => c.date.startsWith(monthPrefix))
          .map((c) => c.date)
      );
    } else {
      return new Set(
        checkins
          .filter((c) => c.habitId === selectedHabitId && c.date.startsWith(monthPrefix))
          .map((c) => c.date)
      );
    }
  }, [checkins, selectedHabitId, viewDate]);

  // Summary by habit for this month
  const summary = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth() + 1;
    const monthPrefix = `${y}-${String(m).padStart(2, "0")}-`;
    const counts: { [k: string]: number } = {};
    for (const c of checkins) {
      if (!c.date.startsWith(monthPrefix)) continue;
      counts[String(c.habitId)] = (counts[String(c.habitId)] || 0) + 1;
    }
    return counts;
  }, [checkins, viewDate]);

  // Toggle check-in for a habit on a date
  const toggleCheckin = (habitId: string | number, dateYMD: string) => {
    // If selectedHabitId is "all", we won't toggle (require selection)
    if (selectedHabitId === "all") {
      // optionally we could toggle for all, but keep UX simple: require a habit
      alert("Select a habit on the right to mark check-ins for it.");
      return;
    }

    const exists = checkins.some((c) => c.habitId === habitId && c.date === dateYMD);
    let next: CheckIn[] = [];
    if (exists) {
      next = checkins.filter((c) => !(c.habitId === habitId && c.date === dateYMD));
    } else {
      next = [...checkins, { habitId, date: dateYMD }];
    }
    try {
      localStorage.setItem(CHECKIN_KEY, JSON.stringify(next));
      setCheckins(next);
    } catch (e) {
      console.error("Failed to save checkins", e);
      alert("Could not persist check-in locally.");
    }
  };

  // helper: count for selected habit
  const selectedCount = useMemo(() => {
    if (selectedHabitId === "all") {
      return checkinSet.size;
    } else {
      return summary[String(selectedHabitId)] ?? 0;
    }
  }, [checkinSet, summary, selectedHabitId]);

  // compute longest current streak for selected habit up to today (within month)
  const computeStreak = useCallback(() => {
    if (selectedHabitId === "all") return 0;
    const today = new Date();
    // We'll compute consecutive days up to today that are checked (not cross-month accurate)
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const ymd = formatYMD(d);
      const has = checkins.some((c) => c.habitId === selectedHabitId && c.date === ymd);
      if (has) streak++;
      else break;
    }
    return streak;
  }, [checkins, selectedHabitId]);

  const streak = computeStreak();

  // Build calendar array: cells including leading blanks
  const calendarCells = useMemo(() => {
    const cells: { ymd?: string; number?: number }[] = [];
    // leading blanks
    for (let i = 0; i < startWeekday; i++) cells.push({});
    for (let d = 1; d <= totalDays; d++) {
      const dt = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
      cells.push({ ymd: formatYMD(dt), number: d });
    }
    // trailing blanks to make full weeks (optional)
    while (cells.length % 7 !== 0) cells.push({});
    return cells;
  }, [startWeekday, totalDays, viewDate]);

  // Quick handlers to change month
  const prevMonth = () => setViewDate((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1));
  const nextMonth = () => setViewDate((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1));

  return (
    <DashboardLayout>
      <main className="relative w-full min-h-screen text-white">
        <BackgroundBeams className="pointer-events-none z-0" />

        <div className="z-10 w-full max-w-6xl mx-auto mt-12 p-6 sm:p-10 bg-white/6 backdrop-blur-md rounded-2xl border border-white/20 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-3xl font-semibold">Habit History</h2>
              <p className="text-sm text-gray-300 mt-1">Track what you completed this month. Select a habit on the right, then click a day to mark/unmark check-in.</p>

              {/* Calendar header */}
              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button onClick={prevMonth} className="px-3 py-2 rounded-md bg-white/5 border border-white/10">◀</button>
                  <div className="text-lg font-medium">{monthLabel(viewDate)}</div>
                  <button onClick={nextMonth} className="px-3 py-2 rounded-md bg-white/5 border border-white/10">▶</button>
                </div>

                <div className="text-sm text-gray-300">
                  Showing: <span className="text-white font-medium">{selectedHabitId === "all" ? "All habits" : (habits.find(h => h.id === selectedHabitId)?.title ?? "—")}</span>
                </div>
              </div>

              {/* Weekday labels */}
              <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-gray-400">
                {weekdayLabels().map((d) => (
                  <div key={d} className="py-1 font-medium">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="mt-2 grid grid-cols-7 gap-1">
                {calendarCells.map((cell, idx) => {
                  const isDay = !!cell.number && !!cell.ymd;
                  const isToday = isDay && cell.ymd === formatYMD(new Date());
                  const checked = isDay && checkinSet.has(cell.ymd!);
                  return (
                    <div key={idx} className={`aspect-square rounded-md overflow-hidden`}>
                      <button
                        onClick={() => {
                          if (!isDay) return;
                          if (selectedHabitId === "all") {
                            alert("Select a habit on the right to mark check-ins.");
                            return;
                          }
                          toggleCheckin(selectedHabitId as string | number, cell.ymd!);
                        }}
                        className={`w-full h-full p-2 flex flex-col items-start justify-between transition
                          ${!isDay ? "bg-transparent" : checked ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white" : "bg-white/5 text-white/80"}
                          ${isToday ? "ring-2 ring-indigo-400" : "ring-0"}
                          rounded-md`}
                      >
                        <div className="text-sm font-medium">{cell.number ?? ""}</div>

                        <div className="self-end">
                          {checked ? (
                            <div className="text-[10px] font-semibold">✓</div>
                          ) : (
                            <div className="text-[10px] text-gray-400">-</div>
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Small legend */}
              <div className="mt-4 text-sm flex items-center gap-4 text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-gradient-to-br from-indigo-500 to-violet-500 inline-block" />
                  <span>Checked</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-white/5 inline-block" />
                  <span>Not checked</span>
                </div>
              </div>
            </div>

            {/* Right column: summary & habit selector */}
            <aside className="w-80 shrink-0">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-300">Month summary</div>
                    <div className="text-2xl font-semibold text-white mt-1">{selectedCount}</div>
                    <div className="text-xs text-gray-400">Checked days</div>
                  </div>
                  <div className="text-sm text-gray-300">
                    Streak: <span className="font-medium text-white">{selectedHabitId === "all" ? "—" : streak}</span>
                  </div>
                </div>

                <hr className="my-3 border-white/6" />

                <div>
                  <div className="text-sm text-gray-300 mb-2">Habits</div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    <button
                      onClick={() => setSelectedHabitId("all")}
                      className={`w-full text-left px-3 py-2 rounded-md ${selectedHabitId === "all" ? "bg-indigo-600/30 ring-1 ring-indigo-400" : "bg-white/3 hover:bg-white/4"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">All habits</div>
                        <div className="text-xs text-gray-300">{Array.from(new Set(checkins.map(c => c.date))).length}</div>
                      </div>
                    </button>

                    {habits.length === 0 && <div className="text-sm text-gray-400 py-3">No habits yet. Add from Dashboard or Onboarding.</div>}
                    {habits.map((h) => {
                      const cnt = summary[String(h.id)] ?? 0;
                      const isSel = selectedHabitId === h.id;
                      return (
                        <div key={String(h.id)} className="flex items-center justify-between">
                          <button
                            onClick={() => setSelectedHabitId(h.id)}
                            className={`w-full text-left px-3 py-2 rounded-md ${isSel ? "bg-indigo-600/30 ring-1 ring-indigo-400" : "bg-white/3 hover:bg-white/4"}`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-white">{h.title}</div>
                                <div className="text-xs text-gray-400">{h.frequency ?? ""}</div>
                              </div>
                              <div className="text-xs text-gray-300">{cnt}</div>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link href="/dashboard" className="flex-1 px-3 py-2 rounded bg-white/5 text-sm text-white">Back</Link>
                  <Link href="/create" className="px-3 py-2 rounded bg-indigo-600 text-sm text-white">Create</Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
