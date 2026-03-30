-- Create email captures table for The Equalizer
CREATE TABLE IF NOT EXISTS public.email_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  audit_count INTEGER DEFAULT 0,
  last_audit_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.email_captures ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (for email capture)
CREATE POLICY "Allow public insert" ON public.email_captures 
  FOR INSERT WITH CHECK (true);

-- Allow updates from anyone (to increment audit count)
CREATE POLICY "Allow public update" ON public.email_captures 
  FOR UPDATE USING (true);

-- Allow select from anyone (to check if email exists)
CREATE POLICY "Allow public select" ON public.email_captures 
  FOR SELECT USING (true);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS email_captures_email_idx ON public.email_captures (email);
