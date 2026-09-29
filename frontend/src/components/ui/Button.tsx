import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]',
          // Variants
          variant === 'primary' &&
            'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-950/20 active:bg-emerald-700',
          variant === 'secondary' &&
            'bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border/70',
          variant === 'outline' &&
            'bg-transparent hover:bg-secondary/50 text-foreground border border-border hover:border-border/90',
          variant === 'ghost' &&
            'bg-transparent hover:bg-secondary/60 text-muted-foreground hover:text-foreground',
          variant === 'danger' &&
            'bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-950/20',
          // Sizes
          size === 'sm' && 'h-8 px-3 text-xs gap-1.5',
          size === 'md' && 'h-9 px-4 text-sm gap-2',
          size === 'lg' && 'h-11 px-5 text-base gap-2.5',
          size === 'icon' && 'h-9 w-9 p-0',
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
