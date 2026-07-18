import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SitesService } from './sites.service';
import { BlocksService } from './blocks.service';
import { VersionsService } from './versions.service';
import { RecordsService } from './records.service';

@Controller()
export class SitesController {
  constructor(
    private readonly sitesService: SitesService,
    private readonly blocksService: BlocksService,
    private readonly versionsService: VersionsService,
    private readonly recordsService: RecordsService,
  ) {}

  // --- Dynamic Records ---
  @MessagePattern('sites.records.create')
  async createRecord(@Payload() data: { siteId: string, schemaType: string, data: any }) {
    return this.recordsService.createRecord(data.siteId, data.schemaType, data.data);
  }

  @MessagePattern('sites.records.find')
  async findRecords(@Payload() data: { siteId: string, schemaType: string }) {
    return this.recordsService.findRecords(data.siteId, data.schemaType);
  }

  @MessagePattern('sites.records.update')
  async updateRecord(@Payload() data: { siteId: string, recordId: string, update: any }) {
    return this.recordsService.updateRecord(data.siteId, data.recordId, data.update);
  }

  @MessagePattern('sites.records.delete')
  async deleteRecord(@Payload() data: { siteId: string, recordId: string }) {
    return this.recordsService.deleteRecord(data.siteId, data.recordId);
  }

  // --- Sites CRUD ---
  @MessagePattern('sites.create')
  async createSite(@Payload() data: { ownerId: string, config: any }) {
    return this.sitesService.createSite(data.ownerId, data.config);
  }

  @MessagePattern('sites.findById')
  async findById(@Payload() data: { siteId: string }) {
    return this.sitesService.findById(data.siteId);
  }

  @MessagePattern('sites.checkOwnership')
  async checkOwnership(@Payload() data: { siteId: string, userId: string }) {
    return { isOwner: await this.sitesService.checkOwnership(data.siteId, data.userId) };
  }

  @MessagePattern('sites.update')
  async updateSite(@Payload() data: { siteId: string, config: any }) {
    return this.sitesService.updateSite(data.siteId, data.config);
  }

  @MessagePattern('sites.delete')
  async deleteSite(@Payload() data: { siteId: string }) {
    return this.sitesService.deleteSite(data.siteId);
  }

  @MessagePattern('sites.list')
  async listSites(@Payload() data: { ownerId: string }) {
    return this.sitesService.listSites(data.ownerId);
  }

  @MessagePattern('sites.counts')
  async getSiteCounts() {
    return this.sitesService.countAllSites();
  }

  @MessagePattern('sites.listAll')
  async listAllSites(@Payload() data: { limit?: number; offset?: number }) {
    return this.sitesService.listAllSites(data.limit, data.offset);
  }

  // --- Blocks ---
  @MessagePattern('sites.blocks.get')
  async getBlocks(@Payload() data: { siteId: string }) {
    return this.blocksService.getBlocks(data.siteId);
  }

  @MessagePattern('sites.blocks.update')
  async updateBlock(@Payload() data: { siteId: string, blockId: string, content: any, version: number }) {
    return this.blocksService.updateBlock(data.siteId, data.blockId, data.content, data.version);
  }

  // --- Versions ---
  @MessagePattern('sites.version.create')
  async createVersion(@Payload() data: { siteId: string, userId: string, message: string }) {
    return this.versionsService.createVersion(data.siteId, data.userId, data.message);
  }

  @MessagePattern('sites.version.list')
  async listVersions(@Payload() data: { siteId: string }) {
    return this.versionsService.listVersions(data.siteId);
  }

  @MessagePattern('sites.version.restore')
  async restoreVersion(@Payload() data: { siteId: string, versionId: string }) {
    return this.versionsService.restoreVersion(data.siteId, data.versionId);
  }

  // --- Utility ---
  @MessagePattern('sites.clone')
  async cloneSite(@Payload() data: { siteId: string, newOwnerId: string }) {
    const original = await this.sitesService.findById(data.siteId);
    if (!original) throw new Error('Site not found');
    const { _id, ...rest } = original as any;
    return this.sitesService.createSite(data.newOwnerId, rest);
  }

  @MessagePattern('sites.export')
  async exportSite(@Payload() data: { siteId: string }) {
    throw new Error('Export integration not fully configured. Awaiting R2/S3 bucket credentials.');
  }

  // --- A/B Tests ---
  @MessagePattern('sites.abTest.create')
  async createABTest(@Payload() data: { siteId: string, config: any }) {
    throw new Error('AB Tests schema not yet defined');
  }

  @MessagePattern('sites.abTest.update')
  async updateABTest(@Payload() data: { siteId: string, testId: string, config: any }) {
    throw new Error('AB Tests schema not yet defined');
  }

  @MessagePattern('sites.abTest.list')
  async listABTests(@Payload() data: { siteId: string }) {
    throw new Error('AB Tests schema not yet defined');
  }

  // --- Templates ---
  @MessagePattern('templates.list')
  async listTemplates() {
    // In reality this would query a global templates collection
    throw new Error('Templates registry not connected');
  }

  @MessagePattern('templates.apply')
  async applyTemplate(@Payload() data: { siteId: string, templateId: string }) {
    throw new Error('Template apply logic not implemented');
  }

  // --- Uploads ---
  @MessagePattern('uploads.image')
  async uploadImage(@Payload() data: { siteId: string, fileData: string }) {
    throw new Error('AWS_S3_BUCKET not configured for image uploads');
  }
}
