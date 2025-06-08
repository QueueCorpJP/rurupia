import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Editor } from '@tinymce/tinymce-react';

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
  const editorRef = useRef<any>(null);
  
  useEffect(() => {
    fetchCategories();
    checkAdminStatus();
  }, []);

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
            
            <div>
              <Label htmlFor="content">内容 <span className="text-destructive">*</span></Label>
              <Editor
                apiKey={import.meta.env.VITE_TINYMCE_API_KEY || 'no-api-key'}
                onInit={(evt, editor) => editorRef.current = editor}
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
                    'removeformat | help',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                  branding: false,
                  promotion: false,
                  readonly: false  // Ensure editor is not read-only
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
