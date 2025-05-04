const { Migration } = require('sutando');

module.exports = class extends Migration {
    /**
     * Run the migrations.
     */
    async up(schema) {
        await schema.table('transactions', (table) => {
            table.string('revolutCounterpartyName').nullable();
            table.string('revolutPaymentType').nullable();
            table.string('revolutPaymentReason').nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    async down(schema) {
        await schema.table('transactions', (table) => {
            table.dropColumns('revolutCounterpartyName', 'revolutPaymentType', 'revolutPaymentReason');
        });
    }
};
