import { AlertCircle, AlertTriangle, CheckCircle2, Info, type LucideIcon } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

const toneStyles: Record<
  AlertTone,
  { container: string; icon: LucideIcon; accent: string; label: string }
> = {
  info: {
    container: 'border-info/30 bg-info-soft',
    icon: Info,
    accent: 'text-info',
    label: 'Information',
  },
  success: {
    container: 'border-success/30 bg-success-soft',
    icon: CheckCircle2,
    accent: 'text-success',
    label: 'Success',
  },
  warning: {
    container: 'border-warning/30 bg-warning-soft',
    icon: AlertTriangle,
    accent: 'text-warning',
    label: 'Warning',
  },
  danger: {
    container: 'border-danger/30 bg-danger-soft',
    icon: AlertCircle,
    accent: 'text-danger',
    label: 'Error',
  },
};

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: AlertTone;
  title?: ReactNode;
}

export function Alert({ className, tone = 'info', title, role, children, ...props }: AlertProps) {
  const style = toneStyles[tone];
  const Icon = style.icon;

  return (
    <div
      role={role ?? (tone === 'danger' ? 'alert' : 'status')}
      className={cn('flex gap-3 rounded-md border p-4 text-sm', style.container, className)}
      {...props}
    >
      <Icon aria-hidden="true" className={cn('mt-0.5 size-4 shrink-0', style.accent)} />
      <div className="flex min-w-0 flex-col gap-1">
        <p className={cn('font-semibold', style.accent)}>{title ?? style.label}</p>
        {children ? <div className="text-ink">{children}</div> : null}
      </div>
    </div>
  );
}
