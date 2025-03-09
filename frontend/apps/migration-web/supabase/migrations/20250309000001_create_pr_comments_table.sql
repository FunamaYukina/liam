CREATE TABLE pr_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pr_number INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  line_number INTEGER NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
); 
