const fs = require('fs');
const glob = require('glob'); // use standard fs since we know paths

const services = [
  'engagement-service', 'domains-service', 'analytics-service',
  'deploy-service', 'ai-service', 'billing-service',
  'owner-service', 'sites-service', 'commerce-service'
];

for (const service of services) {
  const file = `apps/${service}/src/main.ts`;
  let content = fs.readFileSync(file, 'utf8');

  // Extract everything BEFORE async function bootstrap
  const match = content.match(/^(.*?async function bootstrap\(\) \{)/s);
  if (!match) continue;
  
  const header = match[1];

  // Extract the bootstrap().catch part
  const match2 = content.match(/(\}\n*bootstrap\(\)\.catch[\s\S]*)$/);
  if (!match2) continue;
  
  const footer = match2[1];

  const replacement = `
  const logger = new Logger('${service}');

  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: new URL(process.env.REDIS_URL ?? 'redis://localhost:6379').hostname,
      port: Number(new URL(process.env.REDIS_URL ?? 'redis://localhost:6379').port) || 6379,
    },
  });

  try {
    await app.startAllMicroservices();
    logger.log('${service} listening on Redis transport');
  } catch (err: any) {
    logger.warn(\`Redis transport offline (\${err.message}). Service running in HTTP fallback mode.\`);
  }

  const healthPort = Number(process.env.HEALTH_PORT ?? 3000);
  await app.listen(healthPort);
  logger.log(\`Health endpoint listening on :\${healthPort}/health\`);
`;

  fs.writeFileSync(file, header + replacement + footer);
  console.log(`Updated ${file}`);
}
