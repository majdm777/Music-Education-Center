import { forwardRef, type InputHTMLAttributes } from 'react';
import { isControlInvalid } from '@/lib/form';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Mark the control invalid and apply the error treatment. */
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      {...props}
      aria-invalid={invalid || props['aria-invalid'] || undefined}
      className={cn(
        'flex h-10 w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink shadow-sm transition-colors',
        'placeholder:text-ink-muted/70',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70',
        isControlInvalid(invalid, props['aria-invalid']) &&
          'border-danger focus-visible:ring-danger',
        className,
      )}
    />
  ),
);

Input.displayName = 'Input';
