const output = document.getElementById('output');

const xmlResponse = await fetch('report.xml');

if (!xmlResponse.ok) {
    let errorMessage = `Fetch failed ${xmlResponse.statusText} (${xmlResponse.status})`;
    output.textContent = errorMessage;
    throw new Error(errorMessage);
}

const xmlText = await xmlResponse.text();
const parser = new DOMParser();
const doc = parser.parseFromString(xmlText, 'text/xml');

const accountMovements = [...doc.documentElement.children].toReversed();
const accountMovement = accountMovements[0];
const iban = accountMovement.querySelector('IBAN').textContent;
const currency = accountMovement.querySelector('CCY').textContent;

// noinspection JSNonASCIINames
const bankTransactionTypes = {
    'Операция с карта': 'AC1',
    'Дължима периодична такса': 'GCH',
    'ТАКСА по пакетна програма': 'GPC',
    'BLINK Платежно нареждане извън банката': 'TB1',
    'BLINK Получен междубанков превод': 'TB2',
    'Получен междубанков превод': 'TBB',
    'Издаден вътр.банков превод': 'TF1',
    'Получен вътр.банков превод': 'TF2',
    'Платежно нареждане извън банката': 'THO',
};

function sum(arr) {
    return arr.reduce((prev, curr) => prev + curr, 0);
}

function splitStringToParts(str, parts = []) {
    const totalPartsLength = sum(parts);

    if (str.length > totalPartsLength) {
        throw new Error(`String too long, max expected length=${totalPartsLength}, got length=${str.length}`);
    }

    let offset = 0;
    let result = [];

    for (let i = 0; i < parts.length; i++) {
        if (str.length - offset <= 0) {
            break;
        }

        result[i] = str.substring(offset, offset + parts[i]);
        offset += parts[i];
    }

    return result;
}

function findSep(str, defaultSep = '+') {
    const seps = ' !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

    let sep = defaultSep;
    let offset = 0;

    while (str.indexOf(sep) > -1) {
        if (offset >= seps.length) {
            throw new Error(`Unable to find a suitable separator for string: ${str}`);
        }

        sep = seps[offset++];
    }

    return sep;
}

function zeroPad(str, length = 2) {
    return str.toString().padStart(length, '0');
}

function getElementText(el, returnNull = false) {
    if (el.getAttribute('nil') === 'true') {
        return returnNull ? null : '';
    }

    return el.textContent;
}

function getQueryText(parent, query, returnNull = false) {
    if (parent === null) {
        throw new Error('getQueryText on null element');
    }

    const el = parent.querySelector(query);

    if (!el) {
        return returnNull ? null : '';
    }

    return getElementText(el, returnNull);
}

function formatDate(dt) {
    return `${zeroPad(dt.getFullYear().toString().substring(2))}${zeroPad(dt.getMonth() + 1)}${zeroPad(dt.getDate())}`;
}

function formatAmount(amount) {
    return amount.toFixed(2).replace('.', ',');
}

function parse(accountMovements) {
    let result = '';

    function out(txt) {
        result += txt + '\n';
    }

    let balance = 0;
    let lastDate = '';
    let index = 0;

    const accountMovementsLength = accountMovements.length;

    for (const accountMovement of accountMovements) {
        const movementType = getQueryText(accountMovement, 'MovementType');

        if (!['Credit', 'Debit'].includes(movementType)) {
            throw new Error('WTF Unsupported/missing movement type: ' + movementType);
        }

        const amount = parseFloat(getQueryText(accountMovement, 'Amount'));
        const gppReference = getQueryText(accountMovement, 'GppReference', true);
        const movementFunctionalType = getQueryText(accountMovement, 'MovementFunctionalType');
        const hasGppReference = gppReference !== null;
        const reason = getQueryText(accountMovement, 'Reason', true);
        const description = hasGppReference ? movementFunctionalType : (reason ?? movementFunctionalType);
        const oppositeAccount = getQueryText(accountMovement, 'OppositeSideAccount');
        const oppositeName = getQueryText(accountMovement, 'OppositeSideName');
        const narrative = getQueryText(accountMovement, 'Narrative', true);
        const narrative2 = getQueryText(accountMovement, 'NarrativeI02', true);
        const details = hasGppReference ? `${narrative ?? ''}${reason ?? ''}` : (narrative2 ?? narrative ?? '');
        const documentReference = getQueryText(accountMovement, 'DocumentReference');
        const reference = documentReference.substring(14, 30).toUpperCase();
        const paymentDate = new Date(getQueryText(accountMovement, 'PaymentDate'));
        const valueDate = new Date(getQueryText(accountMovement, 'ValueDate'));

        const paymentTxt = formatDate(paymentDate);
        const valueTxt = formatDate(valueDate);

        const oppositeBicKey = movementType === 'Credit' ? 'PayerBIC' : 'PayeeBIC';
        const hasDocument = getQueryText(accountMovement, 'HasDocument') === 'true';
        const movementDocument = accountMovement.querySelector('MovementDocument[type="d2p1:AccountMovementDocumentI02"]');
        const oppositeBic = hasDocument ? getQueryText(movementDocument, oppositeBicKey) : null;

        // if (paymentTxt !== valueTxt) {
        //     console.log(reference, currency, movementType, amount, oppositeAccount, oppositeName, description, details);
        //     console.log('payment', paymentDate);
        //     console.log('value  ', valueDate);
        // }

        function getBalance() {
            // noinspection JSReferencingMutableVariableFromClosure
            return `C${paymentTxt}${currency}${formatAmount(balance)}`;
        }

        function printHeader() {
            out(`:20:${paymentTxt}`);
            out(`:25:${iban}`);
            // skipped tag 28
            out(`:60F:${getBalance()}`);
        }

        function printFooter() {
            out(`:62F:${getBalance()}`);
            out(`:64:${getBalance()}`);
            out('-');
        }

        const dateChanged = lastDate !== '' && lastDate !== paymentTxt;

        if (lastDate === '') {
            printHeader();
        }

        lastDate = paymentTxt;

        if (dateChanged) {
            printFooter();
            printHeader();
        }

        const transactionType = movementType.substring(0, 1);
        const swiftType = 'NMSC';
        const ref = 'NONREF';
        out(`:61:${paymentTxt}${valueTxt.substring(2)}${transactionType}${formatAmount(amount)}${swiftType}${ref}//${reference}`);

        const field86 = `${description ?? ''}${details ?? ''}${oppositeBic ?? ''}${oppositeAccount ?? ''}${oppositeName ?? ''}`;
        const sep = findSep(field86);
        let fields = '';

        if (description) {
            fields += `${sep}00${description}`;
        }

        if (details) {
            const parts = splitStringToParts(details, [65, 65, 27, 27, 27, 27, 27]);

            for (let i = 0; i < parts.length; i++) {
                const code = (21 + i).toString();
                fields += `${sep}${code}${parts[i]}`;
            }
        }

        if (oppositeBic) {
            fields += `${sep}30${oppositeBic}`;
        }

        if (oppositeAccount) {
            fields += `${sep}31${oppositeAccount}`;
        }

        if (oppositeName) {
            const parts = splitStringToParts(oppositeName, [27, 27]);

            for (let i = 0; i < parts.length; i++) {
                const code = (32 + i).toString();
                fields += `${sep}${code}${parts[i]}`;
            }
        }

        const bankTransactionType = bankTransactionTypes?.[description] ?? 'XXX';

        if (fields.length > 0) {
            out(`:86:${bankTransactionType}${fields}`);
        }

        if (movementType === 'Credit') {
            balance += amount;
        }
        if (movementType === 'Debit') {
            balance -= amount;
        }

        const isLast = index + 1 === accountMovementsLength;

        if (isLast) {
            printFooter();
        }

        index++;
    }

    return result;
}

output.textContent = parse(accountMovements);
