import { Injectable } from '@nestjs/common';

@Injectable()
export class PromptCache {
  async get(key: string) { return null; }
  async set(key: string, value: string) {}
}
