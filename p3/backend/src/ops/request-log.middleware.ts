import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { MetricsService } from './metrics.service';

@Injectable()
export class RequestLogMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly metrics: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const id = randomUUID().slice(0, 8);
    const start = Date.now();
    (req as Request & { requestId?: string }).requestId = id;

    res.on('finish', () => {
      const ms = Date.now() - start;
      const err = res.statusCode >= 500;
      this.metrics.recordRequest(err);
      this.logger.log(
        `${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms [${id}]`,
      );
    });
    next();
  }
}
