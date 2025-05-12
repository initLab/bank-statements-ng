import { JSDOM } from 'jsdom';

const {
    window: {
        document,
    },
} = await JSDOM.fromFile('/home/venci/Documents/init Lab/bank-statements/HTML/2025_05_12_08_09_19_3425.html');

const balanceRow = document.querySelector('table:nth-of-type(3) tr:nth-child(2)');
const balanceDateMatches = balanceRow.querySelector('td:nth-child(1)').textContent
    .match(/\b(?<day>\d{2})\.(?<month>\d{2})\.(?<year>\d{4}) (?<time>\d{2}:\d{2}:\d{2})/);
const balanceDate = new Date(`${balanceDateMatches.groups.year}-${balanceDateMatches.groups.month}-${balanceDateMatches.groups.day} ${balanceDateMatches.groups.time}`);
const balanceAmount = parseFloat(balanceRow.querySelector('td:nth-child(2)').textContent);

console.log(balanceDate, balanceAmount);
