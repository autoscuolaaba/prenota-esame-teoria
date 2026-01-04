import React from 'react';

interface SidebarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

interface SidebarProps {
  items: SidebarItem[];
  activeId: string;
  onSelect: (id: string) => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Sidebar({ items, activeId, onSelect, header, footer }: SidebarProps) {
  return (
    <aside className="macos-sidebar w-60 h-screen flex flex-col border-r border-macos-border">
      {/* Header */}
      {header && (
        <div className="p-4 border-b border-macos-border">
          {header}
        </div>
      )}

      {/* Navigation items */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onSelect(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                  transition-all duration-150
                  ${activeId === item.id
                    ? 'bg-macos-accent text-white'
                    : 'text-macos-text hover:bg-macos-bg-tertiary'
                  }
                `}
              >
                <span className="w-5 h-5 flex items-center justify-center">
                  {item.icon}
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`
                    px-2 py-0.5 rounded-full text-xs font-semibold
                    ${activeId === item.id
                      ? 'bg-white/20 text-white'
                      : 'bg-macos-bg-tertiary text-macos-text-secondary'
                    }
                  `}>
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {footer && (
        <div className="p-4 border-t border-macos-border">
          {footer}
        </div>
      )}
    </aside>
  );
}

// Pre-built icons for common sidebar items
export const SidebarIcons = {
  Dashboard: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  ),
  List: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
  Calendar: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Settings: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  User: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};
