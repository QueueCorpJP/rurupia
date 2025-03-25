-- Messages table for storing chats between users and therapists
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    receiver_id UUID NOT NULL REFERENCES auth.users(id),
    content TEXT NOT NULL,
    image_url TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_id_idx ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS messages_timestamp_idx ON public.messages(timestamp);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages they sent or received" ON public.messages;
DROP POLICY IF EXISTS "Admin can view all messages" ON public.messages;

-- Allow users to view messages they sent or received
CREATE POLICY "Users can view their own messages" ON public.messages
FOR SELECT USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
);

-- Allow users to send messages
CREATE POLICY "Users can send messages" ON public.messages
FOR INSERT WITH CHECK (
    sender_id = auth.uid()
);

-- Allow users to update messages they sent or received (for marking as read)
CREATE POLICY "Users can update messages they sent or received" ON public.messages
FOR UPDATE USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
) WITH CHECK (
    sender_id = auth.uid() OR receiver_id = auth.uid()
);

-- Allow admins to view all messages
CREATE POLICY "Admin can view all messages" ON public.messages
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'
    )
);

-- Sample data for testing (optional)
INSERT INTO public.messages (sender_id, receiver_id, content, is_read)
SELECT 
    '5748e2f5-c12e-45a6-b240-6874281362da', -- Update with actual sender ID
    '5748e2f5-c12e-45a6-b240-6874281362da', -- Update with actual receiver ID
    'This is a test message',
    false
WHERE NOT EXISTS (
    SELECT 1 FROM public.messages LIMIT 1
);

-- Function to get conversations for a user
CREATE OR REPLACE FUNCTION get_conversations(user_id UUID)
RETURNS TABLE (
    conversation_id UUID,
    other_user_id UUID,
    last_message TEXT,
    last_message_time TIMESTAMP WITH TIME ZONE,
    unread_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH latest_messages AS (
        SELECT DISTINCT ON (
            CASE
                WHEN sender_id = user_id THEN receiver_id
                ELSE sender_id
            END
        )
            id,
            CASE
                WHEN sender_id = user_id THEN receiver_id
                ELSE sender_id
            END as other_user,
            content,
            timestamp,
            is_read,
            sender_id
        FROM
            messages
        WHERE
            sender_id = user_id OR receiver_id = user_id
        ORDER BY
            other_user,
            timestamp DESC
    )
    SELECT
        m.id as conversation_id,
        m.other_user as other_user_id,
        m.content as last_message,
        m.timestamp as last_message_time,
        COUNT(um.id) FILTER (WHERE um.is_read = false AND um.receiver_id = user_id) as unread_count
    FROM
        latest_messages m
    LEFT JOIN
        messages um ON (um.sender_id = m.other_user AND um.receiver_id = user_id)
    GROUP BY
        m.id, m.other_user, m.content, m.timestamp, m.is_read, m.sender_id
    ORDER BY
        m.timestamp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 