#!/usr/bin/env bash
# EC2 복구 — Bad Gateway / 로그인 불가 시 1회 실행
# 사용: cd ~/2026-subject-project/p3/backend && bash scripts/ec2-recover.sh
set -euo pipefail

cd "$(dirname "$0")/.."
ENV_FILE=".env"

echo "==> .env DB 설정"
grep '^DB_' "$ENV_FILE" || true

echo ""
echo "==> PostgreSQL 연결 테스트 (백엔드와 동일 비밀번호)"
export PGPASSWORD
PGPASSWORD=$(grep '^DB_PASSWORD=' "$ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")
DB_USER=$(grep '^DB_USER=' "$ENV_FILE" | cut -d= -f2-)
DB_NAME=$(grep '^DB_NAME=' "$ENV_FILE" | cut -d= -f2-)
DB_HOST=$(grep '^DB_HOST=' "$ENV_FILE" | cut -d= -f2-)
DB_PORT=$(grep '^DB_PORT=' "$ENV_FILE" | cut -d= -f2-)

if psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -c 'SELECT 1' >/dev/null 2>&1; then
  echo "DB 연결 OK"
  echo "==> SQL 마이그레이션"
  psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -f scripts/migrate-production.sql
else
  echo "DB 비밀번호 불일치 — sudo 로 postgres 비밀번호를 .env 와 맞춥니다"
  sudo -u postgres psql -c "ALTER USER ${DB_USER:-postgres} PASSWORD '${PGPASSWORD}';"
  psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -c 'SELECT 1'
  psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -f scripts/migrate-production.sql
fi
unset PGPASSWORD

if ! grep -q '^DB_SYNC=' "$ENV_FILE"; then
  echo "DB_SYNC=true" >> "$ENV_FILE"
  echo "==> DB_SYNC=true 추가 (스키마 자동 보정)"
fi

echo "==> 빌드·재시작"
npm install
npm run build
pm2 restart p3-backend --update-env || pm2 start ecosystem.config.cjs

sleep 2
echo "==> 헬스체크"
curl -sf "http://127.0.0.1:${PORT:-3000}/api/v1/health/live" && echo " OK" || {
  echo "실패 — pm2 logs p3-backend --err --lines 20"
  pm2 logs p3-backend --err --lines 20
  exit 1
}

echo ""
echo "복구 완료. .env 에서 DB_SYNC=true 줄을 삭제한 뒤 pm2 restart p3-backend --update-env 하세요."
