import { parseField86 } from './field86.js';

const mapTransaction = transaction => ({
    date: transaction.date,                       // 61
    entryDate: transaction.entryDate,             // 61
    amount: transaction.amount,                   // 61
    isReversal: transaction.isReversal,           // 61
    transactionType: transaction.transactionType, // 61
    reference: transaction.reference,             // 61
    bankReference: transaction.bankReference,     // 61
    ...parseField86(transaction),                 // 86
});

export const mapStatement = statement => ({
    transactionReference: statement.transactionReference,               // 20
    accountIdentification: statement.accountIdentification,             // 25
    number: statement.number,                                           // 28
    openingBalanceDate: statement.openingBalanceDate,                   // 60
    openingBalance: statement.openingBalance,                           // 60
    currency: statement.currency,                                       // 60
    transactions: statement.transactions.map(mapTransaction),           // 61, 86
    statementDate: statement.statementDate,                             // 62F
    closingBalanceDate: statement.closingBalanceDate,                   // 62F
    closingBalance: statement.closingBalance,                           // 62F
    closingAvailableBalanceDate: statement.closingAvailableBalanceDate, // 64
    closingAvailableBalance: statement.closingAvailableBalance,         // 64
});
