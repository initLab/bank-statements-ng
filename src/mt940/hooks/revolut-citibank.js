import { isUnicredit } from './_common.js';

export function process(statement) {
    if (!isUnicredit(statement)) {
        return;
    }

    for (const transaction of statement.transactions) {
        if (
            transaction?.bankTransactionType !== 'TBB' ||
            transaction?.counterpartyBic !== 'CITIBGSF' ||
            transaction?.counterpartyIban !== 'BG13CITI92501060002701' ||
            transaction?.counterpartyName !== 'CITIBANK EUROPE PLC WLK' ||
            !transaction?.paymentReason
        ) {
            continue;
        }

        const paymentReasonParts = transaction.paymentReason.split(' ');
        const revolutPaymentReasonParts = paymentReasonParts.slice(3);

        Object.assign(transaction, {
            revolutCounterpartyName: paymentReasonParts.slice(0, 2).join(' '),
            revolutPaymentType: paymentReasonParts?.[2],
            revolutPaymentReason: revolutPaymentReasonParts.length > 0 ? revolutPaymentReasonParts.join(' ') : null,
        });
    }
}
