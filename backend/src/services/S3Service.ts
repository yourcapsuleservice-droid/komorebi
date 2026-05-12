import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

var AWS_REGION = process.env.AWS_REGION;
var AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID; 
var AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY; 
var S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

class S3Service {
  private s3Client: S3Client;
  private AWS_S3_BUCKET_NAME: string;

  constructor() {
    this.s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
    this.AWS_S3_BUCKET_NAME = S3_BUCKET_NAME;
  }

  async uploadFile(fileBuffer: Buffer, fileName: string, folder: string, mimeType: string): Promise<string> {
    const safeName = fileName.replace(/\s+/g, '_');
    const key = `${folder}/${uuidv4()}_${safeName}`;
    const command = new PutObjectCommand({
      Bucket: this.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
    });
    try {
      await this.s3Client.send(command);
      return key;
    } catch (error) {
      console.error('[S3] Upload Error:', error);
      throw new Error('S3 Upload Failed');
    }
  }

  async getFileUrl(key: string | null | undefined): Promise<string | null> {
    if (!key || key.trim() === '') return null;

    if (key.startsWith('covers/')) {
      return `https://komorebi-storage.s3.us-east-1.amazonaws.com/${key}`;
    }

    const command = new GetObjectCommand({
      Bucket: this.AWS_S3_BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  getPublicUrl(key: string | null | undefined): string | null {
    if (!key || key.trim() === '') return null;
    if (key.startsWith('http')) return key;

    return `https://komorebi-storage.s3.us-east-1.amazonaws.com/${key}`;
  }

}

export { S3Service };