import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/admin-client';
import { User } from '@supabase/supabase-js';

export async function setupAdminUser() {
  try {
    // Get admin password from environment variables
    const adminPassword = import.meta.env.VITE_ADMIN_DEFAULT_PASSWORD;
    
    if (!adminPassword) {
      throw new Error(
        'Missing admin password environment variable. Please check your .env file and ensure VITE_ADMIN_DEFAULT_PASSWORD is set.'
      );
    }

    // First check if admin user already exists
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    const existingUser = users?.users?.find((u: User) => u.email === 'admin@serenitysage.com');

    if (existingUser) {
      // Check if profile exists
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', existingUser.id)
        .single();

      if (profile) {
        console.log('Admin user and profile already exist');
        return existingUser;
      }

      // If user exists but profile doesn't, create profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: existingUser.id,
          email: 'admin@serenitysage.com',
          user_type: 'admin',
        });

      if (profileError) {
        console.error('Error creating admin profile:', profileError);
        return null;
      }

      return existingUser;
    }

    // Create new admin user
    const { data: { user }, error } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@serenitysage.com',
      password: adminPassword,
      email_confirm: true
    });

    if (error) {
      console.error('Error creating admin user:', error);
      return null;
    }

    if (!user) {
      console.error('No user returned after creation');
      return null;
    }

    // Create admin profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        email: 'admin@serenitysage.com',
        user_type: 'admin',
      }, { 
        onConflict: 'id',
        ignoreDuplicates: true 
      });

    if (profileError) {
      console.error('Error creating admin profile:', profileError);
      // Clean up the created user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      return null;
    }

    // Create storage bucket for blog images
    const { error: storageError } = await supabaseAdmin
      .storage
      .createBucket('blog', {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['image/*']
      });

    if (storageError && !storageError.message.includes('already exists')) {
      console.error('Error creating storage bucket:', storageError);
      // Don't fail the setup if bucket creation fails
      // The bucket might already exist or can be created later
    }

    console.log('Admin user and profile created successfully');
    return user;

  } catch (error) {
    console.error('Unexpected error during admin setup:', error);
    return null;
  }
} 