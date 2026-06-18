#!/usr/bin/env bash
# EC2 프론트 빌드 — NODE_ENV=production 이면 devDependencies(vite) 가 설치되지 않음
set -euo pipefail
cd "$(dirname "$0")/.."
echo "==> npm install (vite 포함)"
NODE_ENV=development npm install --include=dev
echo "==> vite 확인"
test -x node_modules/.bin/vite || test -f node_modules/vite/bin/vite.js
echo "==> build"
npm run build
test -f dist/index.html
echo "==> 완료: dist/ ($(du -sh dist | cut -f1))"
