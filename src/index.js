import { argv } from 'node:process';
import { readFileWithoutBom } from './util.js';
import { parseAndValidateStatements } from './mt940/parser.js';
import { mapStatement as mapMt940Statement } from './mt940/mapping.js';

export async function parseStatementsFiles(paths) {
    const result = [];

    for (const path of paths) {
        const contents = await readFileWithoutBom(path);

        if (path.toLowerCase().endsWith('.txt')) {
            const statements = parseAndValidateStatements(contents);

            for (const statement of statements) {
                result.push(mapMt940Statement(statement));
            }
        }
    }

    return result;
}

const parsed = await parseStatementsFiles(argv.slice(2));
const json = JSON.stringify(parsed, null, 4);
console.log(json);
