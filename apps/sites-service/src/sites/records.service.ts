import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DynamicRecordModel } from '../models/dynamicRecord.model';

@Injectable()
export class RecordsService {
  constructor(
    @InjectModel(DynamicRecordModel.name) private recordModel: Model<DynamicRecordModel>
  ) {}

  async createRecord(siteId: string, schemaType: string, data: any) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Data must be a valid JSON object');
    }
    if (JSON.stringify(data).length > 500_000) {
      throw new Error('Payload too large for dynamic record');
    }
    const record = new this.recordModel({ siteId, schemaType, data });
    return record.save();
  }

  async findRecords(siteId: string, schemaType: string) {
    return this.recordModel.find({ siteId, schemaType }).exec();
  }

  async updateRecord(siteId: string, recordId: string, data: any) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Data must be a valid JSON object');
    }
    if (JSON.stringify(data).length > 500_000) {
      throw new Error('Payload too large for dynamic record');
    }
    return this.recordModel.findOneAndUpdate(
      { _id: recordId, siteId },
      { data },
      { new: true }
    ).exec();
  }

  async deleteRecord(siteId: string, recordId: string) {
    return this.recordModel.findOneAndDelete({ _id: recordId, siteId }).exec();
  }
}
