import { Injectable } from '@nestjs/common';
import { GeminiProvider } from '../providers/gemini';

@Injectable()
export class AIRouter {
  constructor(private gemini: GeminiProvider) {}

  async routePrompt(prompt: string, complexity: 'high' | 'low') {
    const modelType = complexity === 'high' ? 'pro' : 'flash';
    return this.gemini.generateText(prompt, modelType);
  }
}
