import 'dotenv/config';
import { mkdirSync, existsSync } from 'fs';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { UPLOAD_ROOT } from './upload.constants';

async function bootstrap() {
  if (!existsSync(UPLOAD_ROOT)) {
    mkdirSync(UPLOAD_ROOT, { recursive: true });
  }
  const app = await NestFactory.create(AppModule);
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production',
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5174',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port, '0.0.0.0');
  const base = `http://127.0.0.1:${port}/api/v1`;
  Logger.log(`API ${base}  (PORT=${port}, 프론트 Vite 프록시와 동일 포트여야 합니다)`);
}
bootstrap();
