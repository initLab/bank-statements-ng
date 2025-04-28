import parser from '@centrapay/swift-parser';

export const parseAndValidateStatements = data => parser.parse({
    type: 'mt940',
    data,
    validate: true,
});
