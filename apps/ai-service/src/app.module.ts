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

import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';

function parseUpstashRedisOptions(urlStr?: string) {
  if (!urlStr) return { host: 'localhost', port: 6379 };
  try {
    const u = new URL(urlStr);
    const isUpstashOrTls = u.protocol === 'rediss:' || u.hostname.includes('upstash.io');
    const config: any = {
      host: u.hostname || 'localhost',
      port: Number(u.port) || 6379,
      family: 4,
      retryStrategy: () => 1000,
      enableOfflineQueue: false,
    };
    if (u.password) config.password = decodeURIComponent(u.password);
    if (u.username) config.username = decodeURIComponent(u.username);
    if (isUpstashOrTls) {
      config.tls = { rejectUnauthorized: false };
    }
    return config;
  } catch {
    return { host: 'localhost', port: 6379 };
  }
}

const REDIS_OPTIONS = parseUpstashRedisOptions(process.env.REDIS_URL);

@Module({
  imports: [
    TerminusModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URL') || config.get<string>('MONGODB_URI') || 'mongodb://mongodb:27017/ai_db',
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: REDIS_OPTIONS,
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: 'ai-generation' },
      { name: 'events' }
    ),
    ClientsModule.register([
      {
        name: 'SITES_SERVICE',
        transport: Transport.REDIS,
        options: REDIS_OPTIONS,
      },
      {
        name: 'IDENTITY_SERVICE',
        transport: Transport.REDIS,
        options: REDIS_OPTIONS,
      },
    ]),
  ],
  controllers: [AIController, HealthController],
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
