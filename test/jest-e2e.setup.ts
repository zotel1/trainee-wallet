import { config } from 'dotenv';

const needsEnvFile =
  !process.env.DATABASE_URL || !process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN;

if (needsEnvFile) {
  config({ path: '.env.test', quiet: true });
}
