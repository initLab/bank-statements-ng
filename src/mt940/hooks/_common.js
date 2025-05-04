export function isUnicredit(statement) {
    const iban = statement.accountIdentification;

    return iban.startsWith('BG') && iban.substring(4, 8) === 'UNCR';
}
