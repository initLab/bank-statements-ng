import { JSDOM } from 'jsdom';
import NodeType from 'jsdom/lib/jsdom/living/node-type.js';
import { formatWithOptions } from 'node:util';

const dateRegExp = /\b(?<day>\d{2})\.(?<month>\d{2})\.(?<year>\d{4})(?: (?<time>\d{2}:\d{2}:\d{2}))?/;

function parseDate(dateStr) {
    const matches = dateStr.match(dateRegExp);

    if (!matches) {
        throw new Error(`Date/time not found in string: ${dateStr}`);
    }

    // skipping the time assumes midnight in GMT, not the local timezone
    const time = matches.groups.time ? ` ${matches.groups.time}` : '';

    return new Date(`${matches.groups.year}-${matches.groups.month}-${matches.groups.day}${time}`);
}

const isTextNode = node => node.nodeType === NodeType.TEXT_NODE;
const isBrElementNode = node => node.nodeType === NodeType.ELEMENT_NODE &&
    node.nodeName === 'BR';

function parseDescriptionNodes(nodeList) {
    if (nodeList.length < 3) {
        throw new Error('Description nodes must be 3 or more');
    }

    if (nodeList.length > 7) {
        throw new Error('Description nodes must be 7 or less');
    }

    const description = Array(4).fill(null);

    let index = 0;

    for (const node of nodeList) {
        if (isBrElementNode(node)) {
            index++;

            if (index >= description.length) {
                throw new Error('Unexpected line break found (more than 3)');
            }

            continue;
        }

        if (isTextNode(node)) {
            if (typeof description[index] === 'string') {
                throw new Error(`Attempting to overwrite an element of description at index ${index}`);
            }

            description[index] = node.textContent;
            continue;
        }

        throw new Error('Unexpected node type');
    }

    const [
        bankTransactionTypeDescription,
        cardPaymentReason,
        paymentReason1,
        paymentReason2,
    ] = description;

    return {
        bankTransactionTypeDescription,
        cardPaymentReason,
        paymentReason1,
        paymentReason2,
    };
}

async function parseHtmlStatement(dom) {
    const {
        window: {
            document,
        },
    } = dom;

    const statementDate = parseDate(document.querySelector('table:nth-of-type(2) tr:nth-child(1) font:nth-child(2)').textContent);

    const balanceRow = document.querySelector('table:nth-of-type(3) tr:nth-child(2)');
    const balanceDate = parseDate(balanceRow.querySelector('td:nth-child(1)').textContent);
    const balanceAmount = parseFloat(balanceRow.querySelector('td:nth-child(2)').textContent);

    if (isNaN(balanceAmount)) {
        throw new Error('Failed parsing balance amount');
    }

    const transactions = [];
    const transactionsTable = document.querySelector('table:nth-of-type(4) > tbody');

    for (const transactionRow of transactionsTable.children) {
        if (transactionRow.childElementCount !== 7) {
            continue;
        }

        const firstColumn = transactionRow.firstElementChild;
        let processingDate;

        try {
            processingDate = parseDate(firstColumn.textContent);
        }
        catch {
            continue;
        }

        const reference = transactionRow.children[1].textContent.trim();
        const valueDate = parseDate(transactionRow.children[2].textContent);
        const operationDirection = transactionRow.children[4].textContent;

        if (!['КТ', 'ДТ'].includes(operationDirection)) {
            throw new Error(`Invalid operation direction: ${operationDirection}`);
        }

        const amount = parseFloat(transactionRow.children[3].textContent) * (
            operationDirection === 'КТ' ? 1 : -1
        );

        const descriptionCellNodes = transactionRow.children[5].childNodes;
        const {
            bankTransactionTypeDescription,
            cardPaymentReason,
            paymentReason1,
            paymentReason2,
        } = parseDescriptionNodes(descriptionCellNodes);

        const reason = paymentReason1 || paymentReason2 ? `${paymentReason1 ?? ''}${paymentReason1 && paymentReason2 ? ' ' : ''}${paymentReason2 ?? ''}` : null;

        let counterpartyIban = null;
        let counterpartyName = null;

        const detailsCell = transactionRow.children[6];

        if (detailsCell.childElementCount > 0) {
            const detailCells = detailsCell.querySelectorAll('table td');

            if (detailCells.length !== 2) {
                throw new Error('Transaction detail cells not found');
            }

            counterpartyIban = detailCells[0].textContent;
            counterpartyName = detailCells[1].textContent;
        }

        transactions.push({
            processingDate,
            reference,
            valueDate,
            amount,
            bankTransactionTypeDescription,
            cardPaymentReason,
            reason,
            counterpartyIban,
            counterpartyName,
        });
    }

    return {
        statementDate,
        balanceDate,
        balanceAmount,
        transactions,
    };
}

const statements = [];

for (const filepath of process.argv.slice(2)) {
    console.log(filepath);
    const dom = await JSDOM.fromFile(filepath);
    const statement = await parseHtmlStatement(dom);
    statements.push(statement);
}

console.log(formatWithOptions({
    colors: true,
    depth: 4,
}, statements));
