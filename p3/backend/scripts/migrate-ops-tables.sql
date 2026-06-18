-- ops 테이블 스키마 보정 (migrate-production.sql 의 구버전 CREATE 와 TypeORM 엔티티 불일치 해결)
-- 결제 return 500: webhooks.enabled / notification_subscriptions.enabled 컬럼 없음
-- EC2: export PGPASSWORD=... && psql -h localhost -U postgres -d p2_lms -f scripts/migrate-ops-tables.sql

DROP TABLE IF EXISTS p3_notification_subscriptions;
DROP TABLE IF EXISTS p3_webhook_endpoints;

CREATE TABLE p3_webhook_endpoints (
  id BIGSERIAL PRIMARY KEY,
  name varchar(120) NOT NULL,
  url varchar(500) NOT NULL,
  secret varchar(128) NOT NULL,
  events_json text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE p3_notification_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id bigint NOT NULL,
  channel varchar(20) NOT NULL,
  target varchar(500) NOT NULL,
  event_types_json text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_p3_notif_user_channel_target UNIQUE (user_id, channel, target)
);

-- 피드백 이용권 지갑 (운영 DB snake_case — 엔티티 feedback-ticket-wallet.entity.ts 와 동일)
CREATE TABLE IF NOT EXISTS p3_feedback_ticket_wallets (
  id serial PRIMARY KEY,
  user_id int NOT NULL UNIQUE,
  doc_tickets int NOT NULL DEFAULT 0,
  video_tickets int NOT NULL DEFAULT 0,
  premium_tickets int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
