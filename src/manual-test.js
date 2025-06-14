import { argv } from 'node:process';
import { readFile } from 'node:fs/promises';
import 'dotenv/config';
import { initializeDatabase, teardownDatabase } from './database/index.js';
import { processAttachmentContent } from './processing/index.js';
import { removeBom } from './email/index.js';

initializeDatabase();

async function parseStatementsFiles(paths) {
    for (const path of paths) {
        const content = removeBom(await readFile(path));
        const progressFunction = created =>
            process.stdout.write(created ? '+' : '~');
        await processAttachmentContent(content, progressFunction);
    }

    process.stdout.write('\n');
}

await parseStatementsFiles(argv.slice(2));
await teardownDatabase();
