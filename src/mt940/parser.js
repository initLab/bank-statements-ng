import parser from '@centrapay/swift-parser';
import { process as unicreditField86 } from './hooks/unicredit-field86.js';
import { process as unicreditCard } from './hooks/unicredit-card.js';

const hooks = [
    unicreditField86,
    unicreditCard,
];

export function parseAndValidateStatements(data) {
    const statements = parser.parse({
        type: 'mt940',
        data,
        validate: true,
    });

    for (const statement of statements) {
        for (const hook of hooks) {
            hook(statement);
        }
    }

    return statements;
}
