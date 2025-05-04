import { isFileBeingProcessed, listFiles, readFile } from '../s3/index.js';
import { getEmailAttachments } from '../email/index.js';
import { parseAndValidateStatements } from '../mt940/parser.js';

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

        // await tagFileAsProcessing(key);
        const contents = await readFile(key);
        const attachments = await getEmailAttachments(contents, 'text/plain');

        for (const attachment of attachments) {
            const statements = parseAndValidateStatements(attachment.content.toString());

            for (const statement of statements) {
                // TODO
                console.log(statement);
                process.exit();
            }
        }

        // await deleteFile(key);
    }

    console.log('All files processed.');
}
