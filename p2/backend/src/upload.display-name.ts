/**
 * multipart의 file.originalname은 RFC/인코딩 이슈로 한글 등이 깨질 수 있어,
 * 클라이언트가 보낸 originalFilename(UTF-8 폼 필드)을 우선 사용한다.
 */
export function resolveUploadDisplayName(
  fromBody: string | string[] | undefined,
  multerOriginalname: string | undefined,
): string {
  const fromField =
    typeof fromBody === 'string'
      ? fromBody
      : Array.isArray(fromBody) && typeof fromBody[0] === 'string'
        ? fromBody[0]
        : '';
  const raw = fromField.trim() || (multerOriginalname ?? '').trim();
  const noNull = raw.replace(/\0/g, '');
  const base = noNull.replace(/^.*[/\\]/, '');
  const name = base.length > 0 ? base : '파일';
  return name.length > 255 ? name.slice(0, 255) : name;
}
