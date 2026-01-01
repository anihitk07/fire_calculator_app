import { Info } from 'lucide-react';
import { useState } from 'react';

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  tooltip: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}

export default function InputField({
  label,
  value,
  onChange,
  tooltip,
  prefix,
  suffix,
  min = 0,
  max,
  step = 1,
}: InputFieldProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Only update parent if it's a valid number
    const numValue = Number(newValue);
    if (newValue !== '' && !isNaN(numValue)) {
      onChange(numValue);
    }
  };

  const handleBlur = () => {
    const numValue = Number(inputValue);
    if (inputValue === '' || isNaN(numValue)) {
      // Reset to current value if invalid
      setInputValue(value.toString());
    } else {
      // Clamp to min/max on blur
      let clampedValue = numValue;
      if (min !== undefined && numValue < min) clampedValue = min;
      if (max !== undefined && numValue > max) clampedValue = max;
      
      if (clampedValue !== numValue) {
        onChange(clampedValue);
        setInputValue(clampedValue.toString());
      }
    }
  };

  // Sync with external value changes
  if (value.toString() !== inputValue && document.activeElement?.id !== label) {
    setInputValue(value.toString());
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            className="text-gray-500 hover:text-gray-400 transition-colors"
            aria-label={`Info about ${label}`}
          >
            <Info className="w-4 h-4" />
          </button>
          {showTooltip && (
            <div className="absolute right-0 bottom-full mb-2 w-64 p-2 bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg shadow-lg z-10">
              {tooltip}
              <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-800" />
            </div>
          )}
        </div>
      </div>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            {prefix}
          </span>
        )}
        <input
          id={label}
          type="number"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          step={step}
          className={`input-field ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-12' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
