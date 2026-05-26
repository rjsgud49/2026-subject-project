import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private requests = 0;
  private errors = 0;
  private startedAt = Date.now();

  recordRequest(isError = false) {
    this.requests += 1;
    if (isError) this.errors += 1;
  }

  snapshot() {
    const uptimeSec = Math.floor((Date.now() - this.startedAt) / 1000);
    return {
      uptime_sec: uptimeSec,
      http_requests_total: this.requests,
      http_errors_total: this.errors,
      error_rate:
        this.requests > 0
          ? Math.round((this.errors / this.requests) * 10000) / 100
          : 0,
    };
  }
}
