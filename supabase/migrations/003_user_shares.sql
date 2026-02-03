-- User shares table
CREATE TABLE IF NOT EXISTS user_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  initial_investment NUMERIC NOT NULL DEFAULT 0,
  share_percentage NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_shares ENABLE ROW LEVEL SECURITY;

-- Users can only read their own share data
CREATE POLICY "Users can read own share" ON user_shares
  FOR SELECT TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- Admin can read all shares (for admin page)
CREATE POLICY "Admin can read all shares" ON user_shares
  FOR SELECT TO authenticated
  USING (true);

-- Insert share data
INSERT INTO user_shares (email, initial_investment, share_percentage) VALUES
  ('11kaplandh@gmail.com', 3500, 16.27906977),
  ('akhendi@gmail.com', 2000, 9.302325581),
  ('benevans284@gmail.com', 5000, 23.25581395),
  ('jorgen22@gmail.com', 2000, 9.302325581),
  ('bryanlinton2@gmail.com', 5000, 23.25581395),
  ('jboris244@gmail.com', 2000, 9.302325581),
  ('ryanbaxter1019@gmail.com', 2000, 9.302325581),
  ('rweismanjr@gmail.com', 0, 0)
ON CONFLICT (email) DO UPDATE SET
  initial_investment = EXCLUDED.initial_investment,
  share_percentage = EXCLUDED.share_percentage;
