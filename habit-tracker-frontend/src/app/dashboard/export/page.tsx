// src/app/export/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/app/layouts/DashboardLayout";
import Link from "next/link";
import { ArrowDown, FileText, Download } from "lucide-react";

type Habit = {
  id: string | number;
  title: string;
  description?: string;
  frequency?: string;
  difficulty?: string;
  source?: string;
  startDate?: string | null;
  reminder?: boolean;
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

export default function ExportPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [from, setFrom] = useState<string>(""); // YYYY-MM-DD
  const [to, setTo] = useState<string>(""); // YYYY-MM-DD
  const [format, setFormat] = useState<"csv" | "json">("csv");

  // load storage
  useEffect(() => {
    try {
      const rawH = localStorage.getItem(ACTIVE_KEY);
      setHabits(rawH ? JSON.parse(rawH) : []);
    } catch {
      setHabits([]);
    }
    try {
      const rawC = localStorage.getItem(CHECKIN_KEY);
      setCheckins(rawC ? JSON.parse(rawC) : []);
    } catch {
      setCheckins([]);
    }

    // default date range: last 30 days
    const today = new Date();
    const prior = new Date();
    prior.setDate(today.getDate() - 30);
    setTo(formatYMD(today));
    setFrom(formatYMD(prior));
  }, []);

  // filtered checkins in range
  const filteredCheckins = useMemo(() => {
    if (!from || !to) return checkins;
    const fromD = new Date(from);
    const toD = new Date(to);
    return checkins.filter((c) => {
      const d = new Date(c.date);
      return d >= fromD && d <= toD;
    });
  }, [checkins, from, to]);

  const habitById = useMemo(() => {
    const map = new Map<string, Habit>();
    for (const h of habits) map.set(String(h.id), h);
    return map;
  }, [habits]);

  const totalInRange = filteredCheckins.length;
  const totalHabits = habits.length;

  // Build CSV content: each row is a check-in with habit metadata; if a habit has no check-ins in range we may still include one row with empty date (optional)
  const buildCSV = () => {
    const headers = [
      "habit_id",
      "title",
      "description",
      "source",
      "frequency",
      "difficulty",
      "startDate",
      "reminder",
      "checkin_date",
    ];
    const rows: string[][] = [];
    // rows from filtered checkins
    for (const c of filteredCheckins) {
      const h = habitById.get(String(c.habitId));
      rows.push([
        String(c.habitId),
        h?.title ?? "",
        h?.description ?? "",
        h?.source ?? "",
        h?.frequency ?? "",
        h?.difficulty ?? "",
        h?.startDate ?? "",
        h?.reminder ? "true" : "",
        c.date,
      ]);
    }

    // Optionally include habits that had 0 checkins in range (one row each with empty checkin_date)
    for (const h of habits) {
      const has = filteredCheckins.some((c) => String(c.habitId) === String(h.id));
      if (!has) {
        rows.push([
          String(h.id),
          h.title ?? "",
          h.description ?? "",
          h.source ?? "",
          h.frequency ?? "",
          h.difficulty ?? "",
          h.startDate ?? "",
          h.reminder ? "true" : "",
          "",
        ]);
      }
    }

    // Escape CSV
    const escape = (v: string) => {
      if (v == null) return "";
      const s = String(v);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const csv = [headers.join(",")]
      .concat(rows.map((r) => r.map(escape).join(",")))
      .join("\n");
    return csv;
  };

  const downloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (format === "csv") {
      const csv = buildCSV();
      const name = `jtj_habits_export_${from || "start"}_to_${to || "end"}.csv`;
      downloadFile(name, csv, "text/csv;charset=utf-8;");
    } else {
      // JSON export: include habits and filtered checkins
      const payload = {
        exported_at: new Date().toISOString(),
        range: { from: from || null, to: to || null },
        habits,
        checkins: filteredCheckins,
      };
      downloadFile(`jtj_habits_export_${from || "start"}_to_${to || "end"}.json`, JSON.stringify(payload, null, 2), "application/json");
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-3xl mx-auto p-8 bg-white/6 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(15,12,41,0.6)] mt-12">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white">Export Your Habit Logs</h2>
            <p className="text-gray-300 mt-1">Download your habit data for backups, analysis, or sharing.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-indigo-300 hover:underline">← Back to Dashboard</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-white/5 border border-white/6">
            <div className="text-sm text-gray-300">Date range</div>
            <div className="mt-2 flex gap-2">
              <input value={from} onChange={(e) => setFrom(e.target.value)} type="date" className="p-2 rounded bg-white/5 border border-white/10 text-white"/>
              <input value={to} onChange={(e) => setTo(e.target.value)} type="date" className="p-2 rounded bg-white/5 border border-white/10 text-white"/>
            </div>
            <div className="text-xs text-gray-400 mt-2">Default: last 30 days</div>
          </div>

          <div className="p-4 rounded-lg bg-white/5 border border-white/6 flex flex-col justify-between">
            <div>
              <div className="text-sm text-gray-300">Format</div>
              <div className="mt-2 flex items-center gap-3">
                <label className={`px-3 py-2 rounded ${format === "csv" ? "bg-indigo-600/40" : "bg-white/3"} cursor-pointer`}>
                  <input type="radio" name="format" checked={format === "csv"} onChange={() => setFormat("csv")} className="hidden" />
                  <div className="flex items-center gap-2 text-white"><ArrowDown className="w-4 h-4" /> CSV</div>
                </label>

                <label className={`px-3 py-2 rounded ${format === "json" ? "bg-indigo-600/40" : "bg-white/3"} cursor-pointer`}>
                  <input type="radio" name="format" checked={format === "json"} onChange={() => setFormat("json")} className="hidden" />
                  <div className="flex items-center gap-2 text-white"><FileText className="w-4 h-4" /> JSON</div>
                </label>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-300">
              <div>Total habits: <span className="text-white font-medium">{totalHabits}</span></div>
              <div className="mt-1">Check-ins in range: <span className="text-white font-medium">{totalInRange}</span></div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg text-white shadow-lg hover:scale-[1.01] transition">
            <Download className="w-4 h-4" />
            Download {format === "csv" ? "CSV" : "JSON"}
          </button>

          <button onClick={() => {
            // quick preview: open CSV in new tab for inspection (only for CSV)
            if (format === "csv") {
              const csv = buildCSV();
              const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
              window.open(url, "_blank");
              URL.revokeObjectURL(url);
            } else {
              const payload = {
                exported_at: new Date().toISOString(),
                range: { from: from || null, to: to || null },
                habits,
                checkins: filteredCheckins,
              };
              const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
              window.open(url, "_blank");
              URL.revokeObjectURL(url);
            }
          }} className="px-4 py-3 border rounded bg-white/5 text-white">Preview</button>
        </div>

        <div className="mt-6 text-sm text-gray-300">
          <strong>Notes:</strong>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Export includes habits and check-ins in the selected date range.</li>
            <li>If a habit has no check-ins in the range it will still appear (with an empty checkin_date).</li>
            <li>Your data is exported locally in the browser — nothing is sent to a server.</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
