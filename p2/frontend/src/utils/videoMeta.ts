/** 로컬 영상 파일의 재생 길이(초, 내림) — 브라우저 메타데이터 기준 */
export function getVideoDurationSeconds(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const blobUrl = URL.createObjectURL(file);
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.muted = true;
    v.playsInline = true;
    const cleanup = () => {
      URL.revokeObjectURL(blobUrl);
      v.removeAttribute('src');
    };
    v.onloadedmetadata = () => {
      const d = v.duration;
      cleanup();
      if (!Number.isFinite(d) || d <= 0) resolve(0);
      else resolve(Math.floor(d));
    };
    v.onerror = () => {
      cleanup();
      reject(new Error('영상 길이를 읽을 수 없습니다.'));
    };
    v.src = blobUrl;
  });
}
