import React from 'react';

interface SegmentedControlProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth = false,
}: SegmentedControlProps) {
  const sizeClasses = {
    sm: 'text-xs py-1.5 px-3',
    md: 'text-sm py-2 px-5',
  };

  return (
    <div className={`inline-flex gap-1 ${fullWidth ? 'w-full' : ''}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            font-semibold rounded-lg transition-all duration-200
            ${sizeClasses[size]}
            ${fullWidth ? 'flex-1' : ''}
            ${value === option.value
              ? 'bg-macos-accent text-white'
              : 'text-macos-text hover:bg-macos-bg-tertiary'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// Variant with icons
interface SegmentedControlIconProps {
  options: { value: string; icon: React.ReactNode; label?: string }[];
  value: string;
  onChange: (value: string) => void;
}

export function SegmentedControlIcon({
  options,
  value,
  onChange,
}: SegmentedControlIconProps) {
  return (
    <div className="inline-flex gap-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          title={option.label}
          className={`
            w-9 h-9 flex items-center justify-center rounded-lg
            transition-all duration-200
            ${value === option.value
              ? 'bg-macos-accent text-white'
              : 'text-macos-text-secondary hover:text-macos-text hover:bg-macos-bg-tertiary'
            }
          `}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
}
