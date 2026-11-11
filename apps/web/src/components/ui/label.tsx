import { forwardRef, type LabelHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children?: ReactNode;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label ref={ref} className={cn('block text-sm font-medium text-ink', className)} {...props}>
      {children}
      {required ? (
        <span aria-hidden="true" className="ms-1 text-danger">
          *
        </span>
      ) : null}
    </label>
  ),
);

Label.displayName = 'Label';
