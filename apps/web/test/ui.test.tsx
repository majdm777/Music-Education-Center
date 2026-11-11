import { Users } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
  badgeVariants,
  buttonVariants,
} from '@/components/ui';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('merges conditional and conflicting classes', () => {
    expect(cn('px-2', undefined, 'px-4')).toBe('px-4');
  });
});

describe('Button', () => {
  it('renders a safe default type and the requested variant and size', () => {
    const html = renderToStaticMarkup(
      <Button variant="outline" size="sm">
        Save
      </Button>,
    );

    expect(html).toContain('type="button"');
    expect(html).toContain('border-line-strong');
    expect(html).toContain('h-8');
    expect(html).toContain('Save');
  });

  it('keeps an explicit submit type', () => {
    expect(renderToStaticMarkup(<Button type="submit">Save</Button>)).toContain('type="submit"');
  });

  it('exposes variant classes for composition', () => {
    expect(buttonVariants({ variant: 'danger', size: 'lg' })).toContain('bg-danger');
    expect(buttonVariants({ variant: 'danger', size: 'lg' })).toContain('h-11');
  });
});

describe('text controls', () => {
  it('marks invalid inputs for assistive technology and styling', () => {
    const html = renderToStaticMarkup(<Input invalid defaultValue="Layla" />);

    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('border-danger');
  });

  it('treats a string aria-invalid as an error state', () => {
    const html = renderToStaticMarkup(<Input aria-invalid="true" defaultValue="Layla" />);

    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('border-danger');
  });

  it('renders a textarea and mirrors the invalid state', () => {
    const html = renderToStaticMarkup(<Textarea invalid defaultValue="Notes" />);

    expect(html).toContain('<textarea');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('border-danger');
  });

  it('renders a select with a decorative chevron', () => {
    const html = renderToStaticMarkup(
      <Select aria-label="Format" defaultValue="group">
        <option value="group">Group</option>
      </Select>,
    );

    expect(html).toContain('<select');
    expect(html).toContain('pe-9');
    expect(html).toContain('aria-hidden="true"');
  });

  it('renders a native checkbox and a required label', () => {
    const html = renderToStaticMarkup(
      <>
        <Checkbox id="reminder" defaultChecked />
        <Label htmlFor="reminder" required>
          Remind me
        </Label>
      </>,
    );

    expect(html).toContain('type="checkbox"');
    expect(html).toContain('accent-brand');
    expect(html).toContain('for="reminder"');
    expect(html).toContain('*');
  });
});

describe('FormField', () => {
  it('wires the label, hint, error and required state to the control', () => {
    const html = renderToStaticMarkup(
      <FormField id="email" label="Email" hint="Work address" error="An email is required" required>
        <Input name="email" />
      </FormField>,
    );

    expect(html).toContain('for="email"');
    expect(html).toContain('id="email"');
    expect(html).toContain('required=""');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('aria-describedby="email-hint email-error"');
    expect(html).toContain('id="email-hint"');
    expect(html).toContain('id="email-error"');
    expect(html).toContain('role="alert"');
  });

  it('omits description attributes when there is no hint or error', () => {
    const html = renderToStaticMarkup(
      <FormField id="name" label="Name">
        <Input name="name" />
      </FormField>,
    );

    expect(html).not.toContain('aria-describedby');
    expect(html).not.toContain('aria-invalid');
  });
});

describe('surfaces', () => {
  it('renders card sections', () => {
    const html = renderToStaticMarkup(
      <Card>
        <CardHeader>
          <CardTitle>Payment summary</CardTitle>
          <CardDescription>November 2026</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );

    expect(html).toContain('shadow-card');
    expect(html).toContain('<h2');
    expect(html).toContain('Body');
    expect(html).toContain('Footer');
  });

  it('renders badge variants', () => {
    expect(renderToStaticMarkup(<Badge variant="success">Paid</Badge>)).toContain(
      'bg-success-soft',
    );
    expect(badgeVariants({ variant: 'danger' })).toContain('text-danger');
  });

  it('uses an alert role for errors and a status role otherwise', () => {
    const danger = renderToStaticMarkup(
      <Alert tone="danger" title="Payment not saved">
        Try again
      </Alert>,
    );
    const info = renderToStaticMarkup(<Alert tone="info" title="Ready" />);

    expect(danger).toContain('role="alert"');
    expect(danger).toContain('bg-danger-soft');
    expect(info).toContain('role="status"');
  });

  it('does not inject an untranslated default title', () => {
    const html = renderToStaticMarkup(<Alert tone="info">Message</Alert>);

    expect(html).toContain('Message');
    expect(html).not.toContain('Information');
  });

  it('renders a page header with actions', () => {
    const html = renderToStaticMarkup(
      <PageHeader
        eyebrow="Students"
        title="All students"
        description="Search by name or parent phone."
        actions={<Button>Add student</Button>}
      />,
    );

    expect(html).toContain('Students');
    expect(html).toContain('All students');
    expect(html).toContain('Search by name or parent phone.');
    expect(html).toContain('Add student');
  });

  it('renders an empty state with an icon and action', () => {
    const html = renderToStaticMarkup(
      <EmptyState
        icon={Users}
        title="No students yet"
        description="Add the first student."
        action={<Button>Add student</Button>}
      />,
    );

    expect(html).toContain('No students yet');
    expect(html).toContain('border-dashed');
    expect(html).toContain('<svg');
    expect(html).toContain('Add student');
  });

  it('renders both separator orientations', () => {
    expect(renderToStaticMarkup(<Separator />)).toContain('aria-orientation="horizontal"');
    expect(renderToStaticMarkup(<Separator orientation="vertical" />)).toContain(
      'aria-orientation="vertical"',
    );
  });
});

describe('Table', () => {
  it('renders table primitives with logical alignment and a caption', () => {
    const html = renderToStaticMarkup(
      <Table>
        <TableCaption>Sample data</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Layla</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );

    expect(html).toContain('overflow-x-auto');
    expect(html).toContain('text-start');
    expect(html).toContain('scope="col"');
    expect(html).toContain('Sample data');
    expect(html).toContain('Layla');
    expect(html).toContain('Total');
  });
});
