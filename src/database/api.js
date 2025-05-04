import { Transaction } from './models/transaction.js';
import { ModelNotFoundError } from 'sutando';

/**
 * @returns {Promise<boolean>} if a new record was created
 */
export async function storeTransaction(transaction) {
    const isFee = transaction.bankTransactionTypeDescription.startsWith('Такса за ');
    const amount = transaction.amount.toFixed(2);
    const bankTransactionType = transaction.bankTransactionType === 'XXX' ? null : transaction.bankTransactionType;

    const attributes = {
        bankReference: transaction.bankReference,
        isFee,
    };

    const values = {
        valueDate: transaction.date,
        entryDate: transaction.entryDate,
        amount,
        isReversal: transaction.isReversal,
        bankTransactionType,
        bankTransactionTypeDescription: transaction.bankTransactionTypeDescription,
        paymentReason: transaction.paymentReason,
        counterpartyBic: transaction.counterpartyBic,
        counterpartyIban: transaction.counterpartyIban,
        counterpartyName: transaction.counterpartyName,
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
