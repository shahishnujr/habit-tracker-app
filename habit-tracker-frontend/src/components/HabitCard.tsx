"use client";

import { motion } from "framer-motion";

interface HabitCardProps {
  name: string;
  streak: number;
  completed: boolean;
  onToggle: () => void;
}

export default function HabitCard({
  name,
  streak,
  completed,
  onToggle,
}: HabitCardProps) {
  return (
    <motion.div
      className={`flex items-center justify-between p-4 rounded-2xl shadow-md border transition-all duration-200 ${
        completed
          ? "bg-green-700/50 border-green-400 text-white"
          : "bg-gray-800/60 border-indigo-500/30 text-gray-100"
      }`}
      whileHover={{ scale: 1.03 }}
    >
      <div className="flex flex-col">
        <span className="text-lg font-semibold">{name}</span>
        <span className="text-sm text-gray-400">{streak} day streak</span>
      </div>
      <input
        type="checkbox"
        checked={completed}
        onChange={onToggle}
        className="w-5 h-5 accent-indigo-400"
      />
    </motion.div>
  );
}
