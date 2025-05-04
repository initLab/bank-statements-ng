import { simpleParser } from 'mailparser';

export async function getEmailAttachments(contents, contentType = null) {
    const parsed = await simpleParser(contents);
    const attachments = parsed.attachments;

    if (contentType) {
        return attachments.filter(attachment => attachment.contentType === contentType);
    }

    return attachments;
}
