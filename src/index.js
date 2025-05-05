import 'dotenv/config';
import { initializeDatabase } from './database/index.js';
import { listenHttp } from './http/index.js';

initializeDatabase();
listenHttp();
