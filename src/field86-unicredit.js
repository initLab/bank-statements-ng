const UnicreditField86Codes = {
    '00': 'description',
    // '10': 'batchNumber',
    // '20': 'description2',
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

export function parseUnicreditField86(detail) {
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
            result[key] = (result?.[key] || '').concat(value);
        }
        else {
            result[key] = value;
        }
    }

    return result;
}
