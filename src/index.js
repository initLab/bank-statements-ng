import { argv } from 'node:process';
import { readFileWithoutBom } from './util.js';
import { parseAndValidateStatements } from './parser.js';
import { mapStatement } from './mapping.js';

async function parseStatementsFiles(paths) {
    const result = [];

    for (const path of paths) {
        const contents = await readFileWithoutBom(path);
        const statements = parseAndValidateStatements(contents);

        for (const statement of statements) {
            result.push(mapStatement(statement));
        }
    }

    return result;
}

const parsed = await parseStatementsFiles(argv.slice(2));
const json = JSON.stringify(parsed, null, 4);
console.log(json);
