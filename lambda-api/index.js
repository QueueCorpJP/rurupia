import { createClient } from '@supabase/supabase-js';
import AWS from 'aws-sdk';
import { customAlphabet } from 'nanoid';

// Configure nanoid for generating short unique IDs
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8);

// Configure AWS S3
const s3 = new AWS.S3({
  region: 'ap-northeast-1'
});

const BUCKET_NAME = 'rupipia-blog-pictures';

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
    } else if (path.startsWith('/api/upload-image')) {
      return await handleImageUpload(httpMethod, requestBody, headers);
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

// Helper function to create slugified filename
function slugifyFilename(filename) {
  const name = filename.split('.')[0];
  const extension = filename.split('.').pop();
  const slugified = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${slugified}-${nanoid()}.${extension}`;
}

// Handle image upload API
async function handleImageUpload(method, body, headers) {
  if (method !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { file, filename } = body;

    if (!file || !filename) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'File and filename are required' })
      };
    }

    // Decode base64 file data
    const fileBuffer = Buffer.from(file, 'base64');
    
    // Validate file size (5MB max)
    if (fileBuffer.length > 5 * 1024 * 1024) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'File size must be less than 5MB' })
      };
    }

    // Validate file type by extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const extension = filename.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Unsupported file type. Allowed: JPG, PNG, GIF, WebP' })
      };
    }

    // Create folder structure: /tenantId/yyyy/mm/dd/filename
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const tenantId = 'default'; // You can customize this based on your tenant system
    
    const slugifiedFilename = slugifyFilename(filename);
    const s3Key = `${tenantId}/${year}/${month}/${day}/${slugifiedFilename}`;

    // Upload to S3
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
      ACL: 'public-read'
    };

    const uploadResult = await s3.upload(uploadParams).promise();
    
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ location: uploadResult.Location })
    };
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to upload image' })
    };
  }
}

// Helper function to get user from authorization header
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
      // Note: SUPABASE_SERVICE_ROLE_KEY is intentionally excluded for security
      // Admin operations should go through secure API endpoints, not frontend client
    })
  };
} 