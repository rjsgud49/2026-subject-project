#!/usr/bin/env bash
# GitHub Actions → EC2 배포 Secret 한 번에 등록
# 사용 (대화형):
#   cd p3/deploy && bash setup-github-actions.sh
# 사용 (환경변수):
#   EC2_HOST=1.2.3.4 EC2_USER=ec2-user EC2_PASSWORD='비밀번호' bash setup-github-actions.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI가 필요합니다: https://cli.github.com/"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub 로그인이 필요합니다: gh auth login"
  exit 1
fi

prompt() {
  local var_name="$1"
  local label="$2"
  local secret="${!var_name:-}"
  if [[ -z "$secret" ]]; then
    read -r -p "$label: " secret
  fi
  printf -v "$var_name" '%s' "$secret"
}

prompt EC2_HOST "EC2 공인 IP 또는 도메인 (예: 3.34.12.34 또는 olp.example.com)"
prompt EC2_USER "SSH 사용자 (Amazon Linux: ec2-user, Ubuntu: ubuntu)"
prompt EC2_PASSWORD "SSH 비밀번호"

if [[ -z "${EC2_HOST}" || -z "${EC2_USER}" || -z "${EC2_PASSWORD}" ]]; then
  echo "EC2_HOST, EC2_USER, EC2_PASSWORD 는 필수입니다."
  exit 1
fi

if [[ -z "${EC2_PORT:-}" ]]; then
  read -r -p "SSH 포트 [22]: " EC2_PORT
fi
EC2_PORT="${EC2_PORT:-22}"

echo ""
echo "==> GitHub Secrets 등록 (저장소: $(gh repo view --json nameWithOwner -q .nameWithOwner))"
gh secret set EC2_HOST --body "$EC2_HOST"
gh secret set EC2_USER --body "$EC2_USER"
gh secret set EC2_PASSWORD --body "$EC2_PASSWORD"
gh secret set EC2_PORT --body "$EC2_PORT"

echo ""
echo "==> SSH 연결 테스트"
if command -v sshpass >/dev/null 2>&1; then
  sshpass -p "$EC2_PASSWORD" ssh -o StrictHostKeyChecking=accept-new -p "$EC2_PORT" \
    "${EC2_USER}@${EC2_HOST}" 'echo "SSH OK — $(hostname)"'
else
  echo "sshpass 미설치 — 수동 확인: ssh -p $EC2_PORT ${EC2_USER}@${EC2_HOST}"
fi

echo ""
echo "완료. 다음 중 하나로 배포를 실행하세요:"
echo "  1) main 브랜치에 push"
echo "  2) GitHub → Actions → Deploy to EC2 → Run workflow"
echo ""
echo "서버 최초 설정은 docs/p3/github-actions-배포가이드.md 를 참고하세요."
