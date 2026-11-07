import { z } from 'zod';

function base64Bytes(bytes: number) {
  return z.string().refine((value) => {
    try {
      return Buffer.from(value, 'base64').length === bytes;
    } catch {
      return false;
    }
  }, `Must be base64 encoding exactly ${bytes} bytes`);
}

function postgresUrl(field: string) {
  return z
    .string()
    .url()
    .refine((value) => {
      const protocol = new URL(value).protocol;
      return protocol === 'postgres:' || protocol === 'postgresql:';
    }, `${field} must be a PostgreSQL URL`);
}

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);
const PLACEHOLDER_SECRET_PATTERNS = [/replace-with/i, /change-me/i, /ci-only/i, /example/i];

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

    const origin = new URL(env.WEB_ORIGIN);
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
    if (PLACEHOLDER_SECRET_PATTERNS.some((pattern) => pattern.test(env.JWT_SECRET))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_SECRET'],
        message: 'JWT_SECRET still looks like a placeholder',
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
    API_URL: z.string().url().optional(),
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

export function loadApiEnv(source: NodeJS.ProcessEnv = process.env): ApiEnv {
  const result = apiEnvSchema.safeParse(source);
  if (!result.success) {
    fail('API', result.error);
  }
  return result.data;
}

export function loadWebEnv(source: NodeJS.ProcessEnv = process.env): WebEnv {
  const result = webEnvSchema.safeParse(source);
  if (!result.success) {
    fail('web', result.error);
  }
  return result.data;
}
