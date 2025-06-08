-- Create notification_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    message_notifications BOOLEAN DEFAULT true,
    booking_notifications BOOLEAN DEFAULT true,
    system_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notification settings" ON public.notification_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings" ON public.notification_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings" ON public.notification_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification settings" ON public.notification_settings
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE
    ON public.notification_settings FOR EACH ROW EXECUTE PROCEDURE
    update_updated_at_column(); 