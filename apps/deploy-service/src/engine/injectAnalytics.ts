import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class InjectAnalytics {
  async inject(buildPath: string, trackingId: string) {
    if (!trackingId) return true;
    const envPath = path.join(buildPath, '.env.production.local');
    await fs.appendFile(envPath, `\nNEXT_PUBLIC_ANALYTICS_ID=${trackingId}\n`, 'utf-8');
    return true;
  }
}
