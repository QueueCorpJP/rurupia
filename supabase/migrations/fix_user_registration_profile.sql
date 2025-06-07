-- Fix user registration profile creation to properly handle nickname/name
-- This migration ensures that when users register, their name gets properly saved to the profiles table

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Check if profile already exists to prevent duplicates
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = new.id) THEN
        INSERT INTO public.profiles (
            id, 
            email, 
            name, 
            nickname,
            avatar_url, 
            line_id, 
            user_type, 
            status,
            needs_email_setup,
            created_at,
            updated_at
        )
        VALUES (
            new.id,
            new.email,
            -- Handle both 'name' and 'full_name' from metadata
            COALESCE(
                new.raw_user_meta_data->>'name', 
                new.raw_user_meta_data->>'full_name'
            ),
            -- Use name as nickname initially, user can change it later
            COALESCE(
                new.raw_user_meta_data->>'nickname',
                new.raw_user_meta_data->>'name', 
                new.raw_user_meta_data->>'full_name'
            ),
            new.raw_user_meta_data->>'avatar_url',
            new.raw_user_meta_data->>'line_id',
            COALESCE(new.raw_user_meta_data->>'user_type', 'customer'),
            'pending', -- Default status for new registrations
            COALESCE((new.raw_user_meta_data->>'needs_email_setup')::boolean, false),
            TIMEZONE('utc', NOW()),
            TIMEZONE('utc', NOW())
        );
        
        -- Log successful profile creation
        RAISE NOTICE 'Created profile for user % with name: %', 
            new.id, 
            COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name');
    ELSE
        -- Log that profile already exists
        RAISE NOTICE 'Profile already exists for user %', new.id;
    END IF;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Log that this migration has been applied
INSERT INTO migration_logs (migration_name, executed_at, description) 
VALUES (
    'fix_user_registration_profile', 
    NOW(),
    'Fixed handle_new_user trigger to properly extract name/nickname from user metadata during registration'
)
ON CONFLICT (migration_name) 
DO UPDATE SET 
    executed_at = NOW(),
    description = 'Fixed handle_new_user trigger to properly extract name/nickname from user metadata during registration'; 