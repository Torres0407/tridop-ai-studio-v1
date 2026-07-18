// ─── libs/clients/src/sites.client.ts ───────────────────────────────────────
// STUB — implemented in Phase 4 (sites-service build)
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BaseServiceClient } from './baseClient';
import { InjectClient } from './inject-client.decorator';

export const SITES_CLIENT = 'SITES_SERVICE';

@Injectable()
export class SitesClient extends BaseServiceClient {
  constructor(@InjectClient(SITES_CLIENT) protected readonly proxy: ClientProxy) { super(); }
  createSite(data: { ownerId: string, config: any }): Promise<any> {
    return this.send('sites.create', data);
  }
  createRecord(data: { siteId: string, schemaType: string, data: any }): Promise<any> {
    return this.send('sites.records.create', data);
  }
  findRecords(data: { siteId: string, schemaType: string }): Promise<any> {
    return this.send('sites.records.find', data);
  }
  updateRecord(data: { siteId: string, recordId: string, update: any }): Promise<any> {
    return this.send('sites.records.update', data);
  }
  deleteRecord(data: { siteId: string, recordId: string }): Promise<any> {
    return this.send('sites.records.delete', data);
  }
  findById(data: { siteId: string }): Promise<any> {
    return this.send('sites.findById', data);
  }
  updateSite(data: { siteId: string, config: any }): Promise<any> {
    return this.send('sites.update', data);
  }
  deleteSite(data: { siteId: string }): Promise<any> {
    return this.send('sites.delete', data);
  }
  listSites(data: { ownerId: string }): Promise<any> {
    return this.send('sites.list', data);
  }
  getSiteBlocks(data: { siteId: string }): Promise<any> {
    return this.send('sites.blocks.get', data);
  }
  updateBlock(data: { siteId: string, blockId: string, content: any, version: number }): Promise<any> {
    return this.send('sites.blocks.update', data);
  }
  createVersion(data: { siteId: string, userId: string, message: string }): Promise<any> {
    return this.send('sites.version.create', data);
  }
  listVersions(data: { siteId: string }): Promise<any> {
    return this.send('sites.version.list', data);
  }
  restoreVersion(data: { siteId: string, versionId: string }): Promise<any> {
    return this.send('sites.version.restore', data);
  }
  cloneSite(data: { siteId: string, newOwnerId: string }): Promise<any> {
    return this.send('sites.clone', data);
  }
  exportSite(data: { siteId: string }): Promise<any> {
    return this.send('sites.export', data);
  }
  getSiteCounts(): Promise<any> {
    return this.send('sites.counts', {});
  }
  createABTest(data: { siteId: string, config: any }): Promise<any> {
    return this.send('sites.abTest.create', data);
  }
  checkOwnership(data: { siteId: string, userId: string }): Promise<{ isOwner: boolean }> {
    return this.send('sites.checkOwnership', data);
  }
  updateABTest(data: { siteId: string, testId: string, config: any }): Promise<any> {
    return this.send('sites.abTest.update', data);
  }
  listABTests(data: { siteId: string }): Promise<any> {
    return this.send('sites.abTest.list', data);
  }
  listTemplates(): Promise<any> {
    return this.send('templates.list', {});
  }
  applyTemplate(data: { siteId: string, templateId: string }): Promise<any> {
    return this.send('templates.apply', data);
  }
  uploadImage(data: { siteId: string, fileData: string }): Promise<any> {
    return this.send('uploads.image', data);
  }
  listAllSites(data: { limit?: number; offset?: number }): Promise<any> {
    return this.send('sites.listAll', data);
  }
}
