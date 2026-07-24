import { validateFileType, validateFileSize } from '@/lib/security';
import { env } from '@/lib/config/env';

export type UploadResult = {
  url: string;
  filename: string;
  key: string;
};

function getStorageConfig() {
  if (!env.STORAGE_ACCESS_KEY || !env.STORAGE_SECRET_KEY) {
    throw new Error('STORAGE_ACCESS_KEY and STORAGE_SECRET_KEY environment variables are required');
  }
  return {
    endpoint: env.STORAGE_ENDPOINT ?? 'http://localhost:9000',
    bucket: env.STORAGE_BUCKET ?? 'ptm-attachments',
    region: env.STORAGE_REGION ?? 'us-east-1',
    accessKey: env.STORAGE_ACCESS_KEY,
    secretKey: env.STORAGE_SECRET_KEY,
  };
}

export async function uploadFile(
  file: File,
  organizationId: string,
  taskId: string,
): Promise<UploadResult> {
  if (!validateFileType(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }

  const maxSize = 10 * 1024 * 1024;
  if (!validateFileSize(file.size, maxSize)) {
    throw new Error(`File exceeds maximum size of ${maxSize / 1024 / 1024} MB`);
  }

  const filename = `${crypto.randomUUID()}-${file.name}`;
  const key = `organizations/${organizationId}/tasks/${taskId}/${filename}`;
  const config = getStorageConfig();

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const url = `${config.endpoint}/${config.bucket}/${key}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'Content-Length': buffer.length.toString(),
        'x-amz-acl': 'private',
      },
      body: buffer,
    });

    if (response.ok) {
      return { url, filename, key };
    }
  } catch (err) {
    console.error('[Storage Service] S3 upload failed:', err);
    throw new Error('Failed to upload file to storage');
  }

  return { url: `/api/v1/files/${key}`, filename, key };
}

export function getSignedDownloadUrl(key: string, expiresIn: number = 3600): string {
  const config = getStorageConfig();
  const expiry = Math.floor(Date.now() / 1000) + expiresIn;
  return `${config.endpoint}/${config.bucket}/${key}?X-Amz-Expires=${expiry}`;
}

export async function deleteFile(key: string): Promise<void> {
  const config = getStorageConfig();
  try {
    const response = await fetch(`${config.endpoint}/${config.bucket}/${key}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `AWS ${config.accessKey}:${config.secretKey}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to delete ${key}: ${response.statusText}`);
    }
  } catch (err) {
    throw new Error(`Failed to delete ${key}: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}
