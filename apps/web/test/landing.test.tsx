import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import HomePage from '@/app/page';

const html = renderToStaticMarkup(<HomePage />);

describe('landing page', () => {
  it('leads with the center name and a clear heading', () => {
    expect(html).toContain('Music &amp; Education Center');
    expect(html).toContain('A place to learn music');
    expect(html).toContain('and keep up with school.');
  });

  it('lists every seeded program', () => {
    const programs = [
      'Piano',
      'Guitar',
      'Violin',
      'Math',
      'Arabic',
      'English',
      'Physics',
      'Chemistry',
      'Agenda',
    ];

    for (const program of programs) {
      expect(html).toContain(`>${program}<`);
    }
  });

  it('links the in-page anchors and the font license', () => {
    for (const anchor of ['#programs', '#how-it-works', '#visit']) {
      expect(html).toContain(`href="${anchor}"`);
    }

    expect(html).toContain('id="programs"');
    expect(html).toContain('id="how-it-works"');
    expect(html).toContain('id="visit"');
    expect(html).toContain('href="/fonts/OFL.txt"');
  });

  it('publishes the real opening hours', () => {
    expect(html).toContain('Monday to Saturday');
    expect(html).toContain('9:00 – 21:00');
    expect(html).toContain('Sunday');
    expect(html).toContain('Closed');
  });

  it('does not invent contact details or prices', () => {
    expect(html).not.toContain('tel:');
    expect(html).not.toContain('mailto:');
    expect(html).not.toMatch(/USD|LBP|\$\d/);
  });
});
