import {
    DeleteObjectCommand,
    GetObjectCommand,
    GetObjectTaggingCommand,
    ListObjectsV2Command,
    PutObjectTaggingCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { Buffer } from 'node:buffer';

const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const PREFIX = `${process.env.S3_PREFIX}/`;
const PROCESSING_TAG = {
    Key: 'Processing',
    Value: 'true',
};

const s3 = new S3Client();

async function streamToBuffer(readable) {
    const chunks = [];

    for await (const chunk of readable) {
        chunks.push(chunk);
    }

    return Buffer.concat(chunks);
}

export async function listFiles() {
    const listResp = await s3.send(new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: PREFIX,
    }));

    return listResp.Contents || [];
}

export async function isFileBeingProcessed(key) {
    const tagResp = await s3.send(new GetObjectTaggingCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    }));

    return tagResp.TagSet.some(tag =>
        tag.Key === PROCESSING_TAG.Key &&
        tag.Value === PROCESSING_TAG.Value
    );
}

export async function tagFileAsProcessing(key) {
    await s3.send(new PutObjectTaggingCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Tagging: {
            TagSet: [
                PROCESSING_TAG,
            ],
        },
    }));

    console.log(`Tagged ${key} as processing`);
}

export async function readFile(key) {
    console.log(`Processing file: ${key}`);

    const getResp = await s3.send(new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    }));

    return await streamToBuffer(getResp.Body);
}

export async function deleteFile(key) {
    await s3.send(new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    }));

    console.log(`Deleted original file: ${key}`);
}
