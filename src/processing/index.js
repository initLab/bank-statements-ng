import { deleteFile, isFileBeingProcessed, listFiles, readFile, tagFileAsProcessing } from '../s3/index.js';
import { getEmailAttachments, removeBom } from '../email/index.js';
import { parseAndValidateStatements } from '../mt940/parser.js';
import { storeTransaction } from '../database/api.js';

const isProd = process.env.NODE_ENV === 'production';

export async function processFiles() {
    const files = await listFiles();

    for (const file of files) {
        const key = file.Key;

        if (key.endsWith('/')) {
            continue;
        }

        if (isProd) {
            const alreadyProcessing = await isFileBeingProcessed(key);

            if (alreadyProcessing) {
                console.log(`Skipping file (already tagged): ${key}`);
                continue;
            }

            await tagFileAsProcessing(key);
        }

        const contents = await readFile(key);
        const attachments = await getEmailAttachments(contents, 'text/plain');
        const progressFunction = created =>
            process.stdout.write(created ? '+' : '~');

        for (const attachment of attachments) {
            await processAttachmentContent(attachment.content, progressFunction);
        }

        process.stdout.write('\n');

        if (isProd) {
            await deleteFile(key);
        }
    }

    console.log('All files processed.');
}

export async function processAttachmentContent(attachmentContent, progressFunction) {
    const cleanContent = removeBom(attachmentContent);
    const statements = parseAndValidateStatements(cleanContent);

    for (const statement of statements) {
        for (const transaction of statement.transactions) {
            const created = await storeTransaction(transaction);

            if (progressFunction) {
                progressFunction(created);
            }
        }
    }
}
