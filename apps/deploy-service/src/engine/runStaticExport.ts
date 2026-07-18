import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class RunStaticExport {
  private readonly logger = new Logger(RunStaticExport.name);

  async run(buildPath: string) {
    this.logger.log(`Running build in ${buildPath}...`);
    try {
      // Assuming dependencies are already installed or we use npm ci
      await execAsync('npm install', { cwd: buildPath });
      await execAsync('npm run build', { cwd: buildPath });
      this.logger.log(`Build completed for ${buildPath}`);
      return true;
    } catch (error) {
      this.logger.error(`Build failed in ${buildPath}`, error);
      throw error;
    }
  }
}
