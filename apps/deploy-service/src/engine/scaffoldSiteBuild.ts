import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ScaffoldSiteBuild {
  async scaffold(siteId: string) {
    // Determine path to the generic Next.js site template (assumes it's in the repo root or similar)
    const templatePath = path.join(process.cwd(), 'site-template');
    const buildPath = `/tmp/build-${siteId}-${Date.now()}`;
    
    // Copy the entire template directory to the tmp path
    await fs.cp(templatePath, buildPath, { recursive: true });
    
    return buildPath;
  }
}
