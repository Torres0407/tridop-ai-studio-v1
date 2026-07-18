import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusinessProfile } from '../models/businessProfile.model';
import { UpsertBusinessProfileDto } from '../users/dto/user.dto';

@Injectable()
export class BusinessProfileService {
  constructor(
    @InjectModel(BusinessProfile.name)
    private readonly profileModel: Model<BusinessProfile>,
  ) {}

  async get(userId: string): Promise<BusinessProfile> {
    const profile = await this.profileModel.findOne({ userId });
    if (!profile) throw new NotFoundException(`Business profile for user ${userId} not found`);
    return profile;
  }

  async upsert(dto: UpsertBusinessProfileDto): Promise<BusinessProfile> {
    return this.profileModel.findOneAndUpdate(
      { userId: dto.userId },
      { $set: dto },
      { upsert: true, new: true },
    );
  }
}
