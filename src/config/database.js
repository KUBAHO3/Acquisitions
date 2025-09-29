import 'dotenv/config';

import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Configure Neon serverless driver for different environments
if (process.env.NODE_ENV === 'development') {
  // Configuration for Neon Local development environment
  neonConfig.fetchEndpoint = 'http://neon-local:5432/sql';
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
  console.log('🔧 Configured Neon serverless driver for Neon Local development');
} else {
  // Production configuration - use defaults
  console.log('🌐 Using Neon serverless driver for cloud database');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

export { db, sql };
