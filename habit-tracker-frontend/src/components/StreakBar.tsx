interface StreakBarProps {
  current: number;
  max: number;
}

export default function StreakBar({ current, max }: StreakBarProps) {
  const width = Math.min((current / max) * 100, 100);

  return (
    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mt-1 mb-4">
      <div
        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
