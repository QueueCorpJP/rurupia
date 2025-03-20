-- First, check if the profiles table exists
DO $$
BEGIN
    -- If the profiles table doesn't exist, create it
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id),
            name TEXT,
            nickname TEXT,
            email TEXT,
            phone TEXT,
            address TEXT,
            user_type TEXT DEFAULT 'customer',
            status TEXT DEFAULT 'active',
            verification_document TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );
        
        -- Set up RLS
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Users can view their own profile"
            ON profiles FOR SELECT
            USING (auth.uid() = id);
            
        CREATE POLICY "Users can update their own profile"
            ON profiles FOR UPDATE
            USING (auth.uid() = id);
            
        CREATE POLICY "Admin users can view all profiles"
            ON profiles FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE id = auth.uid()
                    AND user_type = 'admin'
                )
            );
            
        CREATE POLICY "Admin users can update all profiles"
            ON profiles FOR UPDATE
            USING (
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE id = auth.uid()
                    AND user_type = 'admin'
                )
            );
            
        RAISE NOTICE 'Created profiles table with all necessary columns';
    ELSE
        -- If the table exists, check and add any missing columns
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'name') THEN
            ALTER TABLE public.profiles ADD COLUMN name TEXT;
            RAISE NOTICE 'Added missing column: name';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'nickname') THEN
            ALTER TABLE public.profiles ADD COLUMN nickname TEXT;
            RAISE NOTICE 'Added missing column: nickname';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email') THEN
            ALTER TABLE public.profiles ADD COLUMN email TEXT;
            RAISE NOTICE 'Added missing column: email';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'phone') THEN
            ALTER TABLE public.profiles ADD COLUMN phone TEXT;
            RAISE NOTICE 'Added missing column: phone';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'address') THEN
            ALTER TABLE public.profiles ADD COLUMN address TEXT;
            RAISE NOTICE 'Added missing column: address';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'user_type') THEN
            ALTER TABLE public.profiles ADD COLUMN user_type TEXT DEFAULT 'customer';
            RAISE NOTICE 'Added missing column: user_type';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'status') THEN
            ALTER TABLE public.profiles ADD COLUMN status TEXT DEFAULT 'active';
            RAISE NOTICE 'Added missing column: status';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'verification_document') THEN
            ALTER TABLE public.profiles ADD COLUMN verification_document TEXT;
            RAISE NOTICE 'Added missing column: verification_document';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'created_at') THEN
            ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());
            RAISE NOTICE 'Added missing column: created_at';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at') THEN
            ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());
            RAISE NOTICE 'Added missing column: updated_at';
        END IF;
    END IF;
END
$$;

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create or replace the function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Check if profile already exists to prevent duplicates
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = new.id) THEN
        INSERT INTO public.profiles (id, email)
        VALUES (new.id, new.email);
    END IF;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger for auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create admin policies for insert and delete
DO $$
BEGIN
    DROP POLICY IF EXISTS "Admin users can insert profiles" ON profiles;
    CREATE POLICY "Admin users can insert profiles"
        ON profiles FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE id = auth.uid()
                AND user_type = 'admin'
            )
        );
    
    DROP POLICY IF EXISTS "Admin users can delete profiles" ON profiles;
    CREATE POLICY "Admin users can delete profiles"
        ON profiles FOR DELETE
        USING (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE id = auth.uid()
                AND user_type = 'admin'
            )
        );
END
$$; 