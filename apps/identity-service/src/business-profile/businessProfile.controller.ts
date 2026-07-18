import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BusinessProfileService } from './businessProfile.service';
import { UpsertBusinessProfileDto } from '../users/dto/user.dto';

@Controller()
export class BusinessProfileController {
  constructor(private readonly profileService: BusinessProfileService) {}

  @MessagePattern('businessProfile.get')
  get(@Payload() { userId }: { userId: string }) {
    return this.profileService.get(userId);
  }

  @MessagePattern('businessProfile.upsert')
  upsert(@Payload() dto: UpsertBusinessProfileDto) {
    return this.profileService.upsert(dto);
  }
}
