// LINE Authentication Handler
// This Edge Function handles authentication from LINE Login

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { decode } from 'https://deno.land/std@0.170.0/encoding/base64url.ts';

interface LineIdTokenPayload {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  nonce?: string;
  name?: string;
  picture?: string;
  email?: string;
}

interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  email?: string;
}

// Line Profile Response Interface for Profile API
interface LineProfileResponse {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

// Line Email Response Interface for Email API


// Function to create Supabase client with service role
const createSupabaseClient = (req: Request) => {
  // Get environment variables from Supabase Edge Function
  const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

  // Create Supabase client
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'X-Client-Info': `line-auth-handler`,
      },
    },
  });
};

// Get LINE profile from access token
const getLineProfile = async (accessToken: string): Promise<LineProfileResponse> => {
  const response = await fetch('https://api.line.me/v2/profile', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error fetching LINE profile:', errorText);
    throw new Error(`Failed to fetch LINE profile: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

// Note: We no longer fetch email from LINE since users can set it in account settings
// This simplifies the flow and avoids potential 404 errors when users don't grant email permission

// Verify LINE ID token
const verifyIdToken = (idToken: string, clientId: string): LineIdTokenPayload => {
  try {
    // Basic token format validation
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    // Decode the payload
    const payload = JSON.parse(new TextDecoder().decode(decode(parts[1])));

    // Basic validation
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      throw new Error('Token expired');
    }
    if (payload.iat > now) {
      throw new Error('Token issued in the future');
    }
    if (payload.iss !== 'https://access.line.me') {
      throw new Error(`Invalid issuer: ${payload.iss}`);
    }
    if (payload.aud !== clientId) {
      throw new Error(`Invalid audience: ${payload.aud} != ${clientId}`);
    }

    return payload;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error(`ID token verification failed: ${error.message}`);
  }
};

// Main handler for the Edge Function
Deno.serve(async (req) => {
  // Handle preflight CORS request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
      },
      status: 200,
    });
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    // Parse the request body
    const { id_token, access_token } = await req.json();

    if (!id_token || !access_token) {
      return new Response(
        JSON.stringify({ error: 'ID token and access token are required' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get LINE client ID from environment variables
    const clientId = Deno.env.get('VITE_APP_LINE_CLIENT_ID') || '';
    if (!clientId) {
      return new Response(
        JSON.stringify({ error: 'LINE client ID not configured' }),
        { headers: { 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Verify the ID token
    const payload = verifyIdToken(id_token, clientId);
    
    // Get user profile from LINE API (skip email since users can set it in account settings)
    const profile = await getLineProfile(access_token);

    // Combine profile data (no email since users can set it in account settings)
    const userData: LineProfile = {
      userId: payload.sub,
      displayName: profile.displayName || payload.name || 'LINE User',
      pictureUrl: profile.pictureUrl || payload.picture,
      statusMessage: profile.statusMessage,
      email: undefined, // Will be set in account settings
    };

    // Create Supabase client
    const supabase = createSupabaseClient(req);

    // Check if user exists
    const { data: existingUser, error: searchError } = await supabase
      .from('profiles')
      .select('id, line_id, user_type')
      .eq('line_id', userData.userId)
      .maybeSingle();

    if (searchError) {
      console.error('Error searching for existing user:', searchError);
      return new Response(
        JSON.stringify({ error: 'Database error when searching for user' }),
        { headers: { 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    let userId: string;
    let isNewUser = false;

    if (existingUser) {
      // User exists, just update profile if needed
      userId = existingUser.id;
      
      // For existing users, ensure they have the correct password pattern
      const linePassword = `line_${userData.userId}_temp`;
      
      // Update user password to ensure consistent authentication
      const { error: passwordUpdateError } = await supabase.auth.admin.updateUserById(userId, {
        password: linePassword
      });
      
      if (passwordUpdateError) {
        console.error('Error updating user password:', passwordUpdateError);
      }
      
      // Update profile information
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: userData.displayName,
          avatar_url: userData.pictureUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
      }
      
      console.log('Existing user logged in via LINE:', userId);
    } else {
      // Create new user with LINE credentials and set a consistent password
      const linePassword = `line_${userData.userId}_temp`; // Consistent password pattern
      const tempEmail = `line_${userData.userId}@temp.rupipia.jp`; // Always use temp email
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: tempEmail,
        password: linePassword,
        email_confirm: true,
        user_metadata: {
          full_name: userData.displayName,
          avatar_url: userData.pictureUrl,
          provider: 'line',
          line_id: userData.userId,
          needs_email_setup: true, // Always true since we don't fetch from LINE
        },
      });

      if (authError || !authData.user) {
        console.error('Error creating user:', authError);
        return new Response(
          JSON.stringify({ error: 'Failed to create user account' }),
          { headers: { 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      userId = authData.user.id;
      isNewUser = true;

      // Update the profile with LINE specific information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          line_id: userData.userId,
          full_name: userData.displayName,
          avatar_url: userData.pictureUrl,
          user_type: 'customer', // Default user type
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Error updating profile with LINE info:', profileError);
      }
      
      console.log('New user created via LINE:', userId);
    }

    // Return user data and auth status
    return new Response(
      JSON.stringify({
        profile: {
          id: userId,
          line_id: userData.userId,
          name: userData.displayName,
          picture: userData.pictureUrl,
          email: `line_${userData.userId}@temp.rupipia.jp`, // Always temp email
        },
        user_type: existingUser?.user_type || 'customer',
        is_new_user: isNewUser,
        auth_credentials: {
          email: `line_${userData.userId}@temp.rupipia.jp`, // Always temp email
          password: `line_${userData.userId}_temp`
        }
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }, 
        status: 200 
      }
    );
    
  } catch (error) {
    console.error('LINE auth handler error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }, 
        status: 500 
      }
    );
  }
}); 