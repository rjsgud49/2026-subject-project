-- p3_payment_orders: TypeORM camelCase → snake_case 컬럼 정리
-- EC2: export PGPASSWORD=... && psql -h localhost -U postgres -d p2_lms -f scripts/migrate-payment-orders.sql

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'p3_payment_orders'
  ) THEN
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
    RETURN;
  END IF;

  -- snake_case 컬럼 없으면 추가
  ALTER TABLE p3_payment_orders ADD COLUMN IF NOT EXISTS order_id varchar(64);
  ALTER TABLE p3_payment_orders ADD COLUMN IF NOT EXISTS user_id int;
  ALTER TABLE p3_payment_orders ADD COLUMN IF NOT EXISTS order_type varchar(20) DEFAULT 'course';
  ALTER TABLE p3_payment_orders ADD COLUMN IF NOT EXISTS feedback_plan varchar(20);
  ALTER TABLE p3_payment_orders ADD COLUMN IF NOT EXISTS course_ids_json text DEFAULT '[]';
  ALTER TABLE p3_payment_orders ADD COLUMN IF NOT EXISTS goods_name varchar(120);
  ALTER TABLE p3_payment_orders ADD COLUMN IF NOT EXISTS nice_tid varchar(40);
  ALTER TABLE p3_payment_orders ADD COLUMN IF NOT EXISTS nice_result_code varchar(10);
  ALTER TABLE p3_payment_orders ADD COLUMN IF NOT EXISTS nice_result_msg varchar(200);
  ALTER TABLE p3_payment_orders ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
  ALTER TABLE p3_payment_orders ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
  ALTER TABLE p3_payment_orders ADD COLUMN IF NOT EXISTS paid_at timestamptz;

  -- camelCase → snake_case 데이터 이전
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'p3_payment_orders' AND column_name = 'orderId') THEN
    EXECUTE 'UPDATE p3_payment_orders SET order_id = COALESCE(order_id, "orderId")';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'p3_payment_orders' AND column_name = 'userId') THEN
    EXECUTE 'UPDATE p3_payment_orders SET user_id = COALESCE(user_id, "userId")';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'p3_payment_orders' AND column_name = 'orderType') THEN
    EXECUTE 'UPDATE p3_payment_orders SET order_type = COALESCE(order_type, "orderType")';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'p3_payment_orders' AND column_name = 'feedbackPlan') THEN
    EXECUTE 'UPDATE p3_payment_orders SET feedback_plan = COALESCE(feedback_plan, "feedbackPlan")';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'p3_payment_orders' AND column_name = 'courseIdsJson') THEN
    EXECUTE 'UPDATE p3_payment_orders SET course_ids_json = COALESCE(course_ids_json, "courseIdsJson")';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'p3_payment_orders' AND column_name = 'goodsName') THEN
    EXECUTE 'UPDATE p3_payment_orders SET goods_name = COALESCE(goods_name, "goodsName")';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'p3_payment_orders' AND column_name = 'niceTid') THEN
    EXECUTE 'UPDATE p3_payment_orders SET nice_tid = COALESCE(nice_tid, "niceTid")';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'p3_payment_orders' AND column_name = 'niceResultCode') THEN
    EXECUTE 'UPDATE p3_payment_orders SET nice_result_code = COALESCE(nice_result_code, "niceResultCode")';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'p3_payment_orders' AND column_name = 'niceResultMsg') THEN
    EXECUTE 'UPDATE p3_payment_orders SET nice_result_msg = COALESCE(nice_result_msg, "niceResultMsg")';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'p3_payment_orders' AND column_name = 'createdAt') THEN
    EXECUTE 'UPDATE p3_payment_orders SET created_at = COALESCE(created_at, "createdAt")';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'p3_payment_orders' AND column_name = 'updatedAt') THEN
    EXECUTE 'UPDATE p3_payment_orders SET updated_at = COALESCE(updated_at, "updatedAt")';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'p3_payment_orders' AND column_name = 'paidAt') THEN
    EXECUTE 'UPDATE p3_payment_orders SET paid_at = COALESCE(paid_at, "paidAt")';
  END IF;

  -- camelCase 컬럼 제거
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'p3_payment_orders' AND column_name = 'orderId') THEN
    ALTER TABLE p3_payment_orders DROP COLUMN "orderId";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'p3_payment_orders' AND column_name = 'userId') THEN
    ALTER TABLE p3_payment_orders DROP COLUMN "userId";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'p3_payment_orders' AND column_name = 'orderType') THEN
    ALTER TABLE p3_payment_orders DROP COLUMN "orderType";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'p3_payment_orders' AND column_name = 'feedbackPlan') THEN
    ALTER TABLE p3_payment_orders DROP COLUMN "feedbackPlan";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'p3_payment_orders' AND column_name = 'courseIdsJson') THEN
    ALTER TABLE p3_payment_orders DROP COLUMN "courseIdsJson";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'p3_payment_orders' AND column_name = 'goodsName') THEN
    ALTER TABLE p3_payment_orders DROP COLUMN "goodsName";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'p3_payment_orders' AND column_name = 'niceTid') THEN
    ALTER TABLE p3_payment_orders DROP COLUMN "niceTid";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'p3_payment_orders' AND column_name = 'niceResultCode') THEN
    ALTER TABLE p3_payment_orders DROP COLUMN "niceResultCode";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'p3_payment_orders' AND column_name = 'niceResultMsg') THEN
    ALTER TABLE p3_payment_orders DROP COLUMN "niceResultMsg";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'p3_payment_orders' AND column_name = 'createdAt') THEN
    ALTER TABLE p3_payment_orders DROP COLUMN "createdAt";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'p3_payment_orders' AND column_name = 'updatedAt') THEN
    ALTER TABLE p3_payment_orders DROP COLUMN "updatedAt";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'p3_payment_orders' AND column_name = 'paidAt') THEN
    ALTER TABLE p3_payment_orders DROP COLUMN "paidAt";
  END IF;

  -- NOT NULL·UNIQUE 보강
  UPDATE p3_payment_orders SET order_type = 'course' WHERE order_type IS NULL;
  UPDATE p3_payment_orders SET course_ids_json = '[]' WHERE course_ids_json IS NULL;
  UPDATE p3_payment_orders SET created_at = now() WHERE created_at IS NULL;
  UPDATE p3_payment_orders SET updated_at = now() WHERE updated_at IS NULL;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'p3_payment_orders_order_id_key'
  ) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS p3_payment_orders_order_id_key ON p3_payment_orders (order_id);
  END IF;
END $$;
