import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

export const handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  // Handle preflight CORS requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    const { httpMethod, path, queryStringParameters, body, headers } = event;
    const requestBody = body ? JSON.parse(body) : {};
    
    // Route handling based on path
    if (path.startsWith('/api/post-likes')) {
      return await handlePostLikes(httpMethod, requestBody, headers);
    } else if (path.startsWith('/api/user-likes')) {
      return await handleUserLikes(queryStringParameters);
    } else if (path.startsWith('/api/post-comments')) {
      return await handlePostComments(httpMethod, requestBody, queryStringParameters, headers);
    } else if (path.startsWith('/api/config')) {
      return await handleConfig();
    } else {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Route not found' })
      };
    }
  } catch (error) {
    console.error('Lambda error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

// Get user session from Authorization header
async function getUserFromAuth(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error) {
    console.error('Auth error:', error);
    return null;
  }
  
  return user;
}

// Handle post likes API
async function handlePostLikes(method, body, headers) {
  const user = await getUserFromAuth(headers.Authorization);
  
  if (!user) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }
  
  const { postId } = body;
  if (!postId) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Post ID is required' })
    };
  }
  
  try {
    if (method === 'POST') {
      const { error } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: user.id
        });
      
      if (error) {
        if (error.code === '23505') {
          return {
            statusCode: 409,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Already liked' })
          };
        }
        throw error;
      }
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true })
      };
    }
    
    if (method === 'DELETE') {
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true })
      };
    }
    
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Post likes error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}

// Handle user likes API
async function handleUserLikes(queryParams) {
  console.log('handleUserLikes called with params:', JSON.stringify(queryParams || {}));
  
  const { userId } = queryParams || {};
  
  if (!userId) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'User ID is required' })
    };
  }
  
  try {
    console.log('Supabase config:', { url: supabaseUrl ? 'set' : 'not set', key: supabaseKey ? 'set' : 'not set' });
    console.log('Querying post_likes table for user_id:', userId);
    
    const { data, error } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Supabase error:', JSON.stringify(error));
      throw error;
    }
    
    console.log('Query successful, returned data:', JSON.stringify(data));
    
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ likes: data })
    };
  } catch (error) {
    console.error('User likes error:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
}

// Handle post comments API
async function handlePostComments(method, body, queryParams, headers) {
  if (method === 'GET') {
    const { postId } = queryParams || {};
    
    if (!postId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Post ID is required' })
      };
    }
    
    try {
      const { data, error } = await supabase
        .rpc('get_post_comments', { p_post_id: postId });
      
      if (error) throw error;
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ comments: data })
      };
    } catch (error) {
      console.error('Get comments error:', error);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Internal server error' })
      };
    }
  }
  
  const user = await getUserFromAuth(headers.Authorization);
  
  if (!user) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }
  
  if (method === 'POST') {
    const { postId, content } = body;
    
    if (!postId || !content) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Post ID and content are required' })
      };
    }
    
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content
        })
        .select('*, profiles:user_id(username, full_name)');
      
      if (error) throw error;
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ comment: data[0] })
      };
    } catch (error) {
      console.error('Add comment error:', error);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Internal server error' })
      };
    }
  }
  
  if (method === 'DELETE') {
    const { commentId } = body;
    
    if (!commentId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Comment ID is required' })
      };
    }
    
    try {
      const { data: commentData, error: commentError } = await supabase
        .from('post_comments')
        .select('id')
        .eq('id', commentId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (commentError) throw commentError;
      
      if (!commentData) {
        return {
          statusCode: 403,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Cannot delete comment that does not belong to you' })
        };
      }
      
      const { error: deleteError } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);
      
      if (deleteError) throw deleteError;
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true })
      };
    } catch (error) {
      console.error('Delete comment error:', error);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Internal server error' })
      };
    }
  }
  
  return {
    statusCode: 405,
    headers: corsHeaders,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
}

// Handle config API - returns environment variables for frontend
async function handleConfig() {
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      VITE_TINYMCE_API_KEY: process.env.VITE_TINYMCE_API_KEY,
      VITE_APP_LINE_CLIENT_ID: process.env.VITE_APP_LINE_CLIENT_ID,
      VITE_APP_LINE_CLIENT_SECRET: process.env.VITE_APP_LINE_CLIENT_SECRET,
      VITE_SUPABASE_URL: process.env.SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
      // Note: We don't expose the service role key to frontend
    })
  };
} 