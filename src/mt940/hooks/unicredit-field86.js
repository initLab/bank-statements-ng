import { isUnicredit } from './_common.js';

const UnicreditField86Codes = {
    '00': 'bankTransactionTypeDescription',
    // '10': 'batchNumber',
    // '20': 'description2',
    '21': 'paymentReason',
    '22': 'paymentReason',
    '23': 'paymentReason',
    '24': 'paymentReason',
    '25': 'paymentReason',
    '26': 'paymentReason',
    '27': 'paymentReason',
    '30': 'counterpartyBic',
    '31': 'counterpartyIban',
    '32': 'counterpartyName',
    '33': 'counterpartyName',
};

const UnicreditField86ArrayFields = ['paymentReason', 'counterpartyName'];

export function process(statement) {
    if (!isUnicredit(statement)) {
        return;
    }

    for (const transaction of statement.transactions) {
        const field86 = transaction.detailSegments?.[0];

        if (!field86) {
            continue;
        }

        Object.assign(transaction, parseUnicreditField86(field86));
    }
}

function parseUnicreditField86(detail) {
    const bankTransactionType = detail.substring(0, 3);
    const separator = detail.charAt(3);
    const result = {
        bankTransactionType,
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

        // card operations are an exception
        if (bankTransactionType === 'AC1' && key === 'bankTransactionTypeDescription') {
            result[key] = 'Операция с карта';
            result.paymentReason = value;
            break;
        }

        if (UnicreditField86ArrayFields.includes(key)) {
            result[key] = (result?.[key] || '').concat(value);
        }
        else {
            result[key] = value;
        }
    }

    return result;
}
