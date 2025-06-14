import { sutando } from 'sutando';
import * as dbConfig from '../../sutando.config.js';

export function initializeDatabase() {
    sutando.addConnection(dbConfig);
}

export async function teardownDatabase() {
    await sutando.destroyAll();
}
