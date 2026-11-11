import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const webDir = fileURLToPath(new URL('..', import.meta.url));
const srcDir = join(webDir, 'src');
const fontDir = join(srcDir, 'fonts');
const licenseFile = join(webDir, 'public/fonts/OFL.txt');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? sourceFiles(full) : [full];
  });
}

describe('vendored fonts', () => {
  it('never imports next/font/google', () => {
    const offenders = sourceFiles(srcDir).filter(
      (file) =>
        /\.(js|jsx|ts|tsx)$/.test(file) && readFileSync(file, 'utf8').includes('next/font/google'),
    );

    expect(offenders).toEqual([]);
  });

  it('ships the four weights and the license served to the browser', () => {
    const files = [
      'IBMPlexSansArabic-Regular.woff2',
      'IBMPlexSansArabic-Medium.woff2',
      'IBMPlexSansArabic-SemiBold.woff2',
      'IBMPlexSansArabic-Bold.woff2',
    ];

    for (const file of files) {
      expect(existsSync(join(fontDir, file)), file).toBe(true);
    }

    const license = readFileSync(licenseFile, 'utf8');
    expect(license).toContain('Copyright © 2017 IBM Corp.');
    expect(license).toContain('SIL OPEN FONT LICENSE');
  });

  it('wires the vendored files and the CSS variable into the root layout', () => {
    const layout = readFileSync(join(srcDir, 'app/layout.tsx'), 'utf8');

    expect(layout).toContain("from 'next/font/local'");
    expect(layout).toContain('--font-ibm-plex-sans-arabic');
    for (const weight of ['Regular', 'Medium', 'SemiBold', 'Bold']) {
      expect(layout).toContain(`../fonts/IBMPlexSansArabic-${weight}.woff2`);
    }
  });
});
