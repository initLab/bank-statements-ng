import { Transaction } from './models/transaction.js';
import { ModelNotFoundError } from 'sutando';

/**
 * @returns {Promise<boolean>} if a new record was created
 */
export async function storeTransaction(transaction) {
    const bankTransactionType = transaction.bankTransactionType === 'XXX' ? null : transaction.bankTransactionType;

    const attributes = {
        bankReference: transaction.bankReference,
        isFee: transaction.bankTransactionTypeDescription.startsWith('Такса за '),
    };

    const values = {
        valueDate: transaction.date,
        entryDate: transaction.entryDate,
        amount: transaction.amount.toFixed(2),
        isReversal: transaction.isReversal,
        bankTransactionType,
        bankTransactionTypeDescription: transaction.bankTransactionTypeDescription,
        paymentReason: transaction.paymentReason,
        counterpartyBic: transaction.counterpartyBic,
        counterpartyIban: transaction.counterpartyIban,
        counterpartyName: transaction.counterpartyName,
        cardOperationType: transaction.cardOperationType,
        originalAmount: transaction.originalAmount,
        originalCurrency: transaction.originalCurrency,
        merchantName: transaction.merchantName?.trim(),
        merchantLocation: transaction.merchantLocation?.trim(),
        authCode: transaction.authCode,
        pan: transaction.pan,
        tid: transaction.tid,
        tt: transaction.tt,
        cardUnknownNumber: transaction.cardUnknownNumber,
        cardInfo: transaction.cardInfo,
    };

    try {
        const row = await Transaction.query().where(attributes).firstOrFail();
        await row.update(values);
        return false;
    }
    catch (e) {
        if (e instanceof ModelNotFoundError) {
            await Transaction.query().create({
                ...attributes,
                ...values,
            });
            return true;
        }
        else {
            throw e;
        }
    }
}
