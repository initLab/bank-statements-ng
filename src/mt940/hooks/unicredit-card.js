import { isUnicredit } from './_common.js';

const regexAtmDeposit = /^(?<pan>\d{4}-{6}\d{4}) TID: (?<tid>[A-Z0-9]{8}) AC: (?<authCode>[A-Z0-9]{6}) TT: (?<tt>\d{4}) (?<cardUnknownNumber>\d{6})\/(?<cardInfo>.*)$/;
const regexAtmOther = /^(?<cardOperationType>.+) (?<originalAmount>\d+\.\d+) (?<originalCurrency>[A-Z]{3}),? авт.код:(?<authCode>[A-Z0-9]{6})?(?: ?- ?|, )(?<merchantName>[^\/]+)\/(?<merchantLocation>[^\/]+)(?:\/TID:(?<tid>[^\/]+))?\/PAN:(?<pan>\d{4,6}\*{4}\d{4})\/(?<cardInfo>.*)$/;

const regexes = [
    regexAtmDeposit,
    regexAtmOther,
];

export function process(statement) {
    if (!isUnicredit(statement)) {
        return;
    }

    for (const transaction of statement.transactions) {
        if (transaction?.bankTransactionType !== 'AC1' || !transaction?.paymentReason) {
            continue;
        }

        for (const regex of regexes) {
            const matches = transaction.paymentReason.match(regex);

            if (matches) {
                Object.assign(transaction, matches.groups);
                break;
            }
        }
    }
}
