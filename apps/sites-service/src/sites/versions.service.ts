import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VersionSnapshotModel } from '../models/versionSnapshot.model';
import { BlockModel } from '../models/block.model';

@Injectable()
export class VersionsService {
  constructor(
    @InjectModel(VersionSnapshotModel.name)
    private readonly snapshotModel: Model<VersionSnapshotModel>,
    @InjectModel(BlockModel.name)
    private readonly blockModel: Model<BlockModel>,
  ) {}

  async createVersion(siteId: string, userId: string, message?: string): Promise<VersionSnapshotModel> {
    // Capture the current state of all blocks for this site
    const currentBlocks = await this.blockModel.find({ siteId }).lean();

    // Find the latest version number
    const latest = await this.snapshotModel
      .findOne({ siteId })
      .sort({ versionNumber: -1 })
      .lean();

    const versionNumber = latest ? latest.versionNumber + 1 : 1;

    const snapshot = new this.snapshotModel({
      siteId,
      versionNumber,
      createdBy: userId,
      snapshotData: currentBlocks,
      commitMessage: message ?? `Version ${versionNumber}`,
    });

    return snapshot.save();
  }

  async listVersions(siteId: string): Promise<VersionSnapshotModel[]> {
    return this.snapshotModel.find({ siteId }).sort({ versionNumber: -1 }).lean();
  }

  async restoreVersion(siteId: string, versionId: string): Promise<{ restored: boolean }> {
    const snapshot = await this.snapshotModel.findById(versionId).lean();
    if (!snapshot || snapshot.siteId !== siteId) {
      throw new Error(`Version ${versionId} not found for site ${siteId}`);
    }

    // Delete all current blocks and replace with the snapshot
    await this.blockModel.deleteMany({ siteId });
    const blocksToRestore = (snapshot.snapshotData as any[]).map((b: any) => ({
      ...b,
      _id: undefined, // Let Mongo assign new IDs
    }));
    await this.blockModel.insertMany(blocksToRestore);

    return { restored: true };
  }
}
