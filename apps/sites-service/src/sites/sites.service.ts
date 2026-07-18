import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SiteSchemaModel } from '../models/siteSchema.model';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { RpcException } from '@nestjs/microservices';

@Injectable()
export class SitesService {
  constructor(
    @InjectModel(SiteSchemaModel.name) private siteModel: Model<SiteSchemaModel>,
    @InjectQueue('events') private eventsQueue: Queue
  ) {}

  async createSite(ownerId: string, data: any) {
    const existingSites = await this.siteModel.countDocuments({ ownerId });
    if (existingSites >= 1) {
      throw new RpcException({
        statusCode: 403,
        message: 'Business owners are currently limited to 1 site per account.',
      });
    }

    const site = new this.siteModel({ ownerId, slug: `site-${Date.now()}`, ...data });
    return site.save();
  }

  async findById(siteId: string) {
    return this.siteModel.findById(siteId).exec();
  }

  async checkOwnership(siteId: string, userId: string): Promise<boolean> {
    const site = await this.siteModel.findById(siteId).select('ownerId').exec();
    if (!site) return false;
    return site.ownerId === userId;
  }

  async updateSite(siteId: string, data: any) {
    return this.siteModel.findByIdAndUpdate(siteId, data, { new: true }).exec();
  }

  async deleteSite(siteId: string) {
    const result = await this.siteModel.findByIdAndDelete(siteId).exec();
    if (result) {
      await this.eventsQueue.add('SITE_DELETED', { siteId });
    }
    return result;
  }

  async listSites(ownerId: string) {
    return this.siteModel.find({ ownerId }).exec();
  }

  async countAllSites() {
    return this.siteModel.countDocuments().exec();
  }

  async listAllSites(limit: number = 50, offset: number = 0) {
    return this.siteModel.find().sort({ createdAt: -1 }).skip(offset).limit(limit).exec();
  }
}
