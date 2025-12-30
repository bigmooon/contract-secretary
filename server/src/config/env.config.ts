import { config } from 'dotenv';
import { resolve } from 'path';

const devEnvPath = resolve(process.cwd(), '.env');
const productionEnvPath = resolve(__dirname, '../../../.env');

const envFile =
  process.env.NODE_ENV === 'production' ? productionEnvPath : devEnvPath;

config({ path: envFile });

console.log(`📁 Loading .env from: ${envFile}`);
