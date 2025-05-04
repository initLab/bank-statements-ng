import 'dotenv/config.js';

export const client = 'pg';
export const searchPath = 'initlab-bank-statements';
export const pool = {
    min: 0,
    max: 1,
    idleTimeoutMillis: 1000,
};

export const migrations = {
    path: 'src/database/migrations',
};

export const models = {
    path: 'src/database/models',
};
