import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';

import { AIController } from './ai.controller';
import { AIRouter } from './router/AIRouter';
import { GeminiProvider } from './providers/gemini';
import { AssembleContext } from './context/assembleContext';
import { IntentClassifier } from './classifier/intentClassifier';
import { BusinessContentGuard } from './moderation/businessContentGuard';
import { PromptCache } from './cache/promptCache';
import { QuotaTracker } from './quota/quotaTracker';
import { SubscriptionUpgradedConsumer } from './events/subscriptionUpgraded.consumer';
import { StreamRelay } from './lib/streamRelay';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GenerationConsumer } from './jobs/generation.consumer';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URL', 'mongodb://localhost:27017/ai_db'),
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: new URL(config.get<string>('REDIS_URL', 'redis://localhost:6379')).hostname,
          port: Number(new URL(config.get<string>('REDIS_URL', 'redis://localhost:6379')).port),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'ai-generation',
    }),
    ClientsModule.register([
      {
        name: 'SITES_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: new URL(process.env.REDIS_URL || 'redis://localhost:6379').hostname,
          port: Number(new URL(process.env.REDIS_URL || 'redis://localhost:6379').port),
        },
      },
      {
        name: 'IDENTITY_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: new URL(process.env.REDIS_URL || 'redis://localhost:6379').hostname,
          port: Number(new URL(process.env.REDIS_URL || 'redis://localhost:6379').port),
        },
      },
    ]),
  ],
  controllers: [AIController],
  providers: [
    AIRouter,
    GeminiProvider,
    AssembleContext,
    IntentClassifier,
    BusinessContentGuard,
    PromptCache,
    QuotaTracker,
    SubscriptionUpgradedConsumer,
    StreamRelay,
    GenerationConsumer,
  ],
})
export class AppModule {}
