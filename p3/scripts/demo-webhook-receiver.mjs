#!/usr/bin/env node
/**
 * P3 outbound Webhook 수신·HMAC 검증 데모
 * 사용: WEBHOOK_SECRET=등록시_받은_secret node p3/scripts/demo-webhook-receiver.mjs
 * ngrok http 9999 로 공개 URL을 /admin/ops Webhook에 등록
 */
import { createServer } from 'node:http';
import { createHmac, timingSafeEqual } from 'node:crypto';

const PORT = Number(process.env.PORT || 9999);
const SECRET = process.env.WEBHOOK_SECRET || '';

function verify(sigHeader, body) {
  if (!SECRET) return { ok: false, reason: 'WEBHOOK_SECRET 미설정' };
  const m = /^sha256=(.+)$/i.exec(sigHeader || '');
  if (!m) return { ok: false, reason: 'X-P3-Signature 형식 오류' };
  const expected = createHmac('sha256', SECRET).update(body).digest('hex');
  try {
    const a = Buffer.from(m[1], 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { ok: false, reason: '서명 불일치' };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: '서명 비교 실패' };
  }
}

const server = createServer((req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('P3 demo webhook receiver — POST only\n');
    return;
  }
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    const body = Buffer.concat(chunks).toString('utf8');
    const event = req.headers['x-p3-event'];
    const sig = req.headers['x-p3-signature'];
    const check = verify(sig, body);
    console.log('\n--- Webhook 수신 ---');
    console.log('X-P3-Event:', event);
    console.log('X-P3-Signature:', sig);
    console.log('HMAC 검증:', check.ok ? 'OK' : check.reason);
    console.log('Body:', body.slice(0, 500));
    res.writeHead(check.ok ? 200 : 401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ received: true, verified: check.ok }));
  });
});

server.listen(PORT, () => {
  console.log(`Demo webhook receiver http://127.0.0.1:${PORT}`);
  console.log(`WEBHOOK_SECRET ${SECRET ? '설정됨' : '없음 — 등록 시 받은 secret을 환경변수로 지정하세요'}`);
});
