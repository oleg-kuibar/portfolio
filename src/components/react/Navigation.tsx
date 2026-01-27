import { useState } from 'react';
import { Menu as MenuIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
}

interface NavigationProps {
  navItems: NavItem[];
  currentPath: string;
}

export function Navigation({ navItems, currentPath }: NavigationProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="retro-button bg-background p-2"
        aria-label="Open navigation menu"
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 z-50 min-w-[200px] rounded-lg border-2 border-border bg-background p-2 shadow-retro-lg">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  'block w-full rounded-md px-4 py-2 text-left text-sm font-medium transition-colors',
                  'hover:bg-muted focus:bg-muted focus:outline-none',
                  currentPath === item.href ||
                    (item.href !== '/' && currentPath.startsWith(item.href))
                    ? 'text-primary'
                    : 'text-foreground'
                )}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
