const { Migration } = require('sutando');

module.exports = class extends Migration {
    /**
     * Run the migrations.
     */
    async up(schema) {
        await schema.createTable('transactions', (table) => {
            table.string('bankReference').notNullable();
            table.boolean('isFee').notNullable();
            table.date('valueDate').notNullable();
            table.date('entryDate').notNullable();
            table.decimal('amount', 12, 2).notNullable();
            table.boolean('isReversal').notNullable();
            table.string('bankTransactionType').nullable();
            table.string('bankTransactionTypeDescription').notNullable();
            table.string('paymentReason').nullable();
            table.string('counterpartyBic').nullable();
            table.string('counterpartyIban').nullable();
            table.string('counterpartyName').nullable();
            table.timestamps();

            table.primary(['bankReference', 'isFee']);
        });
    }

    /**
     * Reverse the migrations.
     */
    async down(schema) {
        await schema.dropTableIfExists('transactions');
    }
};
