const dotenv = require('dotenv');
const { z } = require('zod');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3000').transform(Number),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(10),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
});

const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
    console.error('❌ Invalid environment variables:', envVars.error.format());
    process.exit(1);
}

module.exports = {
    env: envVars.data.NODE_ENV,
    port: envVars.data.PORT,
    databaseUrl: envVars.data.DATABASE_URL,
    jwtSecret: envVars.data.JWT_SECRET,
    logLevel: envVars.data.LOG_LEVEL,
};
