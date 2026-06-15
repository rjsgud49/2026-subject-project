import { config } from 'dotenv';
import { join } from 'path';

/** AppModule import 전에 반드시 실행 — TypeORM이 .env DB_PASSWORD 를 읽도록 */
config({ path: join(__dirname, '..', '.env') });
