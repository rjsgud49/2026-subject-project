import { randomBytes } from 'crypto';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { UPLOAD_ROOT } from './upload.constants';

/** 강의·피드백 등 공통 로컬 디스크 저장 (파일명: 타임스탬프-랜덤+확장자) */
export function p2DiskStorage() {
  return diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_ROOT),
    filename: (_req, file, cb) => {
      const ext = extname(file.originalname || '').substring(0, 50);
      cb(null, `${Date.now()}-${randomBytes(8).toString('hex')}${ext}`);
    },
  });
}
