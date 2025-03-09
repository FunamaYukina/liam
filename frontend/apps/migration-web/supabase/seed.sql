-- テストデータの挿入
INSERT INTO pr_comments (
  pr_number,
  file_path,
  line_number,
  comment
) VALUES (
  1,  -- テスト用PR番号
  'README.md',
  1,
  'テストコメント from webhook'
); 
