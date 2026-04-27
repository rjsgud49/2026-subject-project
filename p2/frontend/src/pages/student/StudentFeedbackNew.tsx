import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paperclip, Trash2, Upload } from 'lucide-react';
import Button from '../../components/Button';
import { api, type FeedbackAttachmentRef } from '../../lib/api';

const MAX_FILES = 8;

export default function StudentFeedbackNew() {
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [attachments, setAttachments] = useState<FeedbackAttachmentRef[]>([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function onPickFiles(ev: React.ChangeEvent<HTMLInputElement>) {
    const files = ev.target.files ? Array.from(ev.target.files) : [];
    ev.target.value = '';
    if (!files.length) return;
    setErr('');
    if (attachments.length + files.length > MAX_FILES) {
      setErr(`첨부는 최대 ${MAX_FILES}개까지 가능합니다.`);
      return;
    }
    setUploading(true);
    try {
      const next = [...attachments];
      for (const file of files) {
        if (next.length >= MAX_FILES) break;
        const r = await api.feedback.uploadStudentFile(file);
        next.push({ url: r.url, filename: r.filename || file.name });
      }
      setAttachments(next);
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : '업로드 실패');
    } finally {
      setUploading(false);
    }
  }

  function removeAttachment(url: string) {
    setAttachments((a) => a.filter((x) => x.url !== url));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await api.feedback.create({
        title,
        question,
        attachments: attachments.length ? attachments : undefined,
      });
      nav('/student/feedback');
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : '요청 실패');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-pad narrow-form">
      <h1 className="page-title">피드백 요청하기</h1>
      <p className="muted">면접 답변, 포트폴리오, 자기소개서 관련 질문을 남기세요. 자료는 파일로 올리면 강사가 바로 열람할 수 있습니다.</p>

      <div
        role="note"
        style={{
          margin: '16px 0 20px',
          padding: '14px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-primary-200)',
          background: 'var(--color-primary-50)',
          fontSize: 13,
          lineHeight: 1.65,
          color: 'var(--color-neutral-800)',
        }}
      >
        <strong style={{ display: 'block', marginBottom: 8, color: 'var(--color-primary-800)' }}>첨부 파일을 올리기 전에</strong>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>열어보아 <strong>내용·버전이 맞는 파일</strong>인지(최종본, 암호 해제 여부 등) 꼭 확인한 뒤 업로드해 주세요.</li>
          <li>선택 후 아래 목록에 나오는 <strong>파일 이름</strong>이 내 컴퓨터에서 본 이름과 같은지 확인해 주세요. 다르면 해당 파일을 제거하고 다시 선택해 주세요.</li>
          <li>허용되지 않는 형식이나 용량 초과 시 등록이 거절될 수 있습니다.</li>
        </ul>
      </div>

      <form className="form" onSubmit={(e) => void onSubmit(e)}>
        <label>
          제목
          <input
            className="ui-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            required
            placeholder="예) 1분 자기소개 피드백 요청"
          />
        </label>
        <label>
          질문 내용
          <textarea
            className="ui-textarea"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            minLength={5}
            rows={7}
            required
            placeholder="현재 답변/자료의 고민 포인트를 구체적으로 적어 주세요."
          />
        </label>

        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Paperclip size={16} />
            첨부 파일 (선택, 최대 {MAX_FILES}개)
          </div>
          <label
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--color-neutral-300)',
              cursor: uploading ? 'wait' : 'pointer',
              fontSize: 14,
              color: 'var(--color-neutral-700)',
              overflow: 'hidden',
            }}
          >
            <Upload size={16} />
            {uploading ? '업로드 중…' : '파일 선택'}
            <input
              type="file"
              multiple
              disabled={uploading}
              onChange={(e) => void onPickFiles(e)}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: uploading ? 'wait' : 'pointer',
                fontSize: 0,
              }}
            />
          </label>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--color-neutral-500)' }}>
            이미지, PDF, 문서(hwp/doc), 영상, zip 등 (서버 정책에 따라 일부 형식만 허용). 한글·특수문자 파일명도 그대로 표시됩니다.
          </p>
        </div>

        {attachments.length > 0 && (
          <ul style={{ listStyle: 'none', margin: '0 0 16px', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {attachments.map((a) => (
              <li
                key={a.url}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-neutral-200)',
                  background: 'var(--color-neutral-50)',
                  fontSize: 14,
                }}
              >
                <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {a.filename}
                </a>
                <button
                  type="button"
                  style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-error-600)' }}
                  onClick={() => removeAttachment(a.url)}
                  aria-label="첨부 제거"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {err && <div className="alert error">{err}</div>}
        <Button type="submit" disabled={loading || uploading}>
          {loading ? '등록 중…' : '요청 등록'}
        </Button>
      </form>
    </div>
  );
}
