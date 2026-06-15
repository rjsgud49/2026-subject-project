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

-- p3_payment_orders (기존 테이블에 컬럼 추가 — camelCase 잔재 호환)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'p3_payment_orders') THEN
    ALTER TABLE p3_payment_orders ADD COLUMN IF NOT EXISTS order_type varchar(20) DEFAULT 'course';
    ALTER TABLE p3_payment_orders ADD COLUMN IF NOT EXISTS feedback_plan varchar(20);
    ALTER TABLE p3_payment_orders ADD COLUMN IF NOT EXISTS course_ids_json text DEFAULT '[]';
    ALTER TABLE p3_payment_orders ADD COLUMN IF NOT EXISTS goods_name varchar(120);
    ALTER TABLE p3_payment_orders ADD COLUMN IF NOT EXISTS nice_tid varchar(40);
    ALTER TABLE p3_payment_orders ADD COLUMN IF NOT EXISTS nice_result_code varchar(10);
    ALTER TABLE p3_payment_orders ADD COLUMN IF NOT EXISTS nice_result_msg varchar(200);
    ALTER TABLE p3_payment_orders ADD COLUMN IF NOT EXISTS paid_at timestamptz;
    -- 구버전 camelCase 컬럼이 있으면 snake_case 로 이전
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'p3_payment_orders' AND column_name = 'orderType') THEN
      UPDATE p3_payment_orders SET order_type = COALESCE(order_type, "orderType") WHERE order_type IS NULL;
    END IF;
  ELSE
    CREATE TABLE p3_payment_orders (
      id serial PRIMARY KEY,
      order_id varchar(64) NOT NULL UNIQUE,
      user_id int NOT NULL,
      order_type varchar(20) NOT NULL DEFAULT 'course',
      feedback_plan varchar(20),
      course_ids_json text NOT NULL DEFAULT '[]',
      amount int NOT NULL,
      goods_name varchar(120) NOT NULL,
      status varchar(20) NOT NULL DEFAULT 'pending',
      nice_tid varchar(40),
      nice_result_code varchar(10),
      nice_result_msg varchar(200),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      paid_at timestamptz
    );
  END IF;
END $$;

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

-- p3_notification_subscriptions
CREATE TABLE IF NOT EXISTS p3_notification_subscriptions (
  id serial PRIMARY KEY,
  user_id int NOT NULL,
  event_type varchar(40) NOT NULL,
  channel varchar(20) NOT NULL,
  destination varchar(255) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_type, channel)
);

-- p3_audit_logs
CREATE TABLE IF NOT EXISTS p3_audit_logs (
  id bigserial PRIMARY KEY,
  actor_id int,
  action varchar(80) NOT NULL,
  resource_type varchar(40),
  resource_id varchar(64),
  meta_json text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- p3_webhook_endpoints
CREATE TABLE IF NOT EXISTS p3_webhook_endpoints (
  id serial PRIMARY KEY,
  url varchar(500) NOT NULL,
  secret varchar(128),
  events_json text NOT NULL DEFAULT '[]',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- p3_feedback_ticket_wallets
CREATE TABLE IF NOT EXISTS p3_feedback_ticket_wallets (
  id serial PRIMARY KEY,
  user_id int NOT NULL UNIQUE,
  doc_tickets int NOT NULL DEFAULT 0,
  video_tickets int NOT NULL DEFAULT 0,
  premium_tickets int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
