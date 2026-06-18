#!/usr/bin/env bash
# EC2 최초 1회 — 저장소 클론·Node·PM2·nginx 준비
# 서버에서 실행: bash ec2-first-setup.sh [git-repo-url]
set -euo pipefail

REPO_URL="${1:-https://github.com/rjsgud49/2026-subject-project.git}"
PROJECT_DIR="$HOME/2026-subject-project"

echo "==> 패키지 (Amazon Linux 2023 기준, Ubuntu는 apt로 대체)"
if command -v dnf >/dev/null 2>&1; then
  sudo dnf install -y git nginx
elif command -v apt-get >/dev/null 2>&1; then
  sudo apt-get update && sudo apt-get install -y git nginx
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 설치 (nvm)"
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  # shellcheck disable=SC1091
  source "$HOME/.nvm/nvm.sh"
  nvm install 20
  nvm use 20
fi

if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

echo "==> 저장소"
if [[ ! -d "$PROJECT_DIR/.git" ]]; then
  git clone "$REPO_URL" "$PROJECT_DIR"
else
  echo "이미 클론됨: $PROJECT_DIR"
fi

cd "$PROJECT_DIR/p3/backend"
if [[ ! -f .env ]]; then
  cp .env.example .env
  echo ".env 를 만듦 — nano .env 로 DB·결제 키를 입력하세요."
fi

npm install
npm run build
pm2 start ecosystem.config.cjs || pm2 restart p3-backend --update-env

cd "$PROJECT_DIR/p3/frontend"
NODE_ENV=development npm install --include=dev
npm run build

echo ""
echo "==> nginx (선택)"
echo "  sudo cp $PROJECT_DIR/p3/deploy/nginx-olp.example.conf /etc/nginx/conf.d/olp.conf"
echo "  sudo nginx -t && sudo systemctl enable --now nginx"
echo ""
echo "최초 DB 마이그레이션: cd $PROJECT_DIR/p3/backend && bash scripts/ec2-recover.sh"
echo "GitHub Actions Secret 등록: 로컬 PC에서 bash p3/deploy/setup-github-actions.sh"
