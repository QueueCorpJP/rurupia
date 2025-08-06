import { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { CalendarIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface Category {
  id: string;
  name: string;
}

interface BlogEditorProps {
  onSuccess?: () => void;
  initialData?: any;
}

export function BlogEditor({ onSuccess, initialData }: BlogEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [coverImage, setCoverImage] = useState(initialData?.cover_image || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isPublished, setIsPublished] = useState(initialData?.published || false);
  const [scheduledFor, setScheduledFor] = useState<Date | undefined>(
    initialData?.scheduled_for ? new Date(initialData.scheduled_for) : undefined
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authorName, setAuthorName] = useState(initialData?.author_name || '管理者');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingFullPost, setIsLoadingFullPost] = useState(false);
  const [tinymceApiKey, setTinymceApiKey] = useState<string>('nn4binis9k4dzuafzo2wvdl6jobzmh8e4g6hfjvs62zroxvd');
  const editorRef = useRef<any>(null);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  
  useEffect(() => {
    fetchCategories();
    checkAdminStatus();
    // fetchTinymceApiKey(); // Commented out since we're using hardcoded key
  }, []);

  const fetchTinymceApiKey = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-tinymce-key');
      
      if (error) {
        console.error('Error invoking get-tinymce-key function:', error);
        // Fallback to environment variable if edge function fails
        const envKey = import.meta.env.VITE_TINYMCE_API_KEY;
        if (envKey) {
          setTinymceApiKey(envKey);
          console.log('TinyMCE API key loaded from environment');
        }
        return;
      }
      
      if (data?.key) {
        setTinymceApiKey(data.key);
        console.log('TinyMCE API key fetched successfully from edge function');
      } else {
        console.log('No TinyMCE API key found in secrets, trying environment');
        const envKey = import.meta.env.VITE_TINYMCE_API_KEY;
        if (envKey) {
          setTinymceApiKey(envKey);
          console.log('TinyMCE API key loaded from environment');
        }
      }
    } catch (error) {
      console.error('Error fetching TinyMCE API key:', error);
      // Fallback to environment variable
      const envKey = import.meta.env.VITE_TINYMCE_API_KEY;
      if (envKey) {
        setTinymceApiKey(envKey);
        console.log('TinyMCE API key loaded from environment as fallback');
      }
    }
  };

  // Add effect to fetch full post data when only partial data is available
  useEffect(() => {
    // Only run this if we have an initialData object with an ID but missing key fields
    if (initialData?.id && !initialData.content) {
      const fetchCompletePostData = async () => {
        setIsLoadingFullPost(true);
        try {
          const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('id', initialData.id)
            .single();
            
          if (error) {
            console.error('Error fetching complete post data:', error);
            toast.error('記事データの取得に失敗しました');
            return;
          }
          
          if (data) {
            // Update all state variables with the complete data
            setTitle(data.title || '');
            setContent(data.content || '');
            setExcerpt(data.excerpt || '');
            setCoverImage(data.cover_image || '');
            setCategoryId(data.category_id || '');
            setTags(data.tags || []);
            setIsPublished(data.published || false);
            setScheduledFor(data.scheduled_for ? new Date(data.scheduled_for) : undefined);
            setAuthorName(data.author_name || '管理者');
            
            // If content is available and editor is initialized, set the content
            if (data.content && editorRef.current) {
              editorRef.current.setContent(data.content);
            }
          }
        } catch (err) {
          console.error('Unexpected error fetching post data:', err);
        } finally {
          setIsLoadingFullPost(false);
        }
      };
      
      fetchCompletePostData();
    }
  }, [initialData]);

  const checkAdminStatus = async () => {
    try {
      // Check for admin session in localStorage first
      const adminSession = localStorage.getItem('admin_session');
      
      if (adminSession === 'true') {
        // If admin session exists in localStorage, trust it
        setIsAdmin(true);
        console.log('Admin status verified from localStorage');
        return;
      }
      
      // Fallback to checking the profile if necessary
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No active session found');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error checking admin status:', profileError);
        return;
      }

      if (profile && profile.user_type === 'admin') {
        setIsAdmin(true);
        console.log('Admin status verified from profile');
      } else {
        console.log('User is not admin according to profile');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      
      if (data) {
        setCategories(data);
        // If no category selected and we have categories, select the first one
        if (!categoryId && data.length > 0) {
          setCategoryId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('カテゴリの取得に失敗しました');
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('画像サイズは5MB以下である必要があります');
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('対応している画像形式: JPG, PNG, GIF, WebP');
        return;
      }
      
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddCategory = async (name: string) => {
    if (!name.trim()) {
      toast.error('カテゴリ名を入力してください');
      return;
    }

    const trimmedName = name.trim();
    const trimmedDescription = newCategoryDescription.trim();

    // Check if category already exists
    const existingCategory = categories.find(cat => cat.name.toLowerCase() === trimmedName.toLowerCase());
    if (existingCategory) {
      toast.error('このカテゴリは既に存在します');
      return;
    }

    try {
      const categoryData = {
        name: trimmedName,
        ...(trimmedDescription && { description: trimmedDescription })
      };

      const { error } = await supabase
        .from('blog_categories')
        .insert(categoryData);

      if (error) {
        console.error('Error adding new category:', error);
        toast.error(`カテゴリの追加に失敗しました: ${error.message}`);
        return;
      }

      toast.success('カテゴリを追加しました');
      setIsNewCategoryModalOpen(false);
      setNewCategoryName('');
      setNewCategoryDescription(''); // Clear description on success
      fetchCategories(); // Refresh categories to include the new one
      if (!categoryId) {
        setCategoryId(categories.find(cat => cat.name === trimmedName)?.id || '');
      }
    } catch (error) {
      console.error('Unexpected error adding category:', error);
      toast.error('カテゴリの追加中にエラーが発生しました');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started');
    
    // Check if TinyMCE editor is initialized
    if (!editorRef.current) {
      console.log('Editor not initialized');
      toast.error('エディタの初期化に失敗しました。ページを再読み込みしてください。');
      return;
    }
    
    try {
      const editorContent = editorRef.current.getContent();
      console.log('Editor content retrieved:', editorContent.substring(0, 50) + '...');
      
      if (!title.trim() || !editorContent.trim() || !excerpt.trim() || !categoryId) {
        console.log('Missing required fields:', {
          titleEmpty: !title.trim(),
          contentEmpty: !editorContent.trim(),
          excerptEmpty: !excerpt.trim(),
          categoryEmpty: !categoryId
        });
        toast.error('必須項目を入力してください');
        return;
      }

      // Check admin status from localStorage
      const adminSession = localStorage.getItem('admin_session');
      const adminUserId = localStorage.getItem('admin_user_id');
      
      let isAdminFromStorage = false;
      
      if (adminSession === 'true' && adminUserId) {
        // Override isAdmin state for this submission
        console.log('Admin status forced from localStorage');
        isAdminFromStorage = true;
      } else if (!isAdmin) {
        console.log('User is not admin');
        toast.error('ブログ記事の作成・編集には管理者権限が必要です');
        return;
      }
      
      console.log('Validation passed, setting isSubmitting');
      setIsSubmitting(true);
      
      // Check for an existing session, but don't try to create one
      console.log('Checking session status...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session && !isAdminFromStorage) {
        console.log('No active session and not using admin from storage');
        toast.error('セッションが無効です。再ログインしてください。');
        setIsSubmitting(false);
        return;
      }
      
      console.log('Session check passed. Proceeding as admin.');
      
      // First upload the image if we have a new one
      let coverImageUrl = coverImage;
      
      if (imageFile) {
        console.log('Starting image upload');
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `blog/${fileName}`;
        
        try {
          console.log('Uploading to path:', filePath);
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('blog')
            .upload(filePath, imageFile);
            
          if (uploadError) {
            console.error('Image upload error details:', JSON.stringify(uploadError));
            if (uploadError.message.includes('row-level security')) {
              toast.error('画像のアップロードには管理者権限が必要です');
            } else {
              toast.error(`画像のアップロードに失敗しました: ${uploadError.message}`);
            }
            setIsSubmitting(false);
            return;
          }
          
          console.log('Image uploaded successfully, getting URL');
          const { data: urlData } = supabase.storage.from('blog').getPublicUrl(filePath);
          coverImageUrl = urlData.publicUrl;
          console.log('Image public URL:', coverImageUrl);
        } catch (uploadError) {
          console.error('Image upload exception:', uploadError);
          toast.error('画像のアップロード中にエラーが発生しました');
          setIsSubmitting(false);
          return;
        }
      }
      
      // Get the category name for the selected category ID
      const selectedCategory = categories.find(cat => cat.id === categoryId);
      console.log('Selected category:', selectedCategory?.name);
      
      // Generate a slug from the title
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/gi, '-') + '-' + Date.now().toString().slice(-4);
      console.log('Generated slug:', slug);
      
      // Format the date for Supabase
      const scheduledForISOString = scheduledFor ? scheduledFor.toISOString() : null;
      
      // Create the post data object with proper typing for all fields
      const postData: {
        title: string;
        content: string;
        excerpt: string;
        slug: string;
        cover_image: string | null;
        category_id: string;
        category: string;
        tags: string[];
        published: boolean;
        scheduled_for: string | null;
        author_name: string;
        published_at?: string;
      } = {
        title,
        content: editorContent,
        excerpt,
        slug,
        cover_image: coverImageUrl,
        category_id: categoryId,
        category: selectedCategory?.name || '',
        tags,
        published: isPublished,
        scheduled_for: scheduledForISOString,
        author_name: authorName,
      };
      
      console.log('Post data prepared:', { ...postData, content: postData.content.substring(0, 50) + '...' });
      
      // If there's a scheduled date in the future, modify the published status
      if (scheduledFor) {
        const now = new Date();
        const isFutureDate = scheduledFor > now;
        
        if (isFutureDate) {
          console.log('Post scheduled for future date:', scheduledForISOString);
          // For future dates, we still respect the user's published choice but add published_at
          // that matches the scheduled date
          postData.published_at = scheduledForISOString;
        } else {
          console.log('Scheduled date is not in the future');
          // For current/past dates, use current time for published_at
          postData.published_at = new Date().toISOString();
        }
      } else {
        // No scheduled date, use current time for published_at if published
        if (postData.published) {
          postData.published_at = new Date().toISOString();
        }
      }
      
      if (initialData?.id) {
        console.log('Updating existing post with ID:', initialData.id);
        // Update existing post
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', initialData.id);
          
        if (updateError) {
          console.error('Error updating blog post:', updateError);
          console.error('Full error details:', JSON.stringify(updateError));
          if (updateError.message.includes('row-level security')) {
            toast.error('ブログ記事の更新には管理者権限が必要です');
          } else {
            toast.error(`ブログ記事の更新に失敗しました: ${updateError.message}`);
          }
          setIsSubmitting(false);
          return;
        }
        
        console.log('Post updated successfully');
        toast.success('ブログ記事を更新しました');
      } else {
        console.log('Creating new blog post');
        // Create new post
        const { error: insertError, data: insertData } = await supabase
          .from('blog_posts')
          .insert(postData);
          
        console.log('Insert response:', insertData);
          
        if (insertError) {
          console.error('Error creating blog post:', insertError);
          console.error('Full error details:', JSON.stringify(insertError));
          if (insertError.message.includes('row-level security')) {
            toast.error('ブログ記事の作成には管理者権限が必要です');
          } else {
            toast.error(`ブログ記事の作成に失敗しました: ${insertError.message}`);
          }
          setIsSubmitting(false);
          return;
        }
        
        console.log('Post created successfully');
        toast.success('ブログ記事を作成しました');
      }
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        console.log('Calling onSuccess callback');
        onSuccess();
      }
      
      // Reset form if creating a new post
      if (!initialData) {
        console.log('Resetting form fields');
        setTitle('');
        if (editorRef.current) {
          editorRef.current.setContent('');
        }
        setExcerpt('');
        setCoverImage('');
        setImageFile(null);
        setImagePreview('');
        setTags([]);
        setTagInput('');
        setIsPublished(false);
        setScheduledFor(undefined);
      }
      
    } catch (error) {
      console.error('Error saving blog post:', error);
      console.error('Full error details:', error instanceof Error ? error.stack : JSON.stringify(error));
      toast.error('ブログ記事の保存に失敗しました');
    } finally {
      console.log('Form submission completed');
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {isLoadingFullPost && (
            <div className="p-4 text-center text-muted-foreground">
              <div className="flex justify-center mb-2">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
              <p>記事データを読み込み中...</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">タイトル <span className="text-destructive">*</span></Label>
              <Input 
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="記事のタイトルを入力"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="excerpt">概要 <span className="text-destructive">*</span></Label>
              <Textarea 
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="記事の概要を入力（検索結果やリスト表示で使用されます）"
                rows={3}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="category">カテゴリ <span className="text-destructive">*</span></Label>
              <div className="flex gap-2 items-start">
                <div className="flex-1">
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                </div>
                <Dialog open={isNewCategoryModalOpen} onOpenChange={setIsNewCategoryModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      追加
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>新しいカテゴリを追加</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-category-name" className="text-right">
                          カテゴリ名
                        </Label>
                        <Input
                          id="new-category-name"
                          className="col-span-3"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="新しいカテゴリ名"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddCategory(newCategoryName)}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-category-description" className="text-right">
                          説明
                        </Label>
                        <Textarea
                          id="new-category-description"
                          className="col-span-3"
                          value={newCategoryDescription}
                          onChange={(e) => setNewCategoryDescription(e.target.value)}
                          placeholder="カテゴリの説明を入力"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsNewCategoryModalOpen(false)}>
                          キャンセル
                        </Button>
                        <Button onClick={() => handleAddCategory(newCategoryName)}>
                          カテゴリを追加
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <div>
              <Label htmlFor="content">内容 <span className="text-destructive">*</span></Label>
              <Editor
                apiKey={tinymceApiKey}
                onInit={(evt, editor) => {
                  editorRef.current = editor;
                  // Ensure editor is not read-only after initialization
                  if (editor && typeof editor.mode?.set === 'function') {
                    editor.mode.set('design');
                  }
                }}
                initialValue={content}
                init={{
                  height: 400,
                  menubar: true,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'balloon infobox custom_headings custom_lists | image | removeformat | help',
                  content_style: `
                    body { font-family:Helvetica,Arial,sans-serif; font-size:14px }
                    
                    /* Speech Balloon Blocks with Avatar Support */
                    .balloon-container { display: flex; align-items: flex-start; margin: 20px 0; gap: 12px; background: transparent; }
                    .balloon-avatar { flex-shrink: 0; width: 60px; height: auto; background: transparent; border: none; display: flex; flex-direction: column; align-items: center; gap: 4px; }
                    .balloon-avatar img { width: 60px; height: 60px; object-fit: cover; border-radius: 50%; }
                    .balloon-avatar .avatar-placeholder { width: 60px; height: 60px; background: transparent; display: flex; align-items: center; justify-content: center; font-size: 32px; border-radius: 50%; }
                    .balloon-content { flex: 0 1 auto; position: relative; background: transparent; max-width: fit-content; }
                    .balloon-speech { background-color: var(--balloon-color, #ffffff); border-radius: 18px; padding: 16px 20px; border: 1px solid rgba(0, 0, 0, 0.1); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); position: relative; margin: 0; display: inline-block; max-width: fit-content; }
                    .balloon-left .balloon-speech::before { content: ''; position: absolute; left: -10px; top: 20px; width: 0; height: 0; border-style: solid; border-width: 10px 10px 10px 0; border-color: transparent var(--balloon-color, #ffffff) transparent transparent; }
                    .balloon-right .balloon-speech::before { content: ''; position: absolute; right: -10px; top: 20px; width: 0; height: 0; border-style: solid; border-width: 10px 0 10px 10px; border-color: transparent transparent transparent var(--balloon-color, #ffffff); }
                    .balloon-caption { text-align: center; font-size: 12px; color: #666; margin: 0; padding: 0; background: transparent; white-space: nowrap; }
                    
                    /* Clean SANGO-Style Info Boxes */
                    .sango-box { width: 100%; max-width: 680px; margin: 1.5rem auto; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06); overflow: visible; border: none; background: transparent; }
                    .sango-box .box-header { background-color: var(--header-color, var(--accent, #2196f3)); color: white; font-weight: bold; font-size: 0.95rem; padding: 1rem; margin: 0; line-height: 1.2; height: 48px; display: flex; align-items: center; box-sizing: border-box; }
                    .sango-box .box-content { border: 1px solid var(--header-color, var(--accent, #2196f3)); border-top: none; background-color: var(--content-color, color-mix(in srgb, var(--accent, #2196f3) 10%, white)); padding: 1rem; margin: 0; min-height: 120px; box-sizing: border-box; }
                    .sango-box .box-content p { margin: 0; padding: 0; line-height: 1.6; color: #333; }
                    .sango-box .box-content p + p { margin-top: 0.5rem; }
                    
                    /* Border Box Style */
                    .border-box { width: 100%; max-width: 680px; margin: 1.5rem auto; border: 3px solid var(--header-color, var(--accent, #2196f3)); border-radius: 8px; background: transparent; }
                    .border-box .box-header { background-color: var(--header-color, var(--accent, #2196f3)); color: white; font-weight: bold; font-size: 0.95rem; padding: 1rem; margin: 3px 3px 0 3px; line-height: 1.2; height: 48px; display: flex; align-items: center; box-sizing: border-box; background-clip: padding-box; }
                    .border-box .box-content { background-color: var(--content-color, white); padding: 1rem; margin: 0 3px 3px 3px; min-height: 120px; box-sizing: border-box; border-radius: inherit; background-clip: padding-box; }
                    .border-box .box-content p { margin: 0; padding: 0; line-height: 1.6; color: #333; }
                    .border-box .box-content p + p { margin-top: 0.5rem; }
                    
                    /* Left Accent Box Style */
                    .left-accent-box { width: 100%; max-width: 680px; margin: 1.5rem auto; border-left: 6px solid var(--header-color, var(--accent, #2196f3)); background: white; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
                    .left-accent-box .box-header { background-color: var(--header-color, color-mix(in srgb, var(--accent, #2196f3) 15%, white)); color: var(--accent, var(--header-color, #2196f3)); font-weight: bold; font-size: 0.95rem; padding: 1rem; margin: 0; line-height: 1.2; height: 48px; display: flex; align-items: center; box-sizing: border-box; border-bottom: 1px solid color-mix(in srgb, var(--accent, var(--header-color, #2196f3)) 20%, white); }
                    .left-accent-box .box-content { background-color: var(--content-color, white); padding: 1rem; margin: 0; min-height: 120px; box-sizing: border-box; }
                    .left-accent-box .box-content p { margin: 0; padding: 0; line-height: 1.6; color: #333; }
                    .left-accent-box .box-content p + p { margin-top: 0.5rem; }
                    
                    /* Gradient Box Style - Full Beautiful Gradient */
                    .gradient-box { width: 100%; max-width: 680px; margin: 1.5rem auto; background: linear-gradient(135deg, var(--accent, #2196f3) 0%, color-mix(in srgb, var(--accent, #2196f3) 30%, white) 100%); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); overflow: visible; }
                    .gradient-box .box-header { background: linear-gradient(135deg, var(--accent, #2196f3) 0%, color-mix(in srgb, var(--accent, #2196f3) 70%, black) 100%); color: white; font-weight: bold; font-size: 0.95rem; padding: 1rem; margin: 0; line-height: 1.2; height: 48px; display: flex; align-items: center; box-sizing: border-box; }
                    .gradient-box .box-content { background: linear-gradient(135deg, color-mix(in srgb, var(--accent, #2196f3) 30%, white) 0%, color-mix(in srgb, var(--accent, #2196f3) 8%, white) 100%); padding: 1rem; margin: 0; min-height: 120px; box-sizing: border-box; }
                    .gradient-box .box-content p { margin: 0; padding: 0; line-height: 1.6; color: #333; }
                    .gradient-box .box-content p + p { margin-top: 0.5rem; }
                    
                    /* Rounded Box Style */
                    .rounded-box { width: 100%; max-width: 680px; margin: 1.5rem auto; border-radius: 16px; background: white; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); border: 1px solid color-mix(in srgb, var(--accent, #2196f3) 30%, white); }
                    .rounded-box .box-header { background-color: color-mix(in srgb, var(--accent, #2196f3) 20%, white); color: var(--accent, #2196f3); font-weight: bold; font-size: 0.95rem; padding: 1rem; margin: 0; border-radius: 16px 16px 0 0; line-height: 1.2; height: 48px; display: flex; align-items: center; box-sizing: border-box; }
                    .rounded-box .box-content { background-color: white; padding: 1rem; margin: 0; min-height: 120px; box-sizing: border-box; border-radius: 0 0 16px 16px; }
                    .rounded-box .box-content p { margin: 0; padding: 0; line-height: 1.6; color: #333; }
                    .rounded-box .box-content p + p { margin-top: 0.5rem; }
                    
                    /* Shadow Box Style */
                    .shadow-box { width: 100%; max-width: 680px; margin: 1.5rem auto; background: white; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); border-radius: 8px; border-top: 4px solid var(--header-color, var(--accent, #2196f3)); }
                    .shadow-box .box-header { background-color: var(--header-color, color-mix(in srgb, var(--accent, #2196f3) 8%, white)); color: var(--accent, var(--header-color, #2196f3)); font-weight: bold; font-size: 0.95rem; padding: 1rem; margin: 0; line-height: 1.2; height: 48px; display: flex; align-items: center; box-sizing: border-box; border-bottom: 1px solid color-mix(in srgb, var(--accent, var(--header-color, #2196f3)) 15%, white); }
                    .shadow-box .box-content { background-color: var(--content-color, white); padding: 1rem; margin: 0; min-height: 120px; box-sizing: border-box; }
                    .shadow-box .box-content p { margin: 0; padding: 0; line-height: 1.6; color: #333; }
                    .shadow-box .box-content p + p { margin-top: 0.5rem; }
                    
                    /* Gradient Box Style - Full Beautiful Gradient */
                    .gradient-box { width: 100%; max-width: 680px; margin: 1.5rem auto; border-radius: 12px; background: linear-gradient(135deg, var(--gradient-start, #9C27B0) 0%, var(--gradient-end, #E1BEE7) 100%); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.2); }
                    .gradient-box .box-header { background: transparent; color: white; font-weight: bold; font-size: 0.95rem; padding: 1.2rem 1rem; margin: 0; line-height: 1.2; height: 52px; display: flex; align-items: center; box-sizing: border-box; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); border-bottom: 1px solid rgba(255, 255, 255, 0.2); }
                    .gradient-box .box-content { background: transparent; padding: 1.2rem 1rem; margin: 0; min-height: 120px; box-sizing: border-box; color: white; }
                    .gradient-box .box-content p { margin: 0; padding: 0; line-height: 1.6; color: white; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); }
                    .gradient-box .box-content p + p { margin-top: 0.5rem; }
                    
                    /* Outline Title Band Box Style */
                    .outline-title-band-box { width: 100%; max-width: 680px; margin: 1.5rem auto; background: white; border: 2px solid var(--header-color, var(--accent, #F4C018)); border-radius: 8px; position: relative; }
                    .outline-title-band-box .box-header { background-color: var(--header-color, var(--accent, #F4C018)); color: white; font-weight: bold; font-size: 0.95rem; padding: 0 1rem; margin: 0; line-height: 1.2; height: 44px; display: inline-flex; align-items: center; box-sizing: border-box; border-radius: 6px 6px 0 0; position: absolute; top: -2px; left: -2px; z-index: 1; width: fit-content; max-width: calc(100% - 20px); }
                    .outline-title-band-box .box-content { background-color: var(--content-color, white); padding: 1rem; margin: 0; min-height: 120px; box-sizing: border-box; padding-top: 60px; color: #333; }
                    .outline-title-band-box .box-content p { margin: 0; padding: 0; line-height: 1.6; color: #333; }
                    .outline-title-band-box .box-content p + p { margin-top: 0.5rem; }
                    
                    /* Flag Header Box Style */
                    .flag-header-box { width: 100%; max-width: 680px; margin: 1.5rem auto; background: white; border: 2px solid var(--header-color, var(--accent, #4DA0FF)); border-radius: 8px; position: relative; }
                    .flag-header-box .box-header { background-color: var(--header-color, var(--accent, #4DA0FF)); color: white; font-weight: bold; font-size: 0.9rem; padding: 0 20px 0 16px; margin: 0; line-height: 1.2; height: 32px; display: inline-flex; align-items: center; box-sizing: border-box; position: absolute; top: 12px; left: 12px; width: fit-content; max-width: calc(100% - 50px); }
                    .flag-header-box .box-header::after { content: ''; position: absolute; right: -8px; top: 0; width: 0; height: 0; border-style: solid; border-width: 16px 0 16px 8px; border-color: transparent transparent transparent var(--header-color, var(--accent, #4DA0FF)); }
                    .flag-header-box .box-content { background-color: var(--content-color, white); padding: 1rem; margin: 0; min-height: 120px; box-sizing: border-box; padding-top: 60px; }
                    .flag-header-box .box-content p { margin: 0; padding: 0; line-height: 1.6; color: #333; }
                    .flag-header-box .box-content p + p { margin-top: 0.5rem; }
                    
                    /* Enhanced Custom Headings with Color Support */
                    .heading-line { position: relative; padding-bottom: 8px; margin-bottom: 20px; display: inline-block; }
                    .heading-line::after { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background-color: var(--heading-color, #007bff); border-radius: 2px; }
                    .heading-dotted { position: relative; padding-bottom: 8px; margin-bottom: 20px; display: inline-block; }
                    .heading-dotted::after { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 2px; border-bottom: 2px dotted var(--heading-color, #007bff); }
                    .heading-cross { position: relative; padding-bottom: 8px; margin-bottom: 20px; display: inline-block; }
                    .heading-cross::after { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 2px; background: repeating-linear-gradient(45deg, var(--heading-color, #007bff), var(--heading-color, #007bff) 5px, transparent 5px, transparent 10px); }
                    
                    /* Speech-Bubble Heading */
                    .heading-speech-bubble { position: relative; background-color: var(--heading-color, #007bff); color: white; padding: 16px 24px; margin-bottom: 20px; border-radius: 4px; display: block; width: 100%; font-weight: bold; }
                    .heading-speech-bubble::after { content: ''; position: absolute; bottom: -8px; left: 20px; width: 0; height: 0; border-style: solid; border-width: 8px 8px 0 8px; border-color: var(--heading-color, #007bff) transparent transparent transparent; }
                    
                    /* Dashed-Inset Heading Box */
                    .heading-dashed-inset { position: relative; background-color: var(--heading-color, #007bff); color: white; padding: 16px 24px; margin-bottom: 20px; border-radius: 2px; display: block; width: 100%; font-weight: bold; }
                    .heading-dashed-inset::before { content: ''; position: absolute; top: 4px; left: 4px; right: 4px; bottom: 4px; border: 2px dashed rgba(255, 255, 255, 0.8); border-radius: 1px; }
                    .heading-stripe { position: relative; padding: 12px 20px; margin-bottom: 20px; background: linear-gradient(135deg, var(--heading-color, #007bff) 0%, color-mix(in srgb, var(--heading-color, #007bff) 70%, black) 100%); color: white; border-radius: 6px; box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15); transform: skew(-8deg); display: inline-block; font-weight: bold; }
                    .heading-stripe span { display: inline-block; transform: skew(8deg); }
                    .heading-stripe::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255, 255, 255, 0.1) 2px, rgba(255, 255, 255, 0.1) 4px); border-radius: 6px; }
                    .heading-ribbon { position: relative; background: var(--heading-color, #007bff); color: white; padding: 8px 20px 8px 16px; margin-bottom: 20px; border-radius: 0 4px 4px 0; }
                    .heading-ribbon::before { content: ''; position: absolute; right: -8px; top: 0; width: 0; height: 0; border-style: solid; border-width: 0 0 100% 8px; border-color: transparent transparent color-mix(in srgb, var(--heading-color, #007bff) 80%, black) transparent; }
                    .heading-arrow { position: relative; background: var(--heading-color, #007bff); color: white; padding: 12px 28px 12px 20px; margin-bottom: 20px; border-radius: 6px 0 0 6px; display: inline-block; font-weight: bold; box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15); }
                    .heading-arrow::after { content: ''; position: absolute; right: -16px; top: 50%; transform: translateY(-50%); width: 0; height: 0; border-style: solid; border-width: 24px 0 24px 16px; border-color: transparent transparent transparent var(--heading-color, #007bff); filter: drop-shadow(2px 0 4px rgba(0, 0, 0, 0.1)); }
                    .heading-shadow { position: relative; padding: 8px 16px; margin-bottom: 20px; background: #f8f9fa; border-left: 4px solid var(--heading-color, #007bff); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
                    .heading-dot { position: relative; padding-left: 20px; }
                    .heading-dot::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 8px; height: 8px; background-color: var(--heading-color, #007bff); border-radius: 50%; }
                    .heading-sidebar { position: relative; padding-left: 16px; border-left: 4px solid var(--heading-color, #007bff); margin-left: 0; }
                    
                    /* Enhanced Custom Lists with Color Support */
                    .list-check { list-style: none; padding-left: 0; }
                    .list-check li { position: relative; padding-left: 28px; margin-bottom: 8px; }
                    .list-check li::before { content: '✓'; position: absolute; left: 0; top: 0; color: var(--list-color, #28a745); font-weight: bold; font-size: 16px; }
                    .list-star { list-style: none; padding-left: 0; }
                    .list-star li { position: relative; padding-left: 28px; margin-bottom: 8px; }
                    .list-star li::before { content: '★'; position: absolute; left: 0; top: 0; color: var(--list-color, #ffc107); font-weight: bold; font-size: 16px; }
                    .list-heart { list-style: none; padding-left: 0; }
                    .list-heart li { position: relative; padding-left: 28px; margin-bottom: 8px; }
                    .list-heart li::before { content: '💖'; position: absolute; left: 0; top: 0; font-size: 16px; }
                    .list-num-circle { list-style: none; counter-reset: item; padding-left: 0; }
                    .list-num-circle li { position: relative; padding-left: 40px; margin-bottom: 8px; counter-increment: item; }
                    .list-num-circle li::before { content: counter(item); position: absolute; left: 0; top: 0; background-color: var(--list-color, #007bff); color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; }
                    .list-num-square { list-style: none; counter-reset: item; padding-left: 0; }
                    .list-num-square li { position: relative; padding-left: 40px; margin-bottom: 8px; counter-increment: item; }
                    .list-num-square li::before { content: counter(item); position: absolute; left: 0; top: 0; background-color: var(--list-color, #28a745); color: white; border-radius: 4px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; }
                    .list-arrow { list-style: none; padding-left: 0; }
                    .list-arrow li { position: relative; padding-left: 28px; margin-bottom: 8px; }
                    .list-arrow li::before { content: '→'; position: absolute; left: 0; top: 0; color: var(--list-color, #007bff); font-weight: bold; font-size: 16px; }
                    .list-double-arrow { list-style: none; padding-left: 0; }
                    .list-double-arrow li { position: relative; padding-left: 28px; margin-bottom: 8px; }
                    .list-double-arrow li::before { content: '⇒'; position: absolute; left: 0; top: 0; color: var(--list-color, #dc3545); font-weight: bold; font-size: 16px; }
                    .list-none { list-style: none; padding-left: 0; }
                    .list-none li { margin-bottom: 8px; }
                  `,
                  branding: false,
                  promotion: false,
                  readonly: false,  // Ensure editor is not read-only
                  disabled: false,  // Ensure editor is not disabled
                  toolbar_mode: 'sliding',
                  automatic_uploads: true,
                  images_upload_url: 'https://pq33gk4qqd.execute-api.ap-northeast-1.amazonaws.com/prod/api/upload-image',
                  image_uploadtab: true,
                  file_picker_types: 'image',
                  images_upload_handler: async (blobInfo, progress) => {
                    return new Promise((resolve, reject) => {
                      const reader = new FileReader();
                      reader.onload = async () => {
                        try {
                          const result = reader.result;
                          if (typeof result !== 'string') {
                            reject('Failed to read file as string');
                            return;
                          }
                          
                          const base64Data = result.split(',')[1]; // Remove data:image/...;base64, prefix
                          
                          const response = await fetch('https://pq33gk4qqd.execute-api.ap-northeast-1.amazonaws.com/prod/api/upload-image', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              file: base64Data,
                              filename: blobInfo.filename() || `image-${Date.now()}.${blobInfo.blob().type.split('/')[1]}`
                            })
                          });
                          
                          if (!response.ok) {
                            const errorData = await response.json();
                            reject(errorData.error || 'Upload failed');
                            return;
                          }
                          
                          const data = await response.json();
                          resolve(data.location);
                        } catch (error) {
                          console.error('Upload error:', error);
                          reject('Upload failed: ' + (error as Error).message);
                        }
                      };
                      reader.onerror = () => reject('Failed to read file');
                      reader.readAsDataURL(blobInfo.blob());
                    });
                  },
                  formats: {
                    'heading-line-h2': { block: 'h2', classes: 'heading-line' },
                    'heading-line-h3': { block: 'h3', classes: 'heading-line' },
                    'heading-dotted-h2': { block: 'h2', classes: 'heading-dotted' },
                    'heading-dotted-h3': { block: 'h3', classes: 'heading-dotted' },
                    'heading-cross-h2': { block: 'h2', classes: 'heading-cross' },
                    'heading-cross-h3': { block: 'h3', classes: 'heading-cross' },
                    'heading-speech-bubble-h2': { block: 'h2', classes: 'heading-speech-bubble' },
                    'heading-speech-bubble-h3': { block: 'h3', classes: 'heading-speech-bubble' },
                    'heading-dashed-inset-h2': { block: 'h2', classes: 'heading-dashed-inset' },
                    'heading-dashed-inset-h3': { block: 'h3', classes: 'heading-dashed-inset' },
                    'heading-stripe-h2': { block: 'h2', classes: 'heading-stripe' },
                    'heading-stripe-h3': { block: 'h3', classes: 'heading-stripe' },
                    'heading-ribbon-h2': { block: 'h2', classes: 'heading-ribbon' },
                    'heading-ribbon-h3': { block: 'h3', classes: 'heading-ribbon' },
                    'heading-arrow-h2': { block: 'h2', classes: 'heading-arrow' },
                    'heading-arrow-h3': { block: 'h3', classes: 'heading-arrow' },
                    'heading-shadow-h2': { block: 'h2', classes: 'heading-shadow' },
                    'heading-shadow-h3': { block: 'h3', classes: 'heading-shadow' },
                    'heading-dot-h2': { block: 'h2', classes: 'heading-dot' },
                    'heading-dot-h3': { block: 'h3', classes: 'heading-dot' },
                    'heading-sidebar-h2': { block: 'h2', classes: 'heading-sidebar' },
                    'heading-sidebar-h3': { block: 'h3', classes: 'heading-sidebar' },
                    'list-check': { block: 'ul', classes: 'list-check', list_style_type: 'none' },
                    'list-star': { block: 'ul', classes: 'list-star', list_style_type: 'none' },
                    'list-heart': { block: 'ul', classes: 'list-heart', list_style_type: 'none' },
                    'list-num-circle': { block: 'ol', classes: 'list-num-circle', list_style_type: 'none' },
                    'list-num-square': { block: 'ol', classes: 'list-num-square', list_style_type: 'none' },
                    'list-arrow': { block: 'ul', classes: 'list-arrow', list_style_type: 'none' },
                    'list-double-arrow': { block: 'ul', classes: 'list-double-arrow', list_style_type: 'none' },
                    'list-none': { block: 'ul', classes: 'list-none', list_style_type: 'none' }
                  },

                  setup: (editor) => {
                    // Additional setup to ensure editor is editable
                    editor.on('init', () => {
                      editor.getBody().contentEditable = true;
                      if (editor.mode?.set) {
                        editor.mode.set('design');
                      }
                    });

                    // Enhanced balloon block button with avatar support
                    editor.ui.registry.addButton('balloon', {
                      text: '吹き出し',
                      onAction: () => {
                        const showDialog = (currentData: any = {}) => {
                          const isImageMode = currentData.avatarType === 'image';
                          let dialogApi: any = null;
                          
                          const dialogInstance = editor.windowManager.open({
                            title: '吹き出しブロック',
                            initialData: {
                              direction: 'left',
                              avatarType: 'emoji',
                              animal: '🐱',
                              customImageUrl: '',
                              color: '#FFFFFF',
                              ...currentData
                            },
                            body: {
                              type: 'panel',
                              items: [
                                {
                                  type: 'selectbox',
                                  name: 'direction',
                                  label: '方向',
                                  items: [
                                    { text: '左（アバター左側）', value: 'left' },
                                    { text: '右（アバター右側）', value: 'right' }
                                  ]
                                },
                                {
                                  type: 'selectbox',
                                  name: 'avatarType',
                                  label: 'アバタータイプ',
                                  items: [
                                    { text: '絵文字', value: 'emoji' },
                                    { text: 'カスタム画像', value: 'image' }
                                  ]
                                },
                                ...(isImageMode ? [
                                  {
                                    type: 'htmlpanel',
                                    html: '<div><button type="button" id="upload-avatar-btn" style="padding: 8px 16px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 10px;">画像をアップロード</button></div>'
                                  },
                                  {
                                    type: 'input',
                                    name: 'customImageUrl',
                                    label: 'アップロード済み画像URL',
                                    placeholder: '画像をアップロードしてください'
                                  }
                                ] : [
                                  {
                                    type: 'selectbox',
                                    name: 'animal',
                                    label: 'アバター動物',
                                    items: [
                                      { text: '🐱 ネコ', value: '🐱' },
                                      { text: '🐶 イヌ', value: '🐶' },
                                      { text: '🐰 ウサギ', value: '🐰' },
                                      { text: '🐼 パンダ', value: '🐼' },
                                      { text: '🐸 カエル', value: '🐸' },
                                      { text: '🐧 ペンギン', value: '🐧' },
                                      { text: '🦊 キツネ', value: '🦊' },
                                      { text: '🐻 クマ', value: '🐻' },
                                      { text: '🐵 サル', value: '🐵' },
                                      { text: '🐨 コアラ', value: '🐨' }
                                    ]
                                  }
                                ]),
                                {
                                  type: 'colorinput',
                                  name: 'color',
                                  label: '背景色'
                                }
                              ]
                            },
                            buttons: [
                              {
                                type: 'cancel',
                                text: 'キャンセル'
                              },
                              {
                                type: 'submit',
                                text: '挿入',
                                primary: true
                              }
                            ],
                            onChange: (api, details) => {
                              if (details.name === 'avatarType') {
                                const data = api.getData();
                                api.close();
                                showDialog(data);
                              }
                            },
                            onSubmit: async (api) => {
                              dialogApi = api;
                              const data = api.getData();
                              
                              console.log('=== DIALOG SUBMIT DATA ===');
                              console.log('Full data:', data);
                              console.log('avatarType:', data.avatarType);
                              console.log('customImageUrl:', data.customImageUrl);
                              console.log('animal:', data.animal);
                              console.log('========================');
                              
                              // Ensure color defaults to white if not set or empty
                              const balloonColor = data.color || '#FFFFFF';
                              
                              // Choose avatar content based on type
                              let avatarContent;
                              if (data.avatarType === 'image' && data.customImageUrl && data.customImageUrl.trim() !== '') {
                                console.log('Using custom image:', data.customImageUrl);
                                avatarContent = `<img src="${data.customImageUrl}" alt="カスタムアバター" />`;
                              } else {
                                console.log('Using emoji:', data.animal || '🐱');
                                avatarContent = `<div class="avatar-placeholder" style="font-size: 32px;">${data.animal || '🐱'}</div>`;
                              }
                              
                              const avatarPosition = data.direction === 'left' ? 'order: 1;' : 'order: 3;';
                              const contentPosition = data.direction === 'left' ? 'order: 2;' : 'order: 1;';
                              
                              const html = `<div class="balloon-container balloon-${data.direction}" style="--balloon-color: ${balloonColor};">
                                <div class="balloon-avatar" style="${avatarPosition}">
                                  ${avatarContent}
                                </div>
                                <div class="balloon-content" style="${contentPosition}">
                                  <div class="balloon-speech">
                                    <p>ここに吹き出しの中に入れる文を書きます。</p>
                                  </div>
                                </div>
                              </div><p><br></p>`;
                              
                              editor.insertContent(html);
                              
                              // Position cursor after the inserted element
                              setTimeout(() => {
                                const containers = editor.getBody().querySelectorAll('.balloon-container');
                                const lastContainer = containers[containers.length - 1];
                                if (lastContainer && lastContainer.nextElementSibling) {
                                  editor.selection.setCursorLocation(lastContainer.nextElementSibling, 0);
                                }
                              }, 10);
                              
                              api.close();
                            }
                          });
                          
                          // Store the dialog API reference for the upload function
                          dialogApi = dialogInstance;
                          
                          // Add click handler for upload button if in image mode
                          if (isImageMode) {
                            setTimeout(() => {
                              const uploadBtn = document.getElementById('upload-avatar-btn');
                              if (uploadBtn) {
                                uploadBtn.onclick = () => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.onchange = async (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) {
                                      try {
                                        uploadBtn.textContent = 'アップロード中...';
                                        uploadBtn.style.opacity = '0.7';
                                        
                                        // Use the EXACT same upload mechanism as TinyMCE's built-in image upload
                                        const reader = new FileReader();
                                        reader.onload = async () => {
                                          try {
                                            const result = reader.result;
                                            if (typeof result !== 'string') {
                                              throw new Error('Failed to read file as string');
                                            }
                                            
                                            const base64Data = result.split(',')[1]; // Remove data:image/...;base64, prefix
                                            
                                            const response = await fetch('https://pq33gk4qqd.execute-api.ap-northeast-1.amazonaws.com/prod/api/upload-image', {
                                              method: 'POST',
                                              headers: {
                                                'Content-Type': 'application/json',
                                              },
                                              body: JSON.stringify({
                                                file: base64Data,
                                                filename: file.name || `avatar-${Date.now()}.${file.type.split('/')[1]}`
                                              })
                                            });
                                            
                                            if (!response.ok) {
                                              const errorData = await response.json();
                                              throw new Error(errorData.error || 'Upload failed');
                                            }
                                            
                                            const data = await response.json();
                                            
                                            console.log('=== UPLOAD SUCCESS ===');
                                            console.log('Upload response:', data);
                                            console.log('Image URL:', data.location);
                                            
                                            // CRITICAL: Update the dialog data directly via API (this is the main fix!)
                                            if (dialogApi) {
                                              const currentDialogData = dialogApi.getData();
                                              console.log('Current dialog data before update:', currentDialogData);
                                              
                                              dialogApi.setData({
                                                ...currentDialogData,
                                                customImageUrl: data.location
                                              });
                                              
                                              console.log('Updated dialog data:', dialogApi.getData());
                                              
                                              // Also try to update the visual field if it exists
                                              const urlInput = document.querySelector('input[name="customImageUrl"]') as HTMLInputElement;
                                              console.log('URL Input element found:', !!urlInput);
                                              
                                              if (urlInput) {
                                                console.log('Before setting value:', urlInput.value);
                                                urlInput.value = data.location;
                                                console.log('After setting value:', urlInput.value);
                                                
                                                // Trigger events for visual feedback
                                                urlInput.dispatchEvent(new Event('change', { bubbles: true }));
                                                urlInput.dispatchEvent(new Event('input', { bubbles: true }));
                                              } else {
                                                console.log('Visual field not found, but dialog data was updated directly!');
                                              }
                                            } else {
                                              console.error('Dialog API not available!');
                                            }
                                            console.log('===================');
                                            
                                            uploadBtn.textContent = '✅ アップロード完了';
                                            uploadBtn.style.opacity = '1';
                                            uploadBtn.style.backgroundColor = '#28a745';
                                            
                                            setTimeout(() => {
                                              uploadBtn.textContent = '画像をアップロード';
                                              uploadBtn.style.backgroundColor = '#0066cc';
                                            }, 2000);
                                            
                                          } catch (error) {
                                            console.error('Upload error:', error);
                                            uploadBtn.textContent = '❌ アップロード失敗';
                                            uploadBtn.style.backgroundColor = '#dc3545';
                                            alert('画像のアップロードに失敗しました: ' + (error as Error).message);
                                            
                                            setTimeout(() => {
                                              uploadBtn.textContent = '画像をアップロード';
                                              uploadBtn.style.backgroundColor = '#0066cc';
                                              uploadBtn.style.opacity = '1';
                                            }, 2000);
                                          }
                                        };
                                        reader.onerror = () => {
                                          uploadBtn.textContent = '❌ ファイル読み込み失敗';
                                          uploadBtn.style.backgroundColor = '#dc3545';
                                          alert('ファイルの読み込みに失敗しました');
                                          
                                          setTimeout(() => {
                                            uploadBtn.textContent = '画像をアップロード';
                                            uploadBtn.style.backgroundColor = '#0066cc';
                                            uploadBtn.style.opacity = '1';
                                          }, 2000);
                                        };
                                        reader.readAsDataURL(file);
                                      } catch (error) {
                                        console.error('File processing error:', error);
                                        uploadBtn.textContent = '❌ ファイル処理失敗';
                                        uploadBtn.style.backgroundColor = '#dc3545';
                                        alert('ファイルの処理に失敗しました');
                                        
                                        setTimeout(() => {
                                          uploadBtn.textContent = '画像をアップロード';
                                          uploadBtn.style.backgroundColor = '#0066cc';
                                          uploadBtn.style.opacity = '1';
                                        }, 2000);
                                      }
                                    }
                                  };
                                  input.click();
                                };
                              }
                            }, 100);
                          }
                        };
                        
                        showDialog();
                      }
                    });

                    // Enhanced box button with multiple styles
                    editor.ui.registry.addMenuButton('infobox', {
                      text: 'ボックス',
                      fetch: (callback) => {
                        const openBoxDialog = (boxType: string, displayName: string) => {
                          let defaultColor = '#2196f3';
                          
                          // Set appropriate default colors for each box type
                          switch(boxType) {
                            case 'outline-title-band':
                              defaultColor = '#F4C018';
                              break;
                            case 'flag-header':
                              defaultColor = '#4DA0FF';
                              break;
                            case 'gradient':
                              defaultColor = '#9C27B0';
                              break;
                            default:
                              defaultColor = '#2196f3';
                          }

                          // Special handling for gradient box
                          if (boxType === 'gradient') {
                            editor.windowManager.open({
                              title: `${displayName}の色を選択`,
                              initialData: {
                                startColor: defaultColor,
                                endColor: '#E1BEE7'
                              },
                              body: {
                                type: 'panel',
                                items: [
                                  {
                                    type: 'colorinput',
                                    name: 'startColor',
                                    label: '開始色',
                                    value: defaultColor
                                  },
                                  {
                                    type: 'colorinput',
                                    name: 'endColor',
                                    label: '終了色',
                                    value: '#E1BEE7'
                                  }
                                ]
                              },
                              buttons: [
                                {
                                  type: 'cancel',
                                  text: 'キャンセル'
                                },
                                {
                                  type: 'submit',
                                  text: '挿入',
                                  primary: true
                                }
                              ],
                              onSubmit: (api) => {
                                const data = api.getData();
                                const startColor = data.startColor || defaultColor;
                                const endColor = data.endColor || '#E1BEE7';
                                
                                const html = `<div class="gradient-box" style="--gradient-start: ${startColor}; --gradient-end: ${endColor};">
                                  <header class="box-header">ここにタイトルを入力</header>
                                  <div class="box-content"><p>ここに内容を入力してください。</p></div>
                                </div><p><br></p>`;
                                
                                editor.insertContent(html);
                                
                                // Position cursor after the inserted element
                                setTimeout(() => {
                                  const boxElements = editor.getBody().querySelectorAll('[class$="-box"]');
                                  const lastBox = boxElements[boxElements.length - 1];
                                  if (lastBox && lastBox.nextElementSibling) {
                                    editor.selection.setCursorLocation(lastBox.nextElementSibling, 0);
                                  }
                                }, 10);
                                
                                api.close();
                              }
                            });
                            return;
                          }

                          const showDialog = (mode = 'accent', currentData: any = {}) => {
                            const accentColor = currentData.accentColor || defaultColor;
                            const headerColor = currentData.headerColor || defaultColor;
                            const contentColor = currentData.contentColor || '#f8f9fa';

                            const dialogConfig = {
                              title: `${displayName}の色を選択`,
                              initialData: {
                                colorMode: mode,
                                accentColor: accentColor,
                                headerColor: headerColor,
                                contentColor: contentColor
                              },
                              body: {
                                type: 'panel',
                                items: [
                                  {
                                    type: 'selectbox',
                                    name: 'colorMode',
                                    label: '色設定方法',
                                    items: [
                                      { text: 'アクセントカラー', value: 'accent' },
                                      { text: 'ヘッダー・コンテンツ別々', value: 'separate' }
                                    ]
                                  }
                                ]
                              },
                              buttons: [
                                {
                                  type: 'cancel',
                                  text: 'キャンセル'
                                },
                                {
                                  type: 'submit',
                                  text: '挿入',
                                  primary: true
                                }
                              ],
                              onChange: (api, details) => {
                                if (details.name === 'colorMode') {
                                  const data = api.getData();
                                  api.close();
                                  showDialog(data.colorMode, data);
                                }
                              },
                              onSubmit: (api) => {
                                const data = api.getData();
                                let html = '';
                                
                                // Determine color variables based on mode
                                let colorVars = '';
                                if (data.colorMode === 'accent') {
                                  const accentColor = data.accentColor || defaultColor;
                                  colorVars = `--accent: ${accentColor};`;
                                } else {
                                  const headerColor = data.headerColor || defaultColor;
                                  const contentColor = data.contentColor || '#f8f9fa';
                                  colorVars = `--header-color: ${headerColor}; --content-color: ${contentColor};`;
                                }
                                
                                switch(boxType) {
                                  case 'border':
                                    html = `<div class="border-box" style="${colorVars}">
                                      <header class="box-header">ここにタイトルを入力</header>
                                      <div class="box-content"><p>ここに内容を入力してください。</p></div>
                                    </div><p><br></p>`;
                                    break;
                                  case 'left-accent':
                                    html = `<div class="left-accent-box" style="${colorVars}">
                                      <header class="box-header">ここにタイトルを入力</header>
                                      <div class="box-content"><p>ここに内容を入力してください。</p></div>
                                    </div><p><br></p>`;
                                    break;
                                  case 'shadow':
                                    html = `<div class="shadow-box" style="${colorVars}">
                                      <header class="box-header">ここにタイトルを入力</header>
                                      <div class="box-content"><p>ここに内容を入力してください。</p></div>
                                    </div><p><br></p>`;
                                    break;
                                  case 'outline-title-band':
                                    html = `<div class="outline-title-band-box" style="${colorVars}">
                                      <header class="box-header">ここにタイトルを入力</header>
                                      <div class="box-content"><p>ここに内容を入力してください。</p></div>
                                    </div><p><br></p>`;
                                    break;
                                  case 'flag-header':
                                    html = `<div class="flag-header-box" style="${colorVars}">
                                      <header class="box-header">ここにタイトルを入力</header>
                                      <div class="box-content"><p>ここに内容を入力してください。</p></div>
                                    </div><p><br></p>`;
                                    break;
                                }
                                
                                editor.insertContent(html);
                                
                                // Position cursor after the inserted element
                                setTimeout(() => {
                                  const boxElements = editor.getBody().querySelectorAll('[class$="-box"]');
                                  const lastBox = boxElements[boxElements.length - 1];
                                  if (lastBox && lastBox.nextElementSibling) {
                                    editor.selection.setCursorLocation(lastBox.nextElementSibling, 0);
                                  }
                                }, 10);
                                
                                api.close();
                              }
                            } as any;

                            // Add appropriate color inputs based on mode
                            if (mode === 'accent') {
                              dialogConfig.body.items.push({
                                type: 'colorinput',
                                name: 'accentColor',
                                label: 'アクセントカラー',
                                value: accentColor
                              });
                            } else {
                              dialogConfig.body.items.push(
                                {
                                  type: 'colorinput',
                                  name: 'headerColor',
                                  label: 'ヘッダー色',
                                  value: headerColor
                                },
                                {
                                  type: 'colorinput',
                                  name: 'contentColor',
                                  label: 'コンテンツ背景色',
                                  value: contentColor
                                }
                              );
                            }

                            editor.windowManager.open(dialogConfig);
                          };

                          showDialog();
                        };

                        const items = [
                          {
                            type: 'menuitem',
                            text: 'ボーダーボックス',
                            onAction: () => openBoxDialog('border', 'ボーダーボックス')
                          },
                          {
                            type: 'menuitem',
                            text: '左アクセントボックス',
                            onAction: () => openBoxDialog('left-accent', '左アクセントボックス')
                          },
                          {
                            type: 'menuitem',
                            text: 'シャドウボックス',
                            onAction: () => openBoxDialog('shadow', 'シャドウボックス')
                          },
                          {
                            type: 'menuitem',
                            text: '枠線＋タイトル帯',
                            onAction: () => openBoxDialog('outline-title-band', '枠線＋タイトル帯')
                          },
                          {
                            type: 'menuitem',
                            text: '旗アイコン見出し',
                            onAction: () => openBoxDialog('flag-header', '旗アイコン見出し')
                          },
                          {
                            type: 'menuitem',
                            text: 'グラデーションボックス',
                            onAction: () => openBoxDialog('gradient', 'グラデーションボックス')
                          }
                        ];
                        callback(items);
                      }
                    });

                    // Enhanced custom headings button with color picker
                    editor.ui.registry.addMenuButton('custom_headings', {
                      text: 'カスタム見出し',
                      fetch: (callback) => {
                        const openHeadingDialog = (headingType: string, headingLevel: 'h2' | 'h3', displayName: string) => {
                          editor.windowManager.open({
                            title: `${displayName}の色を選択`,
                            body: {
                              type: 'panel',
                              items: [
                                {
                                  type: 'colorinput',
                                  name: 'color',
                                  label: 'アクセントカラー',
                                  value: '#007bff'
                                }
                              ]
                            },
                            buttons: [
                              {
                                type: 'cancel',
                                text: 'キャンセル'
                              },
                              {
                                type: 'submit',
                                text: '挿入',
                                primary: true
                              }
                            ],
                            onSubmit: (api) => {
                              const data = api.getData();
                              const selectedText = editor.selection.getContent({ format: 'text' }) || 'ここに見出しを入力';
                              const accentColor = data.color || '#007bff';
                              
                              let html = '';
                              if (headingType === 'stripe') {
                                html = `<${headingLevel} class="heading-${headingType}" style="--heading-color: ${accentColor};"><span>${selectedText}</span></${headingLevel}>`;
                              } else {
                                html = `<${headingLevel} class="heading-${headingType}" style="--heading-color: ${accentColor};">${selectedText}</${headingLevel}>`;
                              }
                              
                              editor.selection.setContent(html);
                              api.close();
                            }
                          });
                        };

                        const items = [
                          {
                            type: 'menuitem',
                            text: 'H2 ライン（実線下線）',
                            onAction: () => openHeadingDialog('line', 'h2', 'H2 ライン')
                          },
                          {
                            type: 'menuitem',
                            text: 'H3 ライン（実線下線）',
                            onAction: () => openHeadingDialog('line', 'h3', 'H3 ライン')
                          },
                          {
                            type: 'menuitem',
                            text: 'H2 ドット線（点線下線）',
                            onAction: () => openHeadingDialog('dotted', 'h2', 'H2 ドット線')
                          },
                          {
                            type: 'menuitem',
                            text: 'H3 ドット線（点線下線）',
                            onAction: () => openHeadingDialog('dotted', 'h3', 'H3 ドット線')
                          },
                          {
                            type: 'menuitem',
                            text: 'H2 クロス線（斜線）',
                            onAction: () => openHeadingDialog('cross', 'h2', 'H2 クロス線')
                          },
                          {
                            type: 'menuitem',
                            text: 'H3 クロス線（斜線）',
                            onAction: () => openHeadingDialog('cross', 'h3', 'H3 クロス線')
                          },
                          {
                            type: 'menuitem',
                            text: 'H2 スピーチバブル見出し',
                            onAction: () => openHeadingDialog('speech-bubble', 'h2', 'H2 スピーチバブル')
                          },
                          {
                            type: 'menuitem',
                            text: 'H3 スピーチバブル見出し',
                            onAction: () => openHeadingDialog('speech-bubble', 'h3', 'H3 スピーチバブル')
                          },
                          {
                            type: 'menuitem',
                            text: 'H2 ダッシュインセット見出し',
                            onAction: () => openHeadingDialog('dashed-inset', 'h2', 'H2 ダッシュインセット')
                          },
                          {
                            type: 'menuitem',
                            text: 'H3 ダッシュインセット見出し',
                            onAction: () => openHeadingDialog('dashed-inset', 'h3', 'H3 ダッシュインセット')
                          },
                          {
                            type: 'menuitem',
                            text: 'H2 ストライプ（斜め背景）',
                            onAction: () => openHeadingDialog('stripe', 'h2', 'H2 ストライプ')
                          },
                          {
                            type: 'menuitem',
                            text: 'H3 ストライプ（斜め背景）',
                            onAction: () => openHeadingDialog('stripe', 'h3', 'H3 ストライプ')
                          },
                          {
                            type: 'menuitem',
                            text: 'H2 リボン（タグリボン）',
                            onAction: () => openHeadingDialog('ribbon', 'h2', 'H2 リボン')
                          },
                          {
                            type: 'menuitem',
                            text: 'H3 リボン（タグリボン）',
                            onAction: () => openHeadingDialog('ribbon', 'h3', 'H3 リボン')
                          },
                          {
                            type: 'menuitem',
                            text: 'H2 アロー（矢印ノッチ）',
                            onAction: () => openHeadingDialog('arrow', 'h2', 'H2 アロー')
                          },
                          {
                            type: 'menuitem',
                            text: 'H3 アロー（矢印ノッチ）',
                            onAction: () => openHeadingDialog('arrow', 'h3', 'H3 アロー')
                          },
                          {
                            type: 'menuitem',
                            text: 'H2 シャドウバー',
                            onAction: () => openHeadingDialog('shadow', 'h2', 'H2 シャドウバー')
                          },
                          {
                            type: 'menuitem',
                            text: 'H3 シャドウバー',
                            onAction: () => openHeadingDialog('shadow', 'h3', 'H3 シャドウバー')
                          },
                          {
                            type: 'menuitem',
                            text: 'H2 ドット',
                            onAction: () => openHeadingDialog('dot', 'h2', 'H2 ドット')
                          },
                          {
                            type: 'menuitem',
                            text: 'H3 ドット',
                            onAction: () => openHeadingDialog('dot', 'h3', 'H3 ドット')
                          },
                          {
                            type: 'menuitem',
                            text: 'H2 サイドバー',
                            onAction: () => openHeadingDialog('sidebar', 'h2', 'H2 サイドバー')
                          },
                          {
                            type: 'menuitem',
                            text: 'H3 サイドバー',
                            onAction: () => openHeadingDialog('sidebar', 'h3', 'H3 サイドバー')
                          }
                        ];
                        callback(items);
                      }
                    });

                    // Enhanced custom lists button with color settings
                    editor.ui.registry.addMenuButton('custom_lists', {
                      text: 'カスタムリスト',
                      fetch: (callback) => {
                        const openListDialog = (listType: string, displayName: string, defaultColor: string) => {
                          // Heart list doesn't need color picker since it uses emoji
                          if (listType === 'heart') {
                            const html = `<ul class="list-heart">
                              <li>リストアイテム1</li>
                              <li>リストアイテム2</li>
                              <li>リストアイテム3</li>
                            </ul>`;
                            
                            editor.insertContent(html);
                            return;
                          }

                          editor.windowManager.open({
                            title: `${displayName}の色を選択`,
                            body: {
                              type: 'panel',
                              items: [
                                {
                                  type: 'colorinput',
                                  name: 'listColor',
                                  label: 'リスト色',
                                  value: defaultColor
                                }
                              ]
                            },
                            buttons: [
                              {
                                type: 'cancel',
                                text: 'キャンセル'
                              },
                              {
                                type: 'submit',
                                text: '挿入',
                                primary: true
                              }
                            ],
                            onSubmit: (api) => {
                              const data = api.getData();
                              const listColor = data.listColor || defaultColor;
                              let html = '';
                              
                              switch(listType) {
                                case 'check':
                                  html = `<ul class="list-check" style="--list-color: ${listColor};">
                                    <li>リストアイテム1</li>
                                    <li>リストアイテム2</li>
                                    <li>リストアイテム3</li>
                                  </ul>`;
                                  break;
                                case 'star':
                                  html = `<ul class="list-star" style="--list-color: ${listColor};">
                                    <li>リストアイテム1</li>
                                    <li>リストアイテム2</li>
                                    <li>リストアイテム3</li>
                                  </ul>`;
                                  break;
                                case 'num-circle':
                                  html = `<ol class="list-num-circle" style="--list-color: ${listColor};">
                                    <li>リストアイテム1</li>
                                    <li>リストアイテム2</li>
                                    <li>リストアイテム3</li>
                                  </ol>`;
                                  break;
                                case 'num-square':
                                  html = `<ol class="list-num-square" style="--list-color: ${listColor};">
                                    <li>リストアイテム1</li>
                                    <li>リストアイテム2</li>
                                    <li>リストアイテム3</li>
                                  </ol>`;
                                  break;
                                case 'arrow':
                                  html = `<ul class="list-arrow" style="--list-color: ${listColor};">
                                    <li>リストアイテム1</li>
                                    <li>リストアイテム2</li>
                                    <li>リストアイテム3</li>
                                  </ul>`;
                                  break;
                                case 'double-arrow':
                                  html = `<ul class="list-double-arrow" style="--list-color: ${listColor};">
                                    <li>リストアイテム1</li>
                                    <li>リストアイテム2</li>
                                    <li>リストアイテム3</li>
                                  </ul>`;
                                  break;
                                case 'none':
                                  html = `<ul class="list-none">
                                    <li>リストアイテム1</li>
                                    <li>リストアイテム2</li>
                                    <li>リストアイテム3</li>
                                  </ul>`;
                                  break;
                              }
                              
                              editor.insertContent(html);
                              api.close();
                            }
                          });
                        };

                        const items = [
                          {
                            type: 'menuitem',
                            text: 'チェックリスト ✓',
                            onAction: () => openListDialog('check', 'チェックリスト', '#28a745')
                          },
                          {
                            type: 'menuitem',
                            text: 'スターリスト ★',
                            onAction: () => openListDialog('star', 'スターリスト', '#ffc107')
                          },
                          {
                            type: 'menuitem',
                            text: 'ハートリスト 💖',
                            onAction: () => openListDialog('heart', 'ハートリスト', '#e91e63')
                          },
                          {
                            type: 'menuitem',
                            text: '番号付き（丸）',
                            onAction: () => openListDialog('num-circle', '番号付き（丸）', '#007bff')
                          },
                          {
                            type: 'menuitem',
                            text: '番号付き（四角）',
                            onAction: () => openListDialog('num-square', '番号付き（四角）', '#28a745')
                          },
                          {
                            type: 'menuitem',
                            text: '矢印リスト →',
                            onAction: () => openListDialog('arrow', '矢印リスト', '#007bff')
                          },
                          {
                            type: 'menuitem',
                            text: 'ダブル矢印リスト ⇒',
                            onAction: () => openListDialog('double-arrow', 'ダブル矢印リスト', '#dc3545')
                          },
                          {
                            type: 'menuitem',
                            text: 'スタイルなし',
                            onAction: () => openListDialog('none', 'スタイルなし', '#333333')
                          }
                        ];
                        callback(items);
                      }
                    });
                  }
                }}
              />
            </div>
            
            <div>
              <Label htmlFor="coverImage">カバー画像</Label>
              <Input 
                id="coverImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1"
              />
              {(imagePreview || coverImage) && (
                <div className="mt-2">
                  <p className="text-sm mb-1">プレビュー</p>
                  <img 
                    src={imagePreview || coverImage} 
                    alt="カバー画像プレビュー" 
                    className="max-h-40 rounded-md"
                  />
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="tags">タグ</Label>
              <div className="flex gap-2 mt-1">
                <Input 
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="タグを入力"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button 
                  type="button" 
                  onClick={handleAddTag}
                  variant="outline"
                >
                  追加
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <div 
                      key={tag} 
                      className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTag(tag)}
                        className="text-primary hover:text-destructive"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="author">作成者</Label>
              <Input 
                id="author"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="作成者名を入力"
              />
            </div>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="published" 
                  checked={isPublished}
                  onCheckedChange={(checked) => setIsPublished(checked as boolean)}
                />
                <Label htmlFor="published">公開する</Label>
              </div>
              
              <div>
                <Label htmlFor="scheduledFor" className="block mb-1">予約投稿</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !scheduledFor && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledFor ? format(scheduledFor, "yyyy/MM/dd") : "日付を選択"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledFor}
                      onSelect={setScheduledFor}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            {initialData && (
              <Button 
                type="button" 
                variant="outline"
                onClick={onSuccess}
              >
                キャンセル
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : initialData ? '更新する' : '作成する'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
