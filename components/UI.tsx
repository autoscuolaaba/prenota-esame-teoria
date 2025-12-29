import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-t-[40px] shadow-2xl px-6 pt-8 pb-32 min-h-screen ${className}`}>
    {children}
  </div>
);

export const Button: React.FC<{
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}> = ({ onClick, variant = 'primary', children, fullWidth, disabled, type = 'button', className = '' }) => {
  const baseStyles = "h-14 px-8 rounded-full font-bold text-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2";

  const variants = {
    primary: "bg-[#0B0F19] text-white hover:bg-black shadow-lg",
    secondary: "bg-gray-100 text-[#0B0F19] hover:bg-gray-200",
    ghost: "bg-transparent text-gray-500 hover:text-black"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

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
    <div className="flex items-center gap-5 mb-8 group cursor-pointer" onClick={onClick}>
      <div className="w-14 h-14 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#0B0F19] shrink-0 transition-colors group-hover:bg-gray-200">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col">
          {component ? (
            component
          ) : (
            <>
              <span className="text-2xl font-bold text-[#0B0F19] leading-tight">
                <input
                  type={type}
                  value={value}
                  onChange={onChange}
                  placeholder={placeholder}
                  readOnly={readOnly}
                  className="w-full bg-transparent outline-none placeholder-gray-300 truncate"
                />
              </span>
              <span className="text-sm text-gray-400 font-medium mt-0.5">{label}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all ${props.className}`}
  />
);

export const SelectChip: React.FC<{
  label: string;
  selected: boolean;
  onClick: () => void;
}> = ({ label, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 border ${
      selected
        ? 'bg-black text-white border-black'
        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
    }`}
  >
    {label}
  </button>
);

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    nuovo: 'bg-blue-100 text-blue-800',
    contattato: 'bg-yellow-100 text-yellow-800',
    confermato: 'bg-green-100 text-green-800',
  };

  return (
    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${styles[status] || styles.nuovo}`}>
      {status}
    </span>
  );
};
