import { readFileSync } from 'node:fs';
import { argv } from 'node:process';
import parser from '@centrapay/swift-parser';

const UnicreditField86Codes = {
    '00': 'description1',
    '10': 'batchNumber',
    '20': 'description2',
    '21': 'reason',
    '22': 'reason',
    '23': 'reason',
    '24': 'reason',
    '25': 'reason',
    '26': 'reason',
    '27': 'reason',
    '30': 'senderBic',
    '31': 'senderIban',
    '32': 'senderName',
    '33': 'senderName',
};

const UnicreditField86ArrayFields = ['reason', 'senderName'];

function parseUnicreditField86(detail) {
    const type = detail.substring(0, 3);
    const separator = detail.charAt(3);
    const result = {
        type,
    };

    for (const field of detail.substring(4).split(separator)) {
        const code = field.substring(0, 2);
        const key = UnicreditField86Codes?.[code];

        if (!key) {
            throw new Error('Invalid code: ' + code);
        }

        const value = field.substring(2);

        if (value.length === 0) {
            continue;
        }

        if (UnicreditField86ArrayFields.includes(key)) {
            result[key] = [
                ...(result[key] || []),
                value,
            ];
        }
        else {
            result[key] = value;
        }
    }

    return result;
}

console.log(JSON.stringify(argv.slice(2).flatMap(arg => parser.parse({
    type: 'mt940',
    data: readFileSync(arg, 'utf8').replace(/^\uFEFF/, ''),
    validate: true,
})).map(statement => ({
    ...statement,
    transactions: statement.transactions.map(transaction => ({
        ...transaction,
        structuredDetails: transaction.detailSegments.map(parseUnicreditField86),
    })),
})), null, 4));
