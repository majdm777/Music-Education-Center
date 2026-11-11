import { cloneElement, type ReactElement, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';

type ControlProps = {
  id?: string;
  required?: boolean;
  'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
  'aria-describedby'?: string;
};

export interface FormFieldProps {
  /** Base id; the control, hint and error ids are derived from it. */
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  /** A single form control (Input, Textarea, Select, ...). */
  children: ReactElement<ControlProps>;
}

/**
 * Wires a label, hint and error message to one form control. The control gets
 * the id, required flag, aria-invalid and aria-describedby attributes so the
 * accessible relationship cannot drift from the visible markup.
 */
export function FormField({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const control = cloneElement(children, {
    id,
    required: required ? true : children.props.required,
    'aria-invalid': error ? true : children.props['aria-invalid'],
    'aria-describedby': describedBy,
  });

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {control}
      {hint ? (
        <p id={hintId} className="text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
