/**
 * S3 Storage Adapter
 *
 * Generic S3-compatible storage for thumbnail images.
 * Works with AWS S3, Hetzner Object Storage, MinIO, etc.
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const endpoint = process.env.S3_ENDPOINT || '';
const endpointUrl = endpoint.startsWith('http') ? endpoint : `https://${endpoint}`;

const s3 = new S3Client({
  endpoint: endpointUrl,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true,
});

const BUCKET = process.env.S3_BUCKET || 'thumbnails';

export async function uploadImage(
  key: string,
  buffer: Buffer | Uint8Array,
  contentType: string = 'image/png',
): Promise<{ bucket: string; key: string; url: string }> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  const url = `${process.env.S3_ENDPOINT}/${BUCKET}/${key}`;
  return { bucket: BUCKET, key, url };
}

export async function downloadImage(key: string): Promise<Buffer> {
  const response = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  return Buffer.from(await response.Body!.transformToByteArray());
}

export async function getPresignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn },
  );
}
