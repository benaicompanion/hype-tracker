-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read posts
CREATE POLICY "Authenticated users can read posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

-- Only the admin can insert posts (check via auth.jwt() email)
-- Note: You'll need to set ADMIN_EMAIL in your app and use a service role
-- or implement this check in your application code.
-- For simplicity, we allow authenticated inserts and handle admin check in the app.
CREATE POLICY "Authenticated users can insert posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create storage bucket for post images
-- Run this in the Supabase dashboard SQL editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true);
