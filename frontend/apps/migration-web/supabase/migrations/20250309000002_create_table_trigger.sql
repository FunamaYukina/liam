-- ジョブログテーブルの作成
CREATE TABLE IF NOT EXISTS job_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL,
  record_id UUID NOT NULL,
  result JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 関数の作成
CREATE OR REPLACE FUNCTION handle_table_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- デバッグログ
  RAISE NOTICE 'Trigger executed: type=%, table=%, record=%', TG_OP, TG_TABLE_NAME, row_to_json(NEW);

  -- Next.js APIルートを呼び出す
  PERFORM net.http_post(
    url := 'http://host.docker.internal:3003/api/github-pr-comment',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'record', row_to_json(NEW),
      'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END
    )
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- エラーログ
  RAISE NOTICE 'Error in trigger: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの作成
CREATE TRIGGER pr_comments_changes
  AFTER INSERT OR UPDATE
  ON pr_comments
  FOR EACH ROW
  EXECUTE FUNCTION handle_table_changes(); 
