import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health() {
    return { ok: true, service: 'p2-lms', ts: new Date().toISOString() };
  }
}
