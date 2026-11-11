import {
  ArrowRight,
  Atom,
  BookOpenText,
  Calculator,
  Clock,
  FlaskConical,
  GraduationCap,
  Guitar,
  Languages,
  Music2,
  Music4,
  NotebookPen,
  Piano,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from '@/components/ui';
import { buttonVariants } from '@/components/ui/button';

type Program = {
  name: string;
  description: string;
  icon: LucideIcon;
};

const musicPrograms: Program[] = [
  {
    name: 'Piano',
    description: 'Technique, note reading and pieces from the first lesson.',
    icon: Piano,
  },
  {
    name: 'Guitar',
    description: 'Chords, rhythm and songs, with space to choose what you play.',
    icon: Guitar,
  },
  {
    name: 'Violin',
    description: 'Bow control, pitch and ensemble habits from the start.',
    icon: Music4,
  },
];

const academicPrograms: Program[] = [
  {
    name: 'Math',
    description: 'Number sense, algebra and problem solving across every grade.',
    icon: Calculator,
  },
  {
    name: 'Arabic',
    description: 'Reading, writing and grammar support that follows the school year.',
    icon: Languages,
  },
  {
    name: 'English',
    description: 'Reading, writing and conversation practice.',
    icon: BookOpenText,
  },
  {
    name: 'Physics',
    description: 'Mechanics, electricity and exam-style practice.',
    icon: Atom,
  },
  {
    name: 'Chemistry',
    description: 'Core concepts, equations and lab-style reasoning.',
    icon: FlaskConical,
  },
  {
    name: 'Agenda',
    description: 'Study planning and weekly follow-up for the school week.',
    icon: NotebookPen,
  },
];

const steps = [
  {
    title: 'Choose a program',
    description: 'Browse the music and academic programs and find the subject that fits.',
  },
  {
    title: 'Visit the center',
    description: 'Meet a teacher, see the rooms and ask about group or one-to-one lessons.',
  },
  {
    title: 'Enroll and begin',
    description: 'Agree on a weekly schedule and settle into lessons.',
  },
];

const glanceItems = [
  {
    label: 'Music',
    value: 'Piano, guitar and violin',
    icon: Music2,
  },
  {
    label: 'Academics',
    value: 'Math, languages, sciences and study support',
    icon: GraduationCap,
  },
  {
    label: 'Formats',
    value: 'Group and one-to-one lessons',
    icon: Users,
  },
  {
    label: 'Open',
    value: 'Monday to Saturday, 9:00 – 21:00',
    icon: Clock,
  },
];

function ProgramCard({ program }: { program: Program }) {
  const Icon = program.icon;

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-5 shadow-sm transition-shadow hover:shadow-card">
      <span className="grid size-10 place-items-center rounded-lg bg-surface-muted text-brand">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <h4 className="text-base font-semibold text-ink">{program.name}</h4>
      <p className="text-sm text-ink-muted">{program.description}</p>
    </article>
  );
}

export default function HomePage() {
  return (
    <div id="top" className="min-h-screen">
      <a
        href="#main"
        className="sr-only rounded-md bg-surface px-4 py-2 text-sm font-semibold text-brand focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:ring-2 focus:ring-brand"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <a href="#top" className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-white shadow-sm">
              <Music2 aria-hidden="true" className="size-5" />
            </span>
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-semibold text-ink">
                Music &amp; Education Center
              </span>
              <span className="hidden truncate text-xs text-ink-muted sm:block">
                Music and academics, together
              </span>
            </span>
          </a>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-6 text-sm font-medium text-ink-muted md:flex"
          >
            <a className="transition-colors hover:text-ink" href="#programs">
              Programs
            </a>
            <a className="transition-colors hover:text-ink" href="#how-it-works">
              How it works
            </a>
            <a className="transition-colors hover:text-ink" href="#visit">
              Visit
            </a>
          </nav>

          <a href="#visit" className={buttonVariants({ size: 'sm' })}>
            Plan a visit
          </a>
        </div>
      </header>

      <main
        id="main"
        className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
      >
        <section
          aria-labelledby="hero-title"
          className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]"
        >
          <div className="flex flex-col items-start gap-6">
            <Badge variant="brand">
              <Sparkles aria-hidden="true" className="size-3.5" />
              Music and academics, one schedule
            </Badge>

            <div className="flex flex-col gap-4">
              <h1
                id="hero-title"
                className="max-w-2xl text-balance text-4xl font-semibold tracking-tight text-ink sm:text-5xl"
              >
                A place to learn music <span className="text-brand">and keep up with school.</span>
              </h1>
              <p className="max-w-xl text-pretty text-base text-ink-muted sm:text-lg">
                Piano, guitar and violin lessons sit alongside academic support in math, languages
                and the sciences. One center, one schedule, and a team that knows each student.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a href="#programs" className={buttonVariants({ size: 'lg' })}>
                Explore programs
                <ArrowRight aria-hidden="true" className="size-4" />
              </a>
              <a href="#visit" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                Plan a visit
              </a>
            </div>

            <p className="text-sm text-ink-muted">
              Group and one-to-one lessons. Academic support from kindergarten to Grade 12.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>At a glance</CardTitle>
              <CardDescription>What the center offers</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-4">
                {glanceItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.label} className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-ink">
                        <Icon aria-hidden="true" className="size-4" />
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <dt className="text-sm font-semibold text-ink">{item.label}</dt>
                        <dd className="text-sm text-ink-muted">{item.value}</dd>
                      </div>
                    </div>
                  );
                })}
              </dl>
            </CardContent>
          </Card>
        </section>

        <section
          id="programs"
          aria-labelledby="programs-title"
          className="scroll-mt-24 flex flex-col gap-10"
        >
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">Programs</p>
            <h2
              id="programs-title"
              className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
            >
              Two tracks, one center
            </h2>
            <p className="max-w-2xl text-ink-muted">
              Choose an instrument or an academic subject. Music runs in group and one-to-one
              formats, and academic support follows the school year.
            </p>
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Music2 aria-hidden="true" className="size-5 text-brand" />
                <h3 className="text-lg font-semibold text-ink">Music</h3>
                <Badge variant="success">Instruments</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {musicPrograms.map((program) => (
                  <ProgramCard key={program.name} program={program} />
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <GraduationCap aria-hidden="true" className="size-5 text-brand" />
                <h3 className="text-lg font-semibold text-ink">Academics</h3>
                <Badge variant="brand">School support</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {academicPrograms.map((program) => (
                  <ProgramCard key={program.name} program={program} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          aria-labelledby="how-it-works-title"
          className="scroll-mt-24 flex flex-col gap-8"
        >
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">How it works</p>
            <h2
              id="how-it-works-title"
              className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
            >
              From first visit to first lesson
            </h2>
            <p className="max-w-2xl text-ink-muted">
              A simple start, whether you already know the instrument you want or you are still
              deciding.
            </p>
          </div>

          <ol className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="flex">
                <div className="flex w-full flex-col gap-3 rounded-xl border border-line bg-surface p-5">
                  <span className="grid size-9 place-items-center rounded-full bg-brand text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <h3 className="text-base font-semibold text-ink">{step.title}</h3>
                  <p className="text-sm text-ink-muted">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="visit" aria-labelledby="visit-title" className="scroll-mt-24">
          <Card className="overflow-hidden">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
              <div className="flex flex-col gap-5 p-6 sm:p-8">
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand">Visit</p>
                  <h2
                    id="visit-title"
                    className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
                  >
                    Come and see the center
                  </h2>
                  <p className="max-w-xl text-ink-muted">
                    Drop in during opening hours to see the rooms and ask about lessons. We will
                    help you choose a program and explain how the weekly schedule works.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="success">
                    <Clock aria-hidden="true" className="size-3.5" />
                    Open six days a week
                  </Badge>
                  <Badge variant="outline">Group and one-to-one</Badge>
                </div>

                <p className="text-sm text-ink-muted">
                  Online enrollment and contact details will be published here before launch.
                </p>
              </div>

              <div className="border-t border-line bg-surface-muted p-6 sm:p-8 lg:border-s lg:border-t-0">
                <h3 className="text-base font-semibold text-ink">Opening hours</h3>
                <dl className="mt-4 flex flex-col gap-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <dt className="text-ink-muted">Monday to Saturday</dt>
                    <dd className="font-mono font-medium tabular-nums text-ink">9:00 – 21:00</dd>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <dt className="text-ink-muted">Sunday</dt>
                    <dd className="font-medium text-ink">Closed</dd>
                  </div>
                </dl>
                <Separator className="my-5" />
                <p className="text-sm text-ink-muted">Hours may change on public holidays.</p>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand text-white">
              <Music2 aria-hidden="true" className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">Music &amp; Education Center</p>
              <p className="text-xs text-ink-muted">Music and academics, together.</p>
            </div>
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-muted"
          >
            <a className="transition-colors hover:text-ink hover:underline" href="#programs">
              Programs
            </a>
            <a className="transition-colors hover:text-ink hover:underline" href="#how-it-works">
              How it works
            </a>
            <a className="transition-colors hover:text-ink hover:underline" href="#visit">
              Visit
            </a>
            <a className="transition-colors hover:text-ink hover:underline" href="/fonts/OFL.txt">
              Font license (OFL)
            </a>
          </nav>

          <p className="text-xs text-ink-muted">
            © {new Date().getFullYear()} Music &amp; Education Center
          </p>
        </div>
      </footer>
    </div>
  );
}
