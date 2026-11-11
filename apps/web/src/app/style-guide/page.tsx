import { notFound } from 'next/navigation';
import { CalendarDays, Download, Plus, Search, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  EmptyState,
  FormField,
  Input,
  Label,
  PageHeader,
  Select,
  Separator,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from '@/components/ui';
import { cn } from '@/lib/utils';

// Keep the production 404 check at request time instead of failing static
// generation during the build.
export const dynamic = 'force-dynamic';

const colors = [
  { name: 'canvas', value: '#f8fafc', className: 'bg-canvas' },
  { name: 'surface', value: '#ffffff', className: 'bg-surface' },
  { name: 'surface-muted', value: '#f1f5f9', className: 'bg-surface-muted' },
  { name: 'line', value: '#e2e8f0', className: 'bg-line' },
  { name: 'line-strong', value: '#cbd5e1', className: 'bg-line-strong' },
  { name: 'ink', value: '#0f172a', className: 'bg-ink' },
  { name: 'ink-muted', value: '#475569', className: 'bg-ink-muted' },
  { name: 'brand', value: '#0f766e', className: 'bg-brand' },
  { name: 'brand-soft', value: '#ccfbf1', className: 'bg-brand-soft' },
  { name: 'success', value: '#15803d', className: 'bg-success' },
  { name: 'warning', value: '#b45309', className: 'bg-warning' },
  { name: 'danger', value: '#b91c1c', className: 'bg-danger' },
];

const students = [
  {
    name: 'Layla Haddad',
    enrollment: 'Piano · Group',
    balance: 'USD 24.00',
    status: 'Paid',
    tone: 'success',
  },
  {
    name: 'Omar Nassar',
    enrollment: 'Math · Grade 9',
    balance: 'USD 0.00',
    status: 'Overdue',
    tone: 'danger',
  },
  {
    name: 'Rita Khoury',
    enrollment: 'Agenda support',
    balance: 'USD 12.50',
    status: 'Partial',
    tone: 'warning',
  },
] as const;

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-title`} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id={`${id}-title`} className="text-lg font-semibold text-ink">
          {title}
        </h2>
        {description ? <p className="text-sm text-ink-muted">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, value, className }: { name: string; value: string; className: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3">
      <span className={cn('size-10 shrink-0 rounded-md border border-line', className)} />
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-medium text-ink">{name}</span>
        <span className="font-mono text-xs text-ink-muted">{value}</span>
      </span>
    </div>
  );
}

// Fail closed: local development always has the catalogue, and any other
// environment must opt in explicitly (for example a preview deployment that
// design review needs). A production build never serves it by accident.
const styleGuideEnabled =
  process.env.NODE_ENV === 'development' || process.env.STYLE_GUIDE_ENABLED === 'true';

export default function StyleGuidePage() {
  if (!styleGuideEnabled) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Development only"
        title="Base UI kit"
        description="Placeholder brand tokens, Arabic-first typography, form patterns and RTL-ready primitives for the center management system."
        actions={
          <>
            <Badge variant="brand">Tailwind v4</Badge>
            <Badge variant="outline">IBM Plex Sans Arabic</Badge>
          </>
        }
      />

      <Alert tone="warning" title="This route is not shipped">
        The page is available in local development only. Any other environment returns a 404 unless{' '}
        <code className="font-mono text-xs">STYLE_GUIDE_ENABLED=true</code> is set explicitly. Keep
        examples here current so screens assembled from the kit stay consistent.
      </Alert>

      <Section
        id="colours"
        title="Colours"
        description="Light-only semantic tokens. Swap the placeholder brand values when the client supplies its palette."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {colors.map((color) => (
            <Swatch key={color.name} {...color} />
          ))}
        </div>
      </Section>

      <Section
        id="type"
        title="Typography"
        description="IBM Plex Sans Arabic covers Latin and Arabic. Arabic samples render right-to-left without changing the component code."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-5">
            <p className="text-3xl font-semibold tracking-tight text-ink">Monthly charges</p>
            <p className="text-xl font-medium text-ink">Review before you confirm</p>
            <p className="text-base text-ink">
              Payments, refunds and balances stay in one ledger so the owner can trust the profit
              figure.
            </p>
            <p className="text-sm text-ink-muted">
              Hints, descriptions and secondary table cells use the muted ink token.
            </p>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Labels and table headings
            </p>
            <p className="text-sm">
              <span className="font-normal">Regular 400</span> ·{' '}
              <span className="font-medium">Medium 500</span> ·{' '}
              <span className="font-semibold">Semibold 600</span> ·{' '}
              <span className="font-bold">Bold 700</span>
            </p>
          </div>

          <div
            dir="rtl"
            lang="ar"
            className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-5 text-start"
          >
            <p className="text-3xl font-semibold tracking-tight text-ink">مركز الموسيقى والتعليم</p>
            <p className="text-xl font-medium text-ink">مراجعة الرسوم الشهرية</p>
            <p className="text-base text-ink">
              تبقى المدفوعات والاستردادات والأرصدة في سجل واحد حتى يثق المالك في رقم الربح.
            </p>
            <p className="text-sm text-ink-muted">
              التلميحات والأوصاف وخلايا الجداول الثانوية تستخدم لون النص الخافت.
            </p>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              التسميات وعناوين الجداول
            </p>
          </div>
        </div>
      </Section>

      <Section
        id="buttons"
        title="Buttons"
        description="Five tones, four sizes, disabled states and icon pairing. Icons follow the text direction through flex gap."
      >
        <div className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-5">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button disabled>Disabled</Button>
          </div>
          <Separator />
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Add">
              <Plus aria-hidden="true" className="size-4" />
            </Button>
            <Button variant="outline">
              <Download aria-hidden="true" className="size-4" />
              Export
            </Button>
            <Button variant="secondary">
              <Search aria-hidden="true" className="size-4" />
              Search
            </Button>
          </div>
        </div>
      </Section>

      <Section id="badges" title="Badges" description="Compact status labels for tables and cards.">
        <div className="flex flex-wrap gap-2 rounded-lg border border-line bg-surface p-5">
          <Badge>Neutral</Badge>
          <Badge variant="brand">Brand</Badge>
          <Badge variant="success">Paid</Badge>
          <Badge variant="warning">Partial</Badge>
          <Badge variant="danger">Overdue</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </Section>

      <Section
        id="alerts"
        title="Alerts"
        description="Inline feedback with a tone icon and a live-region role."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Alert tone="info" title="New month ready">
            Generate the month&apos;s charges, review the list, then confirm.
          </Alert>
          <Alert tone="success" title="Payment recorded">
            The balance and ledger now reflect the USD 24.00 payment.
          </Alert>
          <Alert tone="warning" title="Sessions running low">
            Layla has two music sessions left this month.
          </Alert>
          <Alert tone="danger" title="Payment not saved">
            The amount must be greater than zero and the date is required.
          </Alert>
        </div>
      </Section>

      <Section
        id="forms"
        title="Form patterns"
        description="Labels, hints and errors are wired to the control id and aria-describedby attributes automatically."
      >
        <div className="grid gap-6 rounded-lg border border-line bg-surface p-5 md:grid-cols-2">
          <FormField
            id="student-name"
            label="Student name"
            hint="Use the name the parent recognises on receipts."
            required
          >
            <Input name="studentName" placeholder="e.g. Layla Haddad" autoComplete="name" />
          </FormField>

          <FormField
            id="parent-phone"
            label="Parent phone"
            error="Enter a phone number in international format."
            required
          >
            <Input name="parentPhone" defaultValue="03 123" inputMode="tel" />
          </FormField>

          <FormField id="lesson-format" label="Lesson format" required>
            <Select name="lessonFormat" defaultValue="group">
              <option value="group">Group</option>
              <option value="one-on-one">One-on-one</option>
            </Select>
          </FormField>

          <FormField id="start-date" label="Start date" hint="The first month is billed in full.">
            <Input type="date" name="startDate" defaultValue="2026-11-09" />
          </FormField>

          <FormField
            id="notes"
            label="Notes"
            hint="Optional. Visible on the student profile."
            className="md:col-span-2"
          >
            <Textarea
              name="notes"
              placeholder="Allergies, scheduling preferences, parent requests…"
            />
          </FormField>

          <div className="flex items-start gap-2 md:col-span-2">
            <Checkbox id="reminder" name="reminder" defaultChecked />
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="reminder">Show a reminder when sessions are low</Label>
              <p className="text-xs text-ink-muted">
                The checkbox keeps its native behaviour and keyboard support.
              </p>
            </div>
          </div>

          <FormField id="disabled-field" label="Closed field" className="md:col-span-2">
            <Input disabled defaultValue="This value cannot be edited" />
          </FormField>
        </div>
      </Section>

      <Section
        id="cards"
        title="Cards and empty states"
        description="Surface containers for details, forms and the first-run experience."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment summary</CardTitle>
              <CardDescription>November 2026 · Piano · Group</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-ink-muted">Monthly price</span>
                <span className="font-mono tabular-nums text-ink">USD 24.00</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-ink-muted">Paid</span>
                <span className="font-mono tabular-nums text-success">USD 24.00</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-3 text-sm font-semibold">
                <span>Balance</span>
                <span className="font-mono tabular-nums">USD 0.00</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="sm">Record payment</Button>
              <Button size="sm" variant="outline">
                Open ledger
              </Button>
            </CardFooter>
          </Card>

          <EmptyState
            icon={Users}
            title="No students yet"
            description="Add the first student to start an enrollment and generate monthly charges."
            action={
              <Button>
                <Plus aria-hidden="true" className="size-4" />
                Add student
              </Button>
            }
          />
        </div>
      </Section>

      <Section
        id="tables"
        title="Tables"
        description="Horizontal scrolling stays inside the card on small screens; alignment uses logical start and end."
      >
        <Table scrollLabel="Student balances">
          <TableCaption>Sample data only. No database records are shown.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Enrollment</TableHead>
              <TableHead className="text-end">Balance</TableHead>
              <TableHead className="text-end">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.name}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell className="text-ink-muted">{student.enrollment}</TableCell>
                <TableCell className="text-end font-mono tabular-nums">{student.balance}</TableCell>
                <TableCell className="text-end">
                  <Badge variant={student.tone}>{student.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      <Section
        id="rtl"
        title="RTL sample"
        description="The same primitives inside dir=rtl. The select chevron, icon order and logical spacing mirror automatically."
      >
        <div
          dir="rtl"
          lang="ar"
          className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-5"
        >
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">مثال</p>
            <h2 className="text-xl font-semibold text-ink">تسجيل دفعة جديدة</h2>
            <p className="text-sm text-ink-muted">
              يظهر اتجاه النص والحقول والأيقونات من اليمين إلى اليسار دون تغيير الشيفرة.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="rtl-amount" label="المبلغ" hint="بالدولار الأمريكي" required>
              <Input name="amount" inputMode="decimal" placeholder="0.00" />
            </FormField>
            <FormField id="rtl-method" label="طريقة الدفع" required>
              <Select name="method" defaultValue="cash">
                <option value="cash">نقداً</option>
                <option value="transfer">حوالة مصرفية</option>
                <option value="card">بطاقة</option>
              </Select>
            </FormField>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button>
              <Plus aria-hidden="true" className="size-4" />
              حفظ الدفعة
            </Button>
            <Button variant="outline">
              <CalendarDays aria-hidden="true" className="size-4" />
              اختيار التاريخ
            </Button>
          </div>
        </div>
      </Section>
    </main>
  );
}
