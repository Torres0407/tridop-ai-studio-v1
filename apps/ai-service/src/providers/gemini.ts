import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiProvider {
  private logger = new Logger(GeminiProvider.name);
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateText(prompt: string, modelType: 'pro' | 'flash' = 'flash'): Promise<string> {
    if (!this.genAI) {
      this.logger.error('GEMINI_API_KEY is not configured');
      throw new Error('AI Generation failed due to missing configuration');
    }

    const modelName = this.configService.get(`GEMINI_MODEL_${modelType.toUpperCase()}`, `gemini-2.5-${modelType}`);
    const model = this.genAI.getGenerativeModel({ model: modelName });
    
    this.logger.log(`Generating via ${modelName}`);
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}
