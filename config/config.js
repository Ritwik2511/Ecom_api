const dotenv = require('dotenv');
const { z } = require('zod');
const path = require('path');

// Load environment variables from .env file if it exists
const result = dotenv.config({ path: path.join(__dirname, '../.env') });

if (result.error && process.env.NODE_ENV !== 'production') {
    console.warn('⚠️ No .env file found. Relying on system environment variables.');
}

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3000').transform(Number),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(10),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
    API_BASE_URL: z.string().url().default('http://localhost:3000'),
    CORS_ORIGIN: z.string().default('*'),
});

const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(envVars.error.format(), null, 2));
    process.exit(1);
}

module.exports = {
    env: envVars.data.NODE_ENV,
    port: envVars.data.PORT,
    databaseUrl: envVars.data.DATABASE_URL,
    jwtSecret: envVars.data.JWT_SECRET,
    logLevel: envVars.data.LOG_LEVEL,
    apiBaseUrl: envVars.data.API_BASE_URL,
    corsOrigin: envVars.data.CORS_ORIGIN,
};
