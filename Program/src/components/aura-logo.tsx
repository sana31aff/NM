import { Zap } from 'lucide-react'; // Removed Menu, kept Zap
// import type { LucideProps } from 'lucide-react'; // Removed unused import
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface AuraLogoProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  iconClassName?: string;
  textAlwaysVisible?: boolean;
}

export function AuraLogo({ className, iconClassName, textAlwaysVisible = false, ...props }: AuraLogoProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className={cn(
        "flex items-center gap-1 text-primary p-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md transition-colors", // Adjusted gap from gap-2 to gap-1
        className
      )}
      aria-label="Toggle sidebar"
      {...props}
    >
      {/* Menu icon removed */}
      <Zap className={cn("text-primary", iconClassName)} /> 
      {/* "Aura" text conditionally displayed */}
      {textAlwaysVisible ? (
        <span className="text-xl font-semibold text-foreground">Aura</span>
      ) : (
        <span className={cn(
          "text-xl font-semibold text-foreground",
          "group-data-[state=collapsed]:hidden" 
        )}>Aura</span>
      )}
    </button>
  );
}
