import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlockModel } from '../models/block.model';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BlocksService {
  constructor(
    @InjectModel(BlockModel.name) private blockModel: Model<BlockModel>,
    @InjectQueue('events') private eventsQueue: Queue
  ) {}

  async getBlocks(siteId: string) {
    return this.blockModel.find({ siteId }).lean().exec();
  }

  async updateBlock(siteId: string, blockId: string, data: any, expectedVersion: number) {
    const block = await this.blockModel.findOne({ siteId, blockId });
    if (!block) {
      // Create new block if it doesn't exist
      const newBlock = new this.blockModel({ siteId, blockId, type: data.type || 'Generic', data, version: 1 });
      await newBlock.save();
      await this.eventsQueue.add('SITE_BLOCKS_UPDATED', { siteId, blockId });
      return newBlock;
    }

    if (block.version !== expectedVersion) {
      throw new ConflictException('Optimistic concurrency failure: version mismatch');
    }

    block.data = data;
    block.version += 1;
    await block.save();

    await this.eventsQueue.add('SITE_BLOCKS_UPDATED', { siteId, blockId });
    return block;
  }
}
