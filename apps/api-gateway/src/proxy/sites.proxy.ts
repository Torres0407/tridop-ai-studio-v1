import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SitesClient } from '@libs/clients';
import { Request } from 'express';
import { JwtPayload } from '@libs/types';
import { SiteOwnershipGuard } from '@libs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CreateSiteDto, UpdateSiteDto, CreateRecordDto, UpdateRecordDto, UpdateBlockDto, CreateVersionDto, ApplyTemplateDto } from '../dto/sites.dto';

@ApiTags('Sites')
@ApiBearerAuth()
@Controller('sites')
@UseGuards(SiteOwnershipGuard)
export class SitesProxy {
  constructor(private readonly sitesClient: SitesClient) {}

  @Post()
  @ApiOperation({ summary: 'Create a new site' })
  async createSite(@Req() req: Request & { user: JwtPayload }, @Body() data: CreateSiteDto) {
    return this.sitesClient.createSite({ ownerId: req.user.sub, config: data.config });
  }

  // --- Dynamic Records ---
  @Post(':id/records/:schemaType')
  @ApiOperation({ summary: 'Create a dynamic record' })
  async createRecord(
    @Param('id') siteId: string,
    @Param('schemaType') schemaType: string,
    @Body() data: CreateRecordDto,
  ) {
    return this.sitesClient.createRecord({ siteId, schemaType, data: data.data });
  }

  @Get(':id/records/:schemaType')
  @ApiOperation({ summary: 'Find dynamic records' })
  async findRecords(
    @Param('id') siteId: string,
    @Param('schemaType') schemaType: string,
  ) {
    return this.sitesClient.findRecords({ siteId, schemaType });
  }

  @Put(':id/records/:schemaType/:recordId')
  @ApiOperation({ summary: 'Update a dynamic record' })
  async updateRecord(
    @Param('id') siteId: string,
    @Param('recordId') recordId: string,
    @Body() data: UpdateRecordDto,
  ) {
    return this.sitesClient.updateRecord({ siteId, recordId, update: data.update });
  }

  @Delete(':id/records/:schemaType/:recordId')
  @ApiOperation({ summary: 'Delete a dynamic record' })
  async deleteRecord(
    @Param('id') siteId: string,
    @Param('recordId') recordId: string,
  ) {
    return this.sitesClient.deleteRecord({ siteId, recordId });
  }

  @Get('templates/all')
  @ApiOperation({ summary: 'List available templates' })
  async listTemplates() {
    return this.sitesClient.listTemplates();
  }

  @Get('meta/counts')
  @ApiOperation({ summary: 'Get aggregate site counts' })
  async getSiteCounts() {
    return this.sitesClient.getSiteCounts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a site by ID' })
  async getSite(@Param('id') id: string) {
    return this.sitesClient.findById({ siteId: id });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a site configuration' })
  async updateSite(@Param('id') id: string, @Body() data: UpdateSiteDto) {
    return this.sitesClient.updateSite({ siteId: id, config: data.config });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a site' })
  async deleteSite(@Param('id') id: string) {
    return this.sitesClient.deleteSite({ siteId: id });
  }

  @Get()
  @ApiOperation({ summary: 'List all sites for the current user' })
  async listSites(@Req() req: Request & { user: JwtPayload }) {
    return this.sitesClient.listSites({ ownerId: req.user.sub });
  }

  @Get(':id/blocks')
  @ApiOperation({ summary: 'Get all blocks for a site' })
  async getSiteBlocks(@Param('id') id: string) {
    return this.sitesClient.getSiteBlocks({ siteId: id });
  }

  @Put(':id/blocks/:blockId')
  @ApiOperation({ summary: 'Update a specific block' })
  async updateBlock(
    @Param('id') id: string,
    @Param('blockId') blockId: string,
    @Body() data: UpdateBlockDto
  ) {
    return this.sitesClient.updateBlock({ siteId: id, blockId, content: data.content, version: data.version });
  }

  @Post(':id/versions')
  @ApiOperation({ summary: 'Create a new site version snapshot' })
  async createVersion(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
    @Body() data: CreateVersionDto
  ) {
    return this.sitesClient.createVersion({ siteId: id, userId: req.user.sub, message: data.message });
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'List all versions for a site' })
  async listVersions(@Param('id') id: string) {
    return this.sitesClient.listVersions({ siteId: id });
  }

  @Post(':id/versions/:versionId/restore')
  @ApiOperation({ summary: 'Restore a site to a specific version' })
  async restoreVersion(@Param('id') id: string, @Param('versionId') versionId: string) {
    return this.sitesClient.restoreVersion({ siteId: id, versionId });
  }

  @Post(':id/clone')
  @ApiOperation({ summary: 'Clone a site' })
  async cloneSite(@Req() req: Request & { user: JwtPayload }, @Param('id') id: string) {
    return this.sitesClient.cloneSite({ siteId: id, newOwnerId: req.user.sub });
  }

  @Post(':id/export')
  @ApiOperation({ summary: 'Export a site to static files' })
  async exportSite(@Param('id') id: string) {
    return this.sitesClient.exportSite({ siteId: id });
  }


  @Get(':id/ab-tests')
  @ApiOperation({ summary: 'List A/B tests for a site' })
  async listABTests(@Param('id') id: string) {
    return this.sitesClient.listABTests({ siteId: id });
  }

  @Post(':id/ab-tests')
  @ApiOperation({ summary: 'Create an A/B test' })
  async createABTest(@Param('id') id: string, @Body() data: { config: any }) {
    return this.sitesClient.createABTest({ siteId: id, config: data.config });
  }

  @Put(':id/ab-tests/:testId')
  @ApiOperation({ summary: 'Update an A/B test' })
  async updateABTest(@Param('id') id: string, @Param('testId') testId: string, @Body() data: { config: any }) {
    return this.sitesClient.updateABTest({ siteId: id, testId, config: data.config });
  }


  @Post(':id/apply-template')
  @ApiOperation({ summary: 'Apply a template to a site' })
  async applyTemplate(@Param('id') id: string, @Body() data: ApplyTemplateDto) {
    return this.sitesClient.applyTemplate({ siteId: id, templateId: data.templateId });
  }

  @Post(':id/upload-image')
  @ApiOperation({ summary: 'Upload an image for a site via Cloudinary' })
  async uploadImage(@Param('id') id: string, @Body() data: { fileData: string; folder?: string }) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Graceful fallback when Cloudinary is not configured
    if (!cloudName || !apiKey || !apiSecret) {
      return { url: 'https://mock.tridop.ai/placeholder.png', provider: 'mock' };
    }

    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

    try {
      const result = await cloudinary.uploader.upload(data.fileData, {
        folder: data.folder ?? `tridopai/sites/${id}`,
        resource_type: 'auto',
      });
      return { url: result.secure_url, publicId: result.public_id, provider: 'cloudinary' };
    } catch (err: any) {
      throw new InternalServerErrorException(`Image upload failed: ${err.message}`);
    }
  }
}
