import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { loadApiEnv } from '@mec/shared';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

async function bootstrap() {
  const env = loadApiEnv();

  const app = await NestFactory.create(AppModule);
  const httpAdapter = app.getHttpAdapter().getInstance();

  httpAdapter.disable('x-powered-by');
  app.use(helmet());
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: env.WEB_ORIGIN,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
    maxAge: 600,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  if (env.NODE_ENV === 'production') {
    // Behind a hosting proxy (Vercel/Neon), trust one hop so secure cookies and
    // client IPs are read correctly. Never trust arbitrary forwarded headers.
    httpAdapter.set('trust proxy', 1);
  }

  app.enableShutdownHooks();

  await app.listen(env.API_PORT);
  console.log(`API listening on http://localhost:${env.API_PORT}/api`);
}

bootstrap().catch((error) => {
  console.error('Failed to start API', error);
  process.exit(1);
});
