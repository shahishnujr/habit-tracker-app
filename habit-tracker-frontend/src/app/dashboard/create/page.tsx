// src/app/create/page.tsx
"use client";

import DashboardLayout from "@/app/layouts/DashboardLayout";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateHabitPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [startDate, setStartDate] = useState("");
  const [reminder, setReminder] = useState(false);
  const [description, setDescription] = useState("");
  const ACTIVE_KEY = "jtj_active_habits";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a habit name");
      return;
    }

    const newHabit = {
      id: `manual-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      frequency,
      startDate: startDate || null,
      reminder,
      difficulty: "Easy",
      source: "manual",
    };

    try {
      const raw = localStorage.getItem(ACTIVE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      arr.push(newHabit);
      localStorage.setItem(ACTIVE_KEY, JSON.stringify(arr));
      // redirect back to dashboard
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
      alert("Failed to save habit locally");
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-xl mx-auto p-8 bg-white/6 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(15,12,41,0.6)] space-y-6 mt-10">
        <h2 className="text-3xl font-semibold text-center mb-2 text-white">
          Create a New Habit
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Habit Name */}
          <div>
            <label className="block text-sm mb-1 text-gray-300">Habit Name</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              placeholder="e.g. Drink Water"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm mb-1 text-gray-300">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option className="bg-gray-800 text-white" value="daily">Daily</option>
              <option className="bg-gray-800 text-white" value="weekly">Weekly</option>
              <option className="bg-gray-800 text-white" value="custom">Custom</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm mb-1 text-gray-300">Start Date</label>
            <input
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              type="date"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          {/* Reminder */}
          <div className="flex items-center gap-2">
            <input
              checked={reminder}
              onChange={(e) => setReminder(e.target.checked)}
              type="checkbox"
              id="reminder"
              className="form-checkbox bg-white/10 border-white/20 text-indigo-400 focus:ring-indigo-500"
            />
            <label htmlFor="reminder" className="text-gray-300 text-sm">
              Enable daily reminder
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm mb-1 text-gray-300">Short description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              type="text"
              placeholder="Why this habit matters"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 hover:scale-[1.01] transition shadow-lg text-white font-semibold text-lg tracking-wide"
          >
            Create Habit
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-400">
          <Link href="/dashboard" className="text-indigo-400 hover:underline">
            ← Back to Dashboard
          </Link>
        </p>
      </div>
    </DashboardLayout>
  );
}
