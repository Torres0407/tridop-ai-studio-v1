import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class InjectSeo {
  async inject(buildPath: string, seoSettings: any) {
    if (!seoSettings) return true;
    const dataPath = path.join(buildPath, 'public', 'seo.json');
    await fs.writeFile(dataPath, JSON.stringify(seoSettings, null, 2), 'utf-8');
    return true;
  }
}
