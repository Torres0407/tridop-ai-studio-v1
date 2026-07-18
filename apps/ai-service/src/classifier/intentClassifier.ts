import { Injectable } from '@nestjs/common';
import { GeminiProvider } from '../providers/gemini';
import { classifyIntent } from '../prompts/classifyIntent';

@Injectable()
export class IntentClassifier {
  constructor(private gemini: GeminiProvider) {}

  async classify(prompt: string) {
    return 'generateSite'; 
  }
}
