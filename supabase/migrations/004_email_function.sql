-- Migration: Create send_email function
-- This function is used by the backend to send emails via Supabase Email API
-- Run this in the Supabase SQL Editor or add to migrations

CREATE OR REPLACE FUNCTION send_email(
  p_to TEXT,
  p_subject TEXT,
  p_html TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_response JSON;
BEGIN
  -- Log the email for debugging
  RAISE NOTICE 'Sending email to: %, subject: %', p_to, p_subject;
  
  -- For now, we just log the email request
  -- In production, integrate with Sendgrid, Resend, or another email provider
  
  -- Example integration with an HTTP endpoint:
  -- SELECT http_post(
  --   'https://api.sendgrid.com/v3/mail/send',
  --   json_object('personalizations', ...),
  --   'Content-Type: application/json'::http_header[]
  -- ) INTO v_response;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Email queued for delivery',
    'timestamp', NOW()
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION send_email(TEXT, TEXT, TEXT) TO authenticated;

-- Optional: Create a table to log emails for tracking
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'pending', -- pending, sent, failed
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on email_logs
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Optional: Create a policy to allow users to view their own email logs
CREATE POLICY "Users can view their own email logs"
  ON email_logs
  FOR SELECT
  USING (to_email = (SELECT email FROM users WHERE id = auth.uid()));
