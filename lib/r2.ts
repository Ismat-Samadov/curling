import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function getR2Client() {
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET) {
    throw new Error('Missing R2 environment variables');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

export const r2Client = getR2Client();

export async function uploadToR2(file: File, key: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  });

  await r2Client.send(command);

  // Return the public URL
  return `${process.env.R2_API}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
  });

  await r2Client.send(command);
}

export async function getUploadUrl(key: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
  });

  return await getSignedUrl(r2Client, command, { expiresIn: 3600 });
}

export function generateImageKey(prefix: string, filename: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = filename.split('.').pop();
  return `${prefix}/${timestamp}-${randomString}.${extension}`;
}
