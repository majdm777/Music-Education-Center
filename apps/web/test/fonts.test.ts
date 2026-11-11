import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const srcDir = fileURLToPath(new URL('../src', import.meta.url));
const fontDir = join(srcDir, 'fonts');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? sourceFiles(full) : [full];
  });
}

describe('vendored fonts', () => {
  it('never imports next/font/google', () => {
    const offenders = sourceFiles(srcDir).filter(
      (file) => /\.(ts|tsx)$/.test(file) && readFileSync(file, 'utf8').includes('next/font/google'),
    );

    expect(offenders).toEqual([]);
  });

  it('ships the four weights and the OFL license', () => {
    const files = [
      'IBMPlexSansArabic-Regular.woff2',
      'IBMPlexSansArabic-Medium.woff2',
      'IBMPlexSansArabic-SemiBold.woff2',
      'IBMPlexSansArabic-Bold.woff2',
      'OFL.txt',
    ];

    for (const file of files) {
      expect(existsSync(join(fontDir, file)), file).toBe(true);
    }
  });
});
