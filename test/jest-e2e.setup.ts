import { config } from 'dotenv';

// Si CI ya define DATABASE_URL, no cargamos archivo
if (!process.env.DATABASE_URL) {
  config({ path: '.env.test', quiet: true });
}
