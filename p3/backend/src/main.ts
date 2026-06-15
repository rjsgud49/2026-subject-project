import './load-env';
import { mkdirSync, existsSync } from 'fs';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { UPLOAD_ROOT } from './upload.constants';
import { readPaymentEnv } from './payments/payment-gateway.util';

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

  if (process.env.DB_SYNC === 'true') {
    Logger.warn(
      'DB_SYNC=true — TypeORM이 스키마를 자동 동기화합니다. 완료 후 .env 에서 DB_SYNC 를 제거하세요.',
    );
  }
  const payClientId = readPaymentEnv('PAYMENT_CLIENT_ID', 'NICEPAY_CLIENT_ID');
  const paySecret = readPaymentEnv('PAYMENT_SECRET_KEY', 'NICEPAY_SECRET_KEY');
  if (payClientId && paySecret) {
    const returnBase =
      readPaymentEnv('PAYMENT_RETURN_BASE', 'NICEPAY_RETURN_BASE') ||
      `http://127.0.0.1:${port}`;
    Logger.log(
      `결제 PG 설정됨 (return: ${returnBase.replace(/\/$/, '')}/api/v1/payments/return)`,
    );
  } else {
    Logger.warn(
      '결제 PG 미설정 — p3/backend/.env 에 PAYMENT_CLIENT_ID·PAYMENT_SECRET_KEY (또는 NICEPAY_*) 를 설정하세요.',
    );
  }
}
bootstrap();
