import { JSDOM } from 'jsdom';

export const parseStatement = data => new JSDOM(data, {
    contentType: 'text/xml',
});
