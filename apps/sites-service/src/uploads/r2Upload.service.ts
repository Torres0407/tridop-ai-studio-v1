import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Cloudflare R2 is S3-compatible, so we use the AWS SDK v3
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class R2UploadService {
  private readonly logger = new Logger(R2UploadService.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = config.get<string>('CLOUDFLARE_R2_BUCKET', 'tridopai-assets');

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.get('CLOUDFLARE_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.get<string>('CLOUDFLARE_R2_ACCESS_KEY', ''),
        secretAccessKey: config.get<string>('CLOUDFLARE_R2_SECRET_KEY', ''),
      },
    });
  }

  async uploadImage(
    siteId: string,
    fileName: string,
    fileBuffer: Buffer,
    contentType: string,
  ): Promise<{ url: string; key: string }> {
    const key = `sites/${siteId}/assets/${Date.now()}-${fileName}`;

    this.logger.log(`Uploading ${key} to R2 bucket ${this.bucket}`);

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );

    // Return the public URL via the custom R2 domain
    const publicBase = this.config.get<string>(
      'CLOUDFLARE_R2_PUBLIC_URL',
      `https://assets.tridopai.app`,
    );

    return { url: `${publicBase}/${key}`, key };
  }
}
