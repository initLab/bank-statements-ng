import 'dotenv/config';
import { processFiles } from './processing/index.js';
import { sutando } from 'sutando';
import * as dbConfig from '../sutando.config.js';

sutando.addConnection(dbConfig);

await processFiles();
