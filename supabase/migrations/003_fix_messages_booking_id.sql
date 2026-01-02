-- Fix booking_id to be nullable in messages table
-- booking_id should be optional for direct messages between users

ALTER TABLE messages 
ALTER COLUMN booking_id DROP NOT NULL;

-- Add comment to clarify
COMMENT ON COLUMN messages.booking_id IS 'Optional booking reference - null for direct messages';
