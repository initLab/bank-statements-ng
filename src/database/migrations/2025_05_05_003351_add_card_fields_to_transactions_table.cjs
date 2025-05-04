const { Migration } = require('sutando');

module.exports = class extends Migration {
    /**
     * Run the migrations.
     */
    async up(schema) {
        await schema.table('transactions', (table) => {
            table.string('cardOperationType').nullable();
            table.decimal('originalAmount', 10, 2).nullable();
            table.string('originalCurrency').nullable();
            table.string('merchantName').nullable();
            table.string('merchantLocation').nullable();
            table.string('authCode').nullable();
            table.string('pan').nullable();
            table.string('tid').nullable();
            table.string('tt').nullable();
            table.string('cardUnknownNumber').nullable();
            table.string('cardInfo').nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    async down(schema) {
        await schema.table('transactions', (table) => {
            table.dropColumns(
                'cardOperationType', 'originalAmount', 'originalCurrency', 'merchantName',
                'merchantLocation', 'authCode', 'pan', 'tid', 'tt', 'cardUnknownNumber', 'cardInfo'
            );
        });
    }
};
