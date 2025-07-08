// This file should only run on the server side
import { initializeDatabase } from './database';

// Only initialize database in development and on server
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  initializeDatabase().catch(console.error);
}

export {};