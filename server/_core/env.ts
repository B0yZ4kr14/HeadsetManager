import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  VITE_APP_ID: z.string().min(1, 'VITE_APP_ID é obrigatório'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter no mínimo 32 caracteres'),
  DATABASE_URL: z.string().url('DATABASE_URL deve ser uma URL válida'),
  OAUTH_SERVER_URL: z.string().url().optional(),
  OWNER_OPEN_ID: z.string().optional(),
  BUILT_IN_FORGE_API_URL: z.string().url().optional(),
  BUILT_IN_FORGE_API_KEY: z.string().optional(),
  PORT: z.string().default('3000').transform(Number),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

type Env = z.infer<typeof envSchema>;

let validatedEnv: Env;

try {
  validatedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Erro na validação de variáveis de ambiente:');
    error.errors.forEach((err) => {
      console.error(`  ${err.path.join('.')}: ${err.message}`);
    });
  }
  process.exit(1);
}

export const ENV = {
  appId: validatedEnv.VITE_APP_ID,
  cookieSecret: validatedEnv.JWT_SECRET,
  databaseUrl: validatedEnv.DATABASE_URL,
  oAuthServerUrl: validatedEnv.OAUTH_SERVER_URL,
  ownerOpenId: validatedEnv.OWNER_OPEN_ID,
  isProduction: validatedEnv.NODE_ENV === 'production',
  forgeApiUrl: validatedEnv.BUILT_IN_FORGE_API_URL,
  forgeApiKey: validatedEnv.BUILT_IN_FORGE_API_KEY,
  port: validatedEnv.PORT,
  logLevel: validatedEnv.LOG_LEVEL,
  nodeEnv: validatedEnv.NODE_ENV,
};
