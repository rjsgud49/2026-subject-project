-- P3 운영 DB 스키마 보정 (NODE_ENV=production 에서 synchronize=false 일 때 1회 실행)
-- EC2: psql -U postgres -d p2_lms -f scripts/migrate-production.sql

-- p2_users (P3 추가 컬럼)
ALTER TABLE p2_users ADD COLUMN IF NOT EXISTS phone varchar(20);
ALTER TABLE p2_users ADD COLUMN IF NOT EXISTS teacher_expertise varchar(120);
ALTER TABLE p2_users ADD COLUMN IF NOT EXISTS password_reset_token varchar(64);
ALTER TABLE p2_users ADD COLUMN IF NOT EXISTS password_reset_expires timestamptz;

-- p2_courses (필터·메타)
ALTER TABLE p2_courses ADD COLUMN IF NOT EXISTS category varchar(50);
ALTER TABLE p2_courses ADD COLUMN IF NOT EXISTS interview_type varchar(50);
ALTER TABLE p2_courses ADD COLUMN IF NOT EXISTS difficulty varchar(20);

-- p3_payment_orders camelCase→snake_case: scripts/migrate-payment-orders.sql 도 실행하세요.
-- p3_reviews
CREATE TABLE IF NOT EXISTS p3_reviews (
  id serial PRIMARY KEY,
  user_id int,
  display_name varchar(30) NOT NULL,
  tagline varchar(40),
  rating int NOT NULL,
  text varchar(240) NOT NULL,
  is_approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE p3_reviews ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT true;

-- p3_study_notes
CREATE TABLE IF NOT EXISTS p3_study_notes (
  id bigserial PRIMARY KEY,
  enrollment_id bigint NOT NULL,
  video_id varchar(64) NOT NULL,
  content text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id, video_id)
);

-- p3_notification_subscriptions / webhooks: scripts/migrate-ops-tables.sql 실행

-- p3_audit_logs
CREATE TABLE IF NOT EXISTS p3_audit_logs (
  id bigserial PRIMARY KEY,
  user_id bigint,
  action varchar(80) NOT NULL,
  resource varchar(80) NOT NULL,
  resource_id varchar(64),
  meta_json text,
  ip varchar(64),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE p3_audit_logs ADD COLUMN IF NOT EXISTS user_id bigint;
ALTER TABLE p3_audit_logs ADD COLUMN IF NOT EXISTS resource varchar(80) NOT NULL DEFAULT '';
ALTER TABLE p3_audit_logs ADD COLUMN IF NOT EXISTS resource_id varchar(64);
ALTER TABLE p3_audit_logs ADD COLUMN IF NOT EXISTS meta_json text;
ALTER TABLE p3_audit_logs ADD COLUMN IF NOT EXISTS ip varchar(64);
ALTER TABLE p3_audit_logs ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'p3_audit_logs' AND column_name = 'actor_id'
  ) THEN
    UPDATE p3_audit_logs SET user_id = actor_id WHERE user_id IS NULL AND actor_id IS NOT NULL;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'p3_audit_logs' AND column_name = 'resource_type'
  ) THEN
    UPDATE p3_audit_logs SET resource = resource_type WHERE resource IS NULL OR resource = '';
  END IF;
END $$;

-- p3_webhook_endpoints: scripts/migrate-ops-tables.sql

-- p3_feedback_ticket_wallets: scripts/migrate-ops-tables.sql