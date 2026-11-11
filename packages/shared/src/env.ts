import { z } from 'zod';

/** A Zod string that decodes to exactly `bytes` bytes of base64. */
function base64Bytes(bytes: number) {
  return z.string().refine((value) => {
    try {
      return Buffer.from(value, 'base64').length === bytes;
    } catch {
      return false;
    }
  }, `Must be base64 encoding exactly ${bytes} bytes`);
}

/** A Zod string that parses as a postgres:// or postgresql:// URL. */
function postgresUrl(field: string) {
  return z
    .string()
    .url()
    .refine((value) => {
      try {
        const protocol = new URL(value).protocol;
        return protocol === 'postgres:' || protocol === 'postgresql:';
      } catch {
        return false;
      }
    }, `${field} must be a PostgreSQL URL`);
}

/** A Zod string that is an absolute HTTP or HTTPS URL. */
function httpUrl(field: string) {
  return z
    .string()
    .url()
    .refine((value) => {
      try {
        const protocol = new URL(value).protocol;
        return protocol === 'http:' || protocol === 'https:';
      } catch {
        return false;
      }
    }, `${field} must be an HTTP or HTTPS URL`);
}

// URL.hostname keeps the brackets around an IPv6 literal, so the loopback
// address is "[::1]" here, not "::1".
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]']);
const PLACEHOLDER_SECRET_PATTERNS = [/replace-with/i, /change-me/i, /ci-only/i, /example/i];
// Keys committed for CI are public. A production deployment must not reuse them.
const KNOWN_TEST_SECRETS = new Set([
  '6SYtapbzpbiVVwVJMv9++vmNsgyy6QER4xel4dYpB2I=', // CI-only TOTP key
]);

/**
 * Runtime environment required by the API. Validated once at bootstrap so a
 * missing secret fails loudly instead of at the first request.
 */
export const apiEnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: postgresUrl('DATABASE_URL'),
    DIRECT_URL: postgresUrl('DIRECT_URL'),
    API_PORT: z.coerce.number().int().positive().max(65535).default(3001),
    WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
    JWT_SECRET: z.string().min(32),
    TOTP_ENCRYPTION_KEY: base64Bytes(32),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== 'production') {
      return;
    }

    let origin: URL;
    try {
      origin = new URL(env.WEB_ORIGIN);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['WEB_ORIGIN'],
        message: 'WEB_ORIGIN must be a valid URL',
      });
      return;
    }
    if (origin.protocol !== 'https:') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['WEB_ORIGIN'],
        message: 'WEB_ORIGIN must use HTTPS in production',
      });
    }
    if (LOCAL_HOSTNAMES.has(origin.hostname)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['WEB_ORIGIN'],
        message: 'WEB_ORIGIN must not point at localhost in production',
      });
    }
    for (const field of ['DATABASE_URL', 'DIRECT_URL'] as const) {
      let hostname: string;
      try {
        hostname = new URL(env[field]).hostname;
      } catch {
        // The field schema already reports malformed URLs.
        continue;
      }
      if (LOCAL_HOSTNAMES.has(hostname)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: `${field} must not point at localhost in production`,
        });
      }
    }
    if (PLACEHOLDER_SECRET_PATTERNS.some((pattern) => pattern.test(env.JWT_SECRET))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_SECRET'],
        message: 'JWT_SECRET still looks like a placeholder',
      });
    }
    if (KNOWN_TEST_SECRETS.has(Buffer.from(env.TOTP_ENCRYPTION_KEY, 'base64').toString('base64'))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['TOTP_ENCRYPTION_KEY'],
        message: 'TOTP_ENCRYPTION_KEY is a public CI value; generate a unique key',
      });
    }
  });

export type ApiEnv = z.infer<typeof apiEnvSchema>;

/**
 * Environment used by the web app when it builds the /api rewrite. Development
 * may fall back to localhost; a production build must state its API target.
 */
export const webEnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    API_URL: httpUrl('API_URL').optional(),
    // Opts a non-development environment into serving the /style-guide
    // catalogue (for example a preview deployment). Off unless set to "true".
    STYLE_GUIDE_ENABLED: z.enum(['true', 'false']).optional(),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production' && !env.API_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['API_URL'],
        message: 'API_URL is required in production',
      });
    }
  })
  .transform((env) => ({
    ...env,
    API_URL: env.API_URL ?? 'http://localhost:3001',
  }));

export type WebEnv = z.infer<typeof webEnvSchema>;

function fail(label: string, error: z.ZodError): never {
  const details = error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');
  throw new Error(`Invalid ${label} environment: ${details}`);
}

/** Validates the API environment and throws a readable error listing bad fields. */
export function loadApiEnv(source: NodeJS.ProcessEnv = process.env): ApiEnv {
  const result = apiEnvSchema.safeParse(source);
  if (!result.success) {
    fail('API', result.error);
  }
  return result.data;
}

/** Validates the web environment and throws a readable error listing bad fields. */
export function loadWebEnv(source: NodeJS.ProcessEnv = process.env): WebEnv {
  const result = webEnvSchema.safeParse(source);
  if (!result.success) {
    fail('web', result.error);
  }
  return result.data;
}
