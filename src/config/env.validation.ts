import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES: z.string().default('7d'),
  PORT: z.string().optional(),
});

export type EnvVars = z.infer<typeof envSchema>;
