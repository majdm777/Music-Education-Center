import { describe, expect, it } from 'vitest';
import { apiEnvSchema, loadApiEnv } from '../src/env';

const valid = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  DIRECT_URL: 'postgresql://user:pass@localhost:5432/db',
  API_PORT: '3001',
  WEB_ORIGIN: 'http://localhost:3000',
  JWT_SECRET: 'x'.repeat(32),
  TOTP_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString('base64'),
};

describe('apiEnvSchema', () => {
  it('accepts a complete environment', () => {
    const result = apiEnvSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.API_PORT).toBe(3001);
    }
  });

  it('rejects a short JWT secret', () => {
    const result = apiEnvSchema.safeParse({ ...valid, JWT_SECRET: 'too-short' });
    expect(result.success).toBe(false);
  });

  it('rejects a TOTP key that is not 32 bytes', () => {
    const result = apiEnvSchema.safeParse({
      ...valid,
      TOTP_ENCRYPTION_KEY: Buffer.alloc(16, 1).toString('base64'),
    });
    expect(result.success).toBe(false);
  });
});

describe('loadApiEnv', () => {
  it('throws a readable error listing the bad fields', () => {
    expect(() => loadApiEnv({ ...valid, JWT_SECRET: '' })).toThrow('JWT_SECRET');
  });
});
