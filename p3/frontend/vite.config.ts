import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const DEFAULT_PORT = 3000;

/** `p3/backend/.env`의 PORT — Nest와 Vite 프록시 포트를 맞추기 위함 */
function readPortFromBackendDotEnv(filePath: string): number | null {
  if (!existsSync(filePath)) return null;
  try {
    const text = readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
    for (const line of text.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const m = t.match(/^PORT\s*=\s*"?(\d+)"?\s*$/i);
      if (m) {
        const n = parseInt(m[1], 10);
        if (Number.isFinite(n) && n > 0 && n < 65536) return n;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendEnvPath = resolve(process.cwd(), '../backend/.env');
  const portFromFile = readPortFromBackendDotEnv(backendEnvPath);
  const inferredPort = portFromFile ?? DEFAULT_PORT;
  const inferredTarget = `http://127.0.0.1:${inferredPort}`;
  const target = env.VITE_API_PROXY_TARGET || inferredTarget;

  return {
    plugins: [
      react(),
      {
        name: 'p3-log-api-proxy',
        configureServer() {
          console.info(`[vite] /api → ${target}`);
          if (!env.VITE_API_PROXY_TARGET && portFromFile == null) {
            console.info(
              `[vite] (힌트) ${backendEnvPath} 없음 → 기본 포트 ${DEFAULT_PORT}. 백엔드 PORT가 다르면 p3/backend/.env에 PORT=... 추가 또는 프론트 .env에 VITE_API_PROXY_TARGET 설정`,
            );
          }
        },
      },
    ],
    server: {
      port: 5174,
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
        },
      },
    },
  };
});
