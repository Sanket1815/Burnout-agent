import { initializeDatabase } from './database';

// Initialize database on startup
if (process.env.NODE_ENV !== 'production') {
  initializeDatabase().catch(console.error);
}