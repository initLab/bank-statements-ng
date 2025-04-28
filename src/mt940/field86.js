import { parseUnicreditField86 } from './field86-unicredit.js';

export function parseField86(transaction) {
    // UniCredit uses a single detail segment in field 86
    const detailSegment = transaction.detailSegments?.[0];

    return {
        detailSegment,
        ...parseUnicreditField86(detailSegment),
    };
}
