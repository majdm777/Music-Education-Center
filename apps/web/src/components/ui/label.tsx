import { forwardRef, type LabelHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * Shows a decorative required marker. The asterisk is hidden from assistive
   * technology, so the labelled control must also carry `required` or
   * `aria-required`; `FormField` wires that automatically.
   */
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
