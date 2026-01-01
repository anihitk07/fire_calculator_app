interface ProgressBarProps {
  current: number;
  target: number;
  label?: string;
}

export default function ProgressBar({ current, target, label = "Progress to FIRE" }: ProgressBarProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const isComplete = percentage >= 100;

  return (
    <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className={`text-sm font-semibold ${isComplete ? 'text-green-500' : 'text-orange-500'}`}>
          {percentage.toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isComplete ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-orange-500 to-orange-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
        <span>${current.toLocaleString()}</span>
        <span>${target.toLocaleString()}</span>
      </div>
    </div>
  );
}
