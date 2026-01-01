interface ResultCardProps {
  title: string;
  value: string | number;
  description: string;
  variant?: 'primary' | 'success' | 'warning';
}

export default function ResultCard({
  title,
  value,
  description,
  variant = 'primary',
}: ResultCardProps) {
  const variantStyles = {
    primary: 'border-orange-500/30 bg-orange-500/10',
    success: 'border-green-500/30 bg-green-500/10',
    warning: 'border-amber-500/30 bg-amber-500/10',
  };

  const valueStyles = {
    primary: 'text-orange-500',
    success: 'text-green-500',
    warning: 'text-amber-500',
  };

  return (
    <div className={`bg-[#1a1f2e] rounded-xl border ${variantStyles[variant]} p-6`}>
      <h3 className="text-sm font-medium text-gray-400 mb-1">
        {title}
      </h3>
      <div className={`text-3xl font-bold ${valueStyles[variant]} mb-1`}>
        {value}
      </div>
      <p className="text-xs text-gray-500">
        {description}
      </p>
    </div>
  );
}
