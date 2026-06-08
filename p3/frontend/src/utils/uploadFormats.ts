/** 백엔드 upload.validation.ts 와 동일한 허용 목록 */

export const COURSE_VIDEO_EXTENSIONS = [
  '.mp4',
  '.webm',
  '.mov',
  '.m4v',
  '.avi',
  '.mkv',
  '.ogv',
] as const;

export const COURSE_VIDEO_MIME_PREFIXES = ['video/'] as const;

/** input accept 속성 */
export const COURSE_VIDEO_ACCEPT =
  'video/mp4,video/webm,video/quicktime,video/x-m4v,video/x-msvideo,video/x-matroska,video/ogg,.mp4,.webm,.mov,.m4v,.avi,.mkv,.ogv';

export const COURSE_VIDEO_FORMAT_LABEL = 'mp4, webm, mov, m4v, avi, mkv, ogv';

export const COURSE_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'] as const;

export const COURSE_IMAGE_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,image/bmp,.jpg,.jpeg,.png,.webp,.gif,.bmp';

export const COURSE_IMAGE_FORMAT_LABEL = 'jpg, jpeg, png, webp, gif';

function extOf(name: string): string {
  const i = name.lastIndexOf('.');
  if (i < 0) return '';
  return name.slice(i).toLowerCase();
}

export function isCourseVideoFile(file: File): boolean {
  const mime = (file.type || '').toLowerCase();
  if (COURSE_VIDEO_MIME_PREFIXES.some((p) => mime.startsWith(p))) return true;
  return COURSE_VIDEO_EXTENSIONS.includes(extOf(file.name) as (typeof COURSE_VIDEO_EXTENSIONS)[number]);
}

export function isCourseImageFile(file: File): boolean {
  const mime = (file.type || '').toLowerCase();
  if (mime.startsWith('image/')) return true;
  return COURSE_IMAGE_EXTENSIONS.includes(extOf(file.name) as (typeof COURSE_IMAGE_EXTENSIONS)[number]);
}

export function validateCourseVideoFile(file: File): string | null {
  if (isCourseVideoFile(file)) return null;
  return `영상 파일만 업로드할 수 있습니다. (${COURSE_VIDEO_FORMAT_LABEL})`;
}

export function validateCourseImageFile(file: File): string | null {
  if (isCourseImageFile(file)) return null;
  return `이미지 파일만 업로드할 수 있습니다. (${COURSE_IMAGE_FORMAT_LABEL})`;
}
