import { describe, expect, it } from 'vitest';
import { apiEnvSchema, loadApiEnv, loadWebEnv, webEnvSchema } from '../src/env';

const valid = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  DIRECT_URL: 'postgresql://user:pass@localhost:5432/db',
  API_PORT: '3001',
  WEB_ORIGIN: 'http://localhost:3000',
  JWT_SECRET: 'x'.repeat(32),
  TOTP_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString('base64'),
};

const validProduction = {
  ...valid,
  NODE_ENV: 'production',
  WEB_ORIGIN: 'https://center.example.com',
  JWT_SECRET: 'a'.repeat(64),
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

  it('rejects a non-PostgreSQL database URL', () => {
    const result = apiEnvSchema.safeParse({
      ...valid,
      DATABASE_URL: 'mysql://user:pass@localhost:3306/db',
    });
    expect(result.success).toBe(false);
  });

  it('accepts a production environment with HTTPS and a real secret', () => {
    expect(apiEnvSchema.safeParse(validProduction).success).toBe(true);
  });

  it('rejects an HTTP web origin in production', () => {
    const result = apiEnvSchema.safeParse({
      ...validProduction,
      WEB_ORIGIN: 'http://center.example.com',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a localhost web origin in production', () => {
    const result = apiEnvSchema.safeParse({
      ...validProduction,
      WEB_ORIGIN: 'https://localhost:3000',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a placeholder JWT secret in production', () => {
    const result = apiEnvSchema.safeParse({
      ...validProduction,
      JWT_SECRET: 'ci-only-secret-that-is-at-least-32-characters',
    });
    expect(result.success).toBe(false);
  });
});

describe('webEnvSchema', () => {
  it('falls back to localhost outside production', () => {
    const result = webEnvSchema.safeParse({ NODE_ENV: 'development' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.API_URL).toBe('http://localhost:3001');
    }
  });

  it('requires API_URL in production', () => {
    const result = webEnvSchema.safeParse({ NODE_ENV: 'production' });
    expect(result.success).toBe(false);
  });

  it('accepts an explicit production API_URL', () => {
    const result = webEnvSchema.safeParse({
      NODE_ENV: 'production',
      API_URL: 'https://api.example.com',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.API_URL).toBe('https://api.example.com');
    }
  });
});

describe('loadApiEnv', () => {
  it('throws a readable error listing the bad fields', () => {
    expect(() => loadApiEnv({ ...valid, JWT_SECRET: '' })).toThrow('JWT_SECRET');
  });
});

describe('loadWebEnv', () => {
  it('throws when a production build has no API target', () => {
    expect(() => loadWebEnv({ NODE_ENV: 'production' })).toThrow('API_URL');
  });
});
