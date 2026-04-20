import { join, resolve } from 'path';

/**
 * 업로드 파일(영상·피드백 첨부 등) 저장 루트 — **서버가 실행되는 PC의 로컬 디스크**.
 * - 기본: `백엔드 작업 디렉터리/uploads/p2` (예: `p2/backend/uploads/p2`)
 * - `P2_UPLOAD_DIR`에 절대 경로를 주면 그 폴더를 사용합니다.
 */
const fromEnv = process.env.P2_UPLOAD_DIR?.trim();
export const UPLOAD_ROOT =
  fromEnv && fromEnv.length > 0 ? resolve(fromEnv) : join(process.cwd(), 'uploads', 'p2');
