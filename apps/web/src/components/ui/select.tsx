import { ChevronDown } from 'lucide-react';
import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Mark the control invalid and apply the error treatment. */
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...props }, ref) => (
    <div className="relative w-full">
      <select
        ref={ref}
        {...props}
        aria-invalid={invalid || props['aria-invalid'] || undefined}
        className={cn(
          'flex h-10 w-full appearance-none rounded-md border border-line-strong bg-surface ps-3 pe-9 text-sm text-ink shadow-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
          'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70',
          (invalid || props['aria-invalid'] === true || props['aria-invalid'] === 'true') &&
            'border-danger focus-visible:ring-danger',
          className,
        )}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
      />
    </div>
  ),
);

Select.displayName = 'Select';
