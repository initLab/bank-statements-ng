const filterAccount = account => ({
    AccountClass: {
        ID: account.AccountClass.ID,
        Description: account.AccountClass.Description,
    },
    BankClientID: account.BankClientID,
    BankClientName: account.BankClientName,
    CCY: account.CCY,
    IBAN: account.IBAN,
    ShortName: account.ShortName,
});

const convertAccountFields = account => ({
    accountIdentification: account.IBAN,
    currency: account.CCY,
});

const mapAccount = account => convertAccountFields(filterAccount(account));

const mapTransaction = transaction => ({
    // date: transaction.date,
    // entryDate: transaction.entryDate,
    amount: transaction.MovementDocument.Amount,
    bankReference: transaction.MovementDocument.DocRegNumberShort,
    description: '',
});

export function mapStatement(statement) {
    const transactions = statement?.[0]?.Items?.AccountMovement;
    const account = transactions?.[0]?.Account;

    return {
        ...(account ? mapAccount(account) : {}),
        transactions: transactions.map(mapTransaction),
    };
}
