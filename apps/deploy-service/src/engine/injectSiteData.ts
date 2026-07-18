import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class InjectSiteData {
  async inject(buildPath: string, blocks: any) {
    // Write blocks.json into the Next.js scaffold public or data folder
    const dataPath = path.join(buildPath, 'public', 'blocks.json');
    await fs.writeFile(dataPath, JSON.stringify(blocks, null, 2), 'utf-8');
    return true;
  }
}
