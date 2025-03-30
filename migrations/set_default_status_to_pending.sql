-- Migration to change default status in profiles table from 'active' to 'pending'
ALTER TABLE public.profiles ALTER COLUMN status SET DEFAULT 'pending';

-- Add a comment to document the change
COMMENT ON COLUMN public.profiles.status IS 'User account status (active, inactive, pending, rejected). Default is pending for verification.';

-- Update the handle_new_user function to set status to pending for new registrations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Check if profile already exists to prevent duplicates
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = new.id) THEN
        INSERT INTO public.profiles (id, email, status)
        VALUES (new.id, new.email, 'pending');
    END IF;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
