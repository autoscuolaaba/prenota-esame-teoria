import React from 'react';

// Card component - macOS style with subtle border and shadow
export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'flat';
}> = ({ children, className = '', variant = 'default' }) => {
  const variants = {
    default: 'bg-macos-bg border border-macos-border shadow-macos-md',
    elevated: 'bg-macos-bg-elevated border border-macos-border shadow-macos-lg',
    flat: 'bg-macos-bg-secondary',
  };

  return (
    <div className={`rounded-xl ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

// Button component - macOS style with accent color
export const Button: React.FC<{
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  children: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ onClick, variant = 'primary', children, fullWidth, disabled, type = 'button', className = '', size = 'md' }) => {
  const baseStyles = "font-semibold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 rounded-lg";

  const sizeStyles = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  const variants = {
    primary: 'bg-macos-accent text-white hover:opacity-90 shadow-macos-sm',
    secondary: 'bg-macos-bg-tertiary text-macos-text hover:bg-macos-border-medium',
    ghost: 'bg-transparent text-macos-text-secondary hover:text-macos-text hover:bg-macos-bg-tertiary',
    danger: 'bg-macos-danger text-white hover:opacity-90 shadow-macos-sm',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

// InputRow - macOS style grouped input
export const InputRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
  onClick?: () => void;
  component?: React.ReactNode;
}> = ({ icon, label, value, onChange, placeholder, type = "text", readOnly, onClick, component }) => {
  return (
    <div
      className="flex items-center gap-4 py-3 px-4 group cursor-pointer hover:bg-macos-bg-tertiary rounded-lg transition-colors -mx-4"
      onClick={onClick}
    >
      <div className="w-10 h-10 rounded-lg bg-macos-bg-tertiary flex items-center justify-center text-macos-text-secondary shrink-0 transition-colors group-hover:bg-macos-border-medium">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        {component ? (
          component
        ) : (
          <div className="flex flex-col">
            <span className="text-xs font-medium text-macos-text-secondary mb-0.5">{label}</span>
            <input
              type={type}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              readOnly={readOnly}
              className="w-full bg-transparent text-base font-medium text-macos-text outline-none placeholder-macos-text-tertiary truncate"
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Input - macOS style standalone input
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, ...props }) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-xs font-medium text-macos-text-secondary">{label}</label>
    )}
    <input
      {...props}
      className={`
        w-full bg-macos-bg border border-macos-border rounded-lg px-3 py-2
        text-macos-text placeholder-macos-text-tertiary
        outline-none transition-all duration-200
        focus:border-macos-accent focus:ring-1 focus:ring-macos-accent/30
        shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]
        ${props.className || ''}
      `}
    />
  </div>
);

// Textarea - macOS style
export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, ...props }) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-xs font-medium text-macos-text-secondary">{label}</label>
    )}
    <textarea
      {...props}
      className={`
        w-full bg-macos-bg border border-macos-border rounded-lg px-3 py-2
        text-macos-text placeholder-macos-text-tertiary
        outline-none transition-all duration-200
        focus:border-macos-accent focus:ring-1 focus:ring-macos-accent/30
        shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]
        resize-none
        ${props.className || ''}
      `}
    />
  </div>
);

// SelectChip - macOS style pill selector
export const SelectChip: React.FC<{
  label: string;
  selected: boolean;
  onClick: () => void;
}> = ({ label, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      px-4 py-2 rounded-full text-sm font-medium
      transition-all duration-200 border
      ${selected
        ? 'bg-macos-accent text-white border-macos-accent'
        : 'bg-macos-bg text-macos-text-secondary border-macos-border hover:border-macos-border-medium'
      }
    `}
  >
    {label}
  </button>
);

// StatusBadge - macOS style with dot indicator
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, { dot: string; text: string; bg: string }> = {
    nuovo: { dot: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
    contattato: { dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
    confermato: { dot: 'bg-green-500', text: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10' },
  };

  const style = colors[status] || colors.nuovo;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
};

// Divider component
export const Divider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`h-px bg-macos-divider ${className}`} />
);

// Section header for grouped content
export const SectionHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-xs font-semibold uppercase tracking-wider text-macos-text-secondary mb-3 ${className}`}>
    {children}
  </h3>
);

// GroupedList container for settings-like UI
export const GroupedList: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-macos-bg-secondary rounded-xl divide-y divide-macos-divider overflow-hidden ${className}`}>
    {children}
  </div>
);

// GroupedListItem for use inside GroupedList
export const GroupedListItem: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className = '' }) => (
  <div
    className={`px-4 py-3 flex items-center ${onClick ? 'cursor-pointer hover:bg-macos-bg-tertiary' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

// Icon button for toolbar actions
export const IconButton: React.FC<{
  onClick?: () => void;
  children: React.ReactNode;
  title?: string;
  variant?: 'default' | 'danger';
  className?: string;
}> = ({ onClick, children, title, variant = 'default', className = '' }) => {
  const variants = {
    default: 'text-macos-text-secondary hover:text-macos-text hover:bg-macos-bg-tertiary',
    danger: 'text-macos-text-secondary hover:text-macos-danger hover:bg-macos-danger/10',
  };

  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};
