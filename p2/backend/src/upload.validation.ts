import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import type { Express } from 'express';

const VIDEO_EXT = new Set([
  '.mp4',
  '.webm',
  '.mov',
  '.m4v',
  '.avi',
  '.mkv',
  '.ogv',
]);

/** 강의 영상 업로드: video/* 또는 일반적인 영상 확장자 */
export function assertVideoCourseUpload(file: Express.Multer.File) {
  const mime = (file.mimetype || '').toLowerCase();
  if (mime.startsWith('video/')) return;
  const ext = extname(file.originalname || '').toLowerCase();
  if (VIDEO_EXT.has(ext)) return;
  throw new BadRequestException(
    '강의에는 영상 파일만 업로드할 수 있습니다. (예: mp4, webm, mov)',
  );
}

/** 피드백 학생 첨부: 문서·이미지·영상·zip 등 */
export function assertStudentFeedbackUpload(file: Express.Multer.File) {
  const mime = (file.mimetype || '').toLowerCase();
  if (mime.startsWith('image/')) return;
  if (mime === 'application/pdf') return;
  if (mime.startsWith('video/')) return;
  if (
    mime ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mime === 'application/msword'
  )
    return;
  if (mime === 'application/zip' || mime === 'application/x-zip-compressed') return;
  if (mime === 'text/plain') return;
  if (mime === 'application/x-hwp' || mime.includes('hwp')) return;
  const ext = extname(file.originalname || '').toLowerCase();
  const ok = [
    '.pdf',
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.gif',
    '.doc',
    '.docx',
    '.zip',
    '.txt',
    '.hwp',
  ].includes(ext);
  if (ok) return;
  throw new BadRequestException(
    '피드백 첨부는 이미지, PDF, 문서, 영상, zip 등만 업로드할 수 있습니다.',
  );
}

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp']);

/** 강의 썸네일·프로필 배너 등 이미지 전용 */
export function assertTeacherImageUpload(file: Express.Multer.File) {
  const mime = (file.mimetype || '').toLowerCase();
  if (mime.startsWith('image/')) return;
  const ext = extname(file.originalname || '').toLowerCase();
  if (IMAGE_EXT.has(ext)) return;
  throw new BadRequestException(
    '이미지 파일만 업로드할 수 있습니다. (jpg, png, webp, gif 등)',
  );
}
