import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async health() {
    let db = 'ok';
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      db = 'error';
    }
    return {
      ok: db === 'ok',
      service: 'p3-lms',
      db,
      ts: new Date().toISOString(),
    };
  }
}
