# GitHub Actions → EC2 자동 배포 (비밀번호 + 서버 주소)

`main` 브랜치 push 또는 Actions 수동 실행 시 EC2에 SSH로 접속해 `git pull` · 빌드 · PM2 재시작을 합니다.

---

## 한 번에 하기 (체크리스트)

| 순서 | 어디서 | 할 일 |
|------|--------|--------|
| 1 | EC2 | SSH 비밀번호 로그인 허용 (아래 §1) |
| 2 | EC2 | `ec2-first-setup.sh` 실행 (§2) |
| 3 | EC2 | `p3/backend/.env` 작성 + `ec2-recover.sh` (§3) |
| 4 | **내 PC** | `setup-github-actions.sh` 로 Secret 등록 (§4) |
| 5 | **내 PC** | `main` push 또는 Actions에서 Run workflow (§5) |

---

## §1. EC2 — SSH 비밀번호 로그인 허용

GitHub Actions는 **SSH 키 대신 비밀번호**(`EC2_PASSWORD`)로 접속합니다. 서버에서 root 비밀번호를 정한 뒤 SSH 설정을 바꿉니다.

```bash
# EC2에 SSH 접속 (콘솔·기존 키 등 아무 방법으로 1회)
sudo passwd ec2-user          # Amazon Linux 사용자 (Ubuntu면 ubuntu)

sudo sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config
sudo sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

**AWS 보안 그룹:** 인바운드 **22** (SSH), **80·443** (웹) 허용.

로컬에서 확인:

```bash
ssh ec2-user@<공인IP>
# 비밀번호 입력 후 접속되면 OK
```

---

## §2. EC2 — 최초 서버 준비 (1회)

저장소 URL이 다르면 인자로 넘깁니다.

```bash
curl -fsSL https://raw.githubusercontent.com/rjsgud49/2026-subject-project/main/p3/deploy/ec2-first-setup.sh -o /tmp/ec2-first-setup.sh
bash /tmp/ec2-first-setup.sh
# 또는 이미 clone 한 뒤:
# cd ~/2026-subject-project && bash p3/deploy/ec2-first-setup.sh
```

또는 수동:

```bash
git clone https://github.com/<본인계정>/2026-subject-project.git ~/2026-subject-project
cd ~/2026-subject-project/p3/backend
cp .env.example .env && nano .env
npm install && npm run build
pm2 start ecosystem.config.cjs
```

---

## §3. EC2 — `.env` · DB

```bash
cd ~/2026-subject-project/p3/backend
nano .env
```

필수 예:

```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=<DB비밀번호>
DB_NAME=p2_lms
CORS_ORIGIN=https://olp.rjsgud.com
```

스키마·502 복구:

```bash
bash scripts/ec2-recover.sh
```

---

## §4. 내 PC — GitHub Secret 한 번에 등록

필요: [GitHub CLI](https://cli.github.com/) + `gh auth login`

```bash
cd 2026-subject-project/p3/deploy
bash setup-github-actions.sh
```

입력 항목:

| Secret | 설명 | 예 |
|--------|------|-----|
| `EC2_HOST` | 공인 IP 또는 도메인 | `3.34.12.34` |
| `EC2_USER` | SSH 사용자 | `ec2-user` |
| `EC2_PASSWORD` | SSH 비밀번호 | §1에서 설정한 값 |
| `EC2_PORT` | SSH 포트 (선택) | `22` |

환경변수로 한 줄 실행:

```bash
EC2_HOST=3.34.12.34 EC2_USER=ec2-user EC2_PASSWORD='내비밀번호' bash p3/deploy/setup-github-actions.sh
```

웹 UI로 등록: **저장소 → Settings → Secrets and variables → Actions → New repository secret**

---

## §5. 배포 실행

1. **자동:** `main`에 push  
2. **수동:** GitHub → **Actions** → **Deploy to EC2** → **Run workflow**

성공 시 서버에서:

- `~/2026-subject-project` 최신 코드 `git pull`
- 백엔드 빌드 + `pm2 restart p3-backend`
- 프론트 `npm run build`
- `GET http://127.0.0.1:3000/api/v1/health` 통과

---

## 문제 해결

| 증상 | 확인 |
|----------|------|
| Actions `ssh: handshake failed` | EC2_HOST·PORT, 보안그룹 22, `PasswordAuthentication yes` |
| `Permission denied (password)` | EC2_USER·EC2_PASSWORD, `passwd ec2-user` 재설정 |
| `cd ~/2026-subject-project` 실패 | §2 clone 미완료 → 서버에서 clone |
| 헬스체크 실패 | `pm2 logs p3-backend`, `.env` DB 설정 |
| 502 (브라우저) | nginx, `curl http://127.0.0.1:3000/api/v1/health` |

Actions 로그: **Actions 탭 → 실패한 run → Deploy via SSH** 단계.

---

## 워크플로 파일

`.github/workflows/deploy.yml` — Secret 이름:

- `EC2_HOST`, `EC2_USER`, `EC2_PASSWORD`, `EC2_PORT`(선택, 기본 22)

`.env`는 Git에 없으므로 **서버에만** 두면 됩니다. Actions는 코드 배포만 담당합니다.
