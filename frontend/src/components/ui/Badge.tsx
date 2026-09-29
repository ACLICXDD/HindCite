import React, { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'default'
    | 'emerald'
    | 'red'
    | 'amber'
    | 'blue'
    | 'purple'
    | 'outline'
    | 'secondary';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full transition-colors whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        variant === 'default' &&
          'bg-secondary text-secondary-foreground border border-border/60',
        variant === 'emerald' &&
          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700/50',
        variant === 'red' &&
          'bg-rose-500/10 text-rose-400 border border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-700/50',
        variant === 'amber' &&
          'bg-amber-500/10 text-amber-400 border border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700/50',
        variant === 'blue' &&
          'bg-sky-500/10 text-sky-400 border border-sky-500/30 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-700/50',
        variant === 'purple' &&
          'bg-purple-500/10 text-purple-400 border border-purple-500/30 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-700/50',
        variant === 'outline' &&
          'bg-transparent text-foreground border border-border',
        variant === 'secondary' &&
          'bg-muted text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
