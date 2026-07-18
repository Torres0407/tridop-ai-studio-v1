import { Injectable } from '@nestjs/common';

@Injectable()
export class RobotsService {
  generateRobotsTxt() { return 'User-agent: *\nAllow: /'; }
}
