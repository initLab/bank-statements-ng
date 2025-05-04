import { deleteFile, isFileBeingProcessed, listFiles, readFile, tagFileAsProcessing } from '../s3/index.js';
import { getEmailAttachments } from '../email/index.js';
import { parseAndValidateStatements } from '../mt940/parser.js';
import { storeTransaction } from '../database/api.js';

export async function processFiles() {
    const files = await listFiles();

    for (const file of files) {
        const key = file.Key;

        if (key.endsWith('/')) {
            continue;
        }

        const alreadyProcessing = await isFileBeingProcessed(key);

        if (alreadyProcessing) {
            console.log(`Skipping file (already tagged): ${key}`);
            continue;
        }

        await tagFileAsProcessing(key);
        const contents = await readFile(key);
        const attachments = await getEmailAttachments(contents, 'text/plain');

        for (const attachment of attachments) {
            const statements = parseAndValidateStatements(attachment.content.toString());

            for (const statement of statements) {
                for (const transaction of statement.transactions) {
                    const created = await storeTransaction(transaction);
                    process.stdout.write(created ? '+' : '~');
                }
            }
        }

        process.stdout.write('\n');
        await deleteFile(key);
    }

    console.log('All files processed.');
}
