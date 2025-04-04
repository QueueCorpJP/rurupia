// Example Next.js API routes for post interactions
// To use these, create files in your pages/api directory with the corresponding names

/**
 * pages/api/post-likes.js - Handles post like operations
 * 
 * This API supports:
 * - POST: Add a like to a post
 * - DELETE: Remove a like from a post
 */
export default async function handler(req, res) {
  // Initialize Supabase client
  const { supabase } = await import('@/integrations/supabase/server');
  
  // Get current user from session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = session.user.id;
  const { postId } = req.body;
  
  if (!postId) {
    return res.status(400).json({ error: 'Post ID is required' });
  }
  
  try {
    // Handle POST request (add like)
    if (req.method === 'POST') {
      const { error } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: userId
        });
      
      if (error) {
        if (error.code === '23505') { // Unique violation - already liked
          return res.status(409).json({ error: 'Already liked' });
        }
        throw error;
      }
      
      return res.status(200).json({ success: true });
    }
    
    // Handle DELETE request (remove like)
    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      return res.status(200).json({ success: true });
    }
    
    // Handle unsupported methods
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Error handling post like:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * pages/api/user-likes.js - Get likes for a specific user
 * 
 * This API supports:
 * - GET: Retrieve all posts liked by a user
 */
export async function getUserLikesHandler(req, res) {
  // Initialize Supabase client
  const { supabase } = await import('@/integrations/supabase/server');
  
  // Get current user from session or from query
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  try {
    const { data, error } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    return res.status(200).json({ likes: data });
    
  } catch (error) {
    console.error('Error fetching user likes:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * pages/api/post-comments.js - Handles post comment operations
 * 
 * This API supports:
 * - GET: Retrieve comments for a post
 * - POST: Add a comment to a post
 * - DELETE: Remove a comment
 */
export async function postCommentsHandler(req, res) {
  // Initialize Supabase client
  const { supabase } = await import('@/integrations/supabase/server');
  
  // Handle GET request (get comments for a post)
  if (req.method === 'GET') {
    const { postId } = req.query;
    
    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }
    
    try {
      const { data, error } = await supabase
        .rpc('get_post_comments', { p_post_id: postId });
      
      if (error) {
        throw error;
      }
      
      return res.status(200).json({ comments: data });
      
    } catch (error) {
      console.error('Error fetching comments:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  // For POST and DELETE, ensure user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = session.user.id;
  
  // Handle POST request (add comment)
  if (req.method === 'POST') {
    const { postId, content } = req.body;
    
    if (!postId || !content) {
      return res.status(400).json({ error: 'Post ID and content are required' });
    }
    
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content
        })
        .select('*, profiles:user_id(username, full_name)');
      
      if (error) {
        throw error;
      }
      
      return res.status(200).json({ comment: data[0] });
      
    } catch (error) {
      console.error('Error adding comment:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  // Handle DELETE request (remove comment)
  if (req.method === 'DELETE') {
    const { commentId } = req.body;
    
    if (!commentId) {
      return res.status(400).json({ error: 'Comment ID is required' });
    }
    
    try {
      // First verify that the comment belongs to the user
      const { data: commentData, error: commentError } = await supabase
        .from('post_comments')
        .select('id')
        .eq('id', commentId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (commentError) {
        throw commentError;
      }
      
      if (!commentData) {
        return res.status(403).json({ error: 'Cannot delete comment that does not belong to you' });
      }
      
      // Delete the comment
      const { error: deleteError } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);
      
      if (deleteError) {
        throw deleteError;
      }
      
      return res.status(200).json({ success: true });
      
    } catch (error) {
      console.error('Error deleting comment:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  // Handle unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
}

/**
 * pages/api/check-table-exists.js - Check if a table exists in the database
 * 
 * This API supports:
 * - GET: Check if a specified table exists
 */
export async function checkTableExistsHandler(req, res) {
  // Initialize Supabase client
  const { supabase } = await import('@/integrations/supabase/server');
  
  const { table } = req.query;
  
  if (!table) {
    return res.status(400).json({ error: 'Table name is required' });
  }
  
  try {
    // Use a simple query with limit 0 to check if the table exists
    const { error } = await supabase
      .from(table)
      .select('id')
      .limit(0);
    
    // If there's no error, the table exists
    return res.status(200).json({ exists: !error });
    
  } catch (error) {
    console.error('Error checking table existence:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 