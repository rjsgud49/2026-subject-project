import { useEffect, useState } from 'react';
import { api, type AuthUser, type UserRole } from '../../lib/api';

export default function AdminUsers() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState<number | null>(null);

  function load() {
    setErr('');
    api.admin
      .users()
      .then(setUsers)
      .catch((e: Error) => setErr(e.message));
  }

  useEffect(() => {
    load();
  }, []);

  async function changeRole(id: number, role: UserRole) {
    setMsg('');
    setBusy(id);
    try {
      await api.admin.updateRole(id, role);
      setMsg('역할이 저장되었습니다.');
      load();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : '저장 실패');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="page-pad">
      <h1 className="page-title">회원·역할</h1>
      <p className="muted">사용자 역할을 변경합니다. 본인 계정도 주의해 수정하세요.</p>
      {err && <div className="alert error">{err}</div>}
      {msg && <div className="alert ok">{msg}</div>}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>이메일</th>
              <th>이름</th>
              <th>역할</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td className="mono">{u.email}</td>
                <td>{u.name}</td>
                <td>
                  <select
                    className="select-inline"
                    value={u.role}
                    disabled={busy === u.id}
                    onChange={(e) => void changeRole(u.id, e.target.value as UserRole)}
                    aria-label={`${u.email} 역할`}
                  >
                    <option value="student">student</option>
                    <option value="teacher">teacher</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
