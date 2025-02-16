import { readFile } from 'node:fs/promises';

export async function readFileWithoutBom(path) {
    const contents = await readFile(path, {
        encoding: 'utf8',
    });

    return contents.replace(/^\uFEFF/, '');
}
