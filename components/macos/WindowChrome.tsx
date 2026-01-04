import React, { useState } from 'react';

// Traffic lights component with hover state
function TrafficLights() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex gap-2 mr-4 py-2 -my-2 px-1 -mx-1"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="w-3 h-3 rounded-full bg-traffic-red flex items-center justify-center">
        {hovered && (
          <svg className="w-[6px] h-[6px]" viewBox="0 0 8 8" fill="none" stroke="#4a0002" strokeWidth="1.5" strokeLinecap="round">
            <path d="M1 1l6 6M7 1L1 7" />
          </svg>
        )}
      </div>
      <div className="w-3 h-3 rounded-full bg-traffic-yellow flex items-center justify-center">
        {hovered && (
          <svg className="w-[6px] h-[6px]" viewBox="0 0 8 8" fill="none" stroke="#995700" strokeWidth="1.5" strokeLinecap="round">
            <path d="M1 4h6" />
          </svg>
        )}
      </div>
      <div className="w-3 h-3 rounded-full bg-traffic-green flex items-center justify-center">
        {hovered && (
          <svg className="w-[6px] h-[6px]" viewBox="0 0 8 8" fill="none" stroke="#006500" strokeWidth="1.2" strokeLinecap="round">
            <path d="M1 1l2.5 2.5M1 1h2M1 1v2M7 7L4.5 4.5M7 7H5M7 7V5" />
          </svg>
        )}
      </div>
    </div>
  );
}

interface WindowChromeProps {
  title?: string;
  children: React.ReactNode;
  toolbar?: React.ReactNode;
  className?: string;
  showTrafficLights?: boolean;
}

export function WindowChrome({
  title,
  children,
  toolbar,
  className = '',
  showTrafficLights = true,
}: WindowChromeProps) {
  return (
    <div className={`macos-window ${className}`}>
      {/* Title bar */}
      <div className="macos-titlebar h-12 flex items-center px-4 select-none">
        {/* Traffic lights */}
        {showTrafficLights && <TrafficLights />}

        {/* Title */}
        {title && (
          <span className="text-sm font-medium text-macos-text-secondary flex-1 text-center -ml-16">
            {title}
          </span>
        )}

        {/* Toolbar actions */}
        {toolbar && <div className="ml-auto flex items-center gap-2">{toolbar}</div>}
      </div>

      {/* Content */}
      <div className="bg-macos-bg">{children}</div>
    </div>
  );
}

// Theme toggle button component for toolbar
export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>('light');

  React.useEffect(() => {
    setMounted(true);
    // Check current theme
    const isDark = document.documentElement.classList.contains('dark');
    setResolvedTheme(isDark ? 'dark' : 'light');

    // Listen for changes
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setResolvedTheme(isDark ? 'dark' : 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
  };

  if (!mounted) return <div className="w-8 h-8" />;

  return (
    <button
      onClick={toggleTheme}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-macos-text-secondary hover:bg-macos-bg-tertiary transition-colors"
      title={resolvedTheme === 'dark' ? 'Passa a Light Mode' : 'Passa a Dark Mode'}
    >
      {resolvedTheme === 'dark' ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}
