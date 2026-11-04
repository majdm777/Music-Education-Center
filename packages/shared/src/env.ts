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

/**
 * Runtime environment required by the API. Validated once at bootstrap so a
 * missing secret fails loudly instead of at the first request.
 */
export const apiEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  API_PORT: z.coerce.number().int().positive().max(65535).default(3001),
  WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(32),
  TOTP_ENCRYPTION_KEY: base64Bytes(32),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export function loadApiEnv(source: NodeJS.ProcessEnv = process.env): ApiEnv {
  const result = apiEnvSchema.safeParse(source);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment: ${details}`);
  }

  return result.data;
}
