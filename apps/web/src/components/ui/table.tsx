import type {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /**
   * Accessible name for the scroll region, for example "November payments".
   * Required: the container is a focusable `region`, and a region without a
   * name is an anonymous tab stop that screen-reader users cannot identify.
   */
  scrollLabel: string;
}

export function Table({ className, scrollLabel, ...props }: TableProps) {
  return (
    // Focusable so a keyboard user can scroll a table wider than the viewport;
    // the required label keeps that tab stop identifiable.
    <div
      role="region"
      aria-label={scrollLabel}
      // WCAG 2.1.1 requires a scrollable region to be keyboard focusable. The
      // tab stop is deliberate: Sonar rule S6845 is excluded for this file in
      // sonar-project.properties because it only sees a non-interactive
      // element and cannot check scroll behaviour.
      tabIndex={0}
      className="w-full overflow-x-auto rounded-lg border border-line"
    >
      <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-surface-muted', className)} {...props} />;
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

export function TableFooter({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      className={cn('border-t border-line bg-surface-muted font-medium text-ink', className)}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn('border-b border-line transition-colors hover:bg-surface-muted/60', className)}
      {...props}
    />
  );
}

export function TableHead({
  className,
  scope = 'col',
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope={scope}
      className={cn(
        'px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-ink-muted',
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3 align-middle text-ink', className)} {...props} />;
}

export function TableCaption({ className, ...props }: HTMLAttributes<HTMLTableCaptionElement>) {
  return <caption className={cn('p-4 text-sm text-ink-muted', className)} {...props} />;
}
