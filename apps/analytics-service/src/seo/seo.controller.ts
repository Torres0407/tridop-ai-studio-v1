import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class SeoController {
  @MessagePattern('seo.settings.get')
  async getSettings() { return {}; }
}
