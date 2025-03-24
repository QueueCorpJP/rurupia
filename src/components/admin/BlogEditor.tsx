
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { Calendar as CalendarIcon, Check, FileImage, Image, Loader2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface BlogEditorProps {
  onSave: () => void;
  postId?: string;
}

interface Category {
  id: string;
  name: string;
}

interface BlogFormValues {
  title: string;
  content: string;
  category_id: string;
  excerpt: string;
  cover_image: string | null;
  tags: string;
  published: boolean;
  scheduled_for: Date | null;
}

export function BlogEditor({ onSave, postId }: BlogEditorProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const form = useForm<BlogFormValues>({
    defaultValues: {
      title: '',
      content: '',
      category_id: '',
      excerpt: '',
      cover_image: null,
      tags: '',
      published: false,
      scheduled_for: null,
    }
  });

  useEffect(() => {
    // Fetch categories
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('blog_categories')
          .select('id, name');
        
        if (error) throw error;
        
        if (data) {
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: 'エラー',
          description: 'カテゴリを取得できませんでした。',
          variant: 'destructive',
        });
      }
    }

    fetchCategories();

    // If editing an existing post, fetch its data
    if (postId) {
      fetchPost(postId);
    }
  }, [postId]);

  const fetchPost = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        form.reset({
          title: data.title,
          content: data.content,
          category_id: data.category_id || '',
          excerpt: data.excerpt,
          cover_image: data.cover_image,
          tags: data.tags ? data.tags.join(', ') : '',
          published: data.published || false,
          scheduled_for: data.scheduled_for ? new Date(data.scheduled_for) : null,
        });

        if (data.cover_image) {
          setImagePreview(data.cover_image);
        }
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast({
        title: 'エラー',
        description: '投稿データを取得できませんでした。',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `blog/${fileName}`;
    
    setUploadingImage(true);
    
    try {
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('blog')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('blog')
        .getPublicUrl(filePath);
      
      setImagePreview(data.publicUrl);
      form.setValue('cover_image', data.publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'エラー',
        description: '画像のアップロードに失敗しました。',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (values: BlogFormValues) => {
    setLoading(true);
    
    try {
      // Convert comma-separated tags to array
      const tagsArray = values.tags.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
      
      const postData = {
        title: values.title,
        content: values.content,
        category_id: values.category_id,
        excerpt: values.excerpt,
        cover_image: values.cover_image,
        tags: tagsArray,
        published: values.published,
        scheduled_for: values.scheduled_for,
        author_name: 'Admin', // This should be replaced with the actual user name
      };
      
      let result;
      
      if (postId) {
        // Update existing post
        result = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', postId);
      } else {
        // Insert new post
        result = await supabase
          .from('blog_posts')
          .insert(postData);
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: '成功',
        description: postId ? '投稿が更新されました。' : '新しい投稿が作成されました。',
      });
      
      onSave();
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: 'エラー',
        description: '投稿の保存に失敗しました。',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && postId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">投稿データを読み込み中...</p>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{postId ? '投稿を編集' : '新規投稿を作成'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="content">コンテンツ</TabsTrigger>
                <TabsTrigger value="settings">設定</TabsTrigger>
                <TabsTrigger value="media">メディア</TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>タイトル</FormLabel>
                      <FormControl>
                        <Input placeholder="記事のタイトルを入力" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>本文</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="記事の本文を入力してください" 
                          className="min-h-[300px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>概要（抜粋）</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="記事の概要を入力（検索結果やカードで表示されます）" 
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>カテゴリ</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="カテゴリを選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>タグ</FormLabel>
                      <FormControl>
                        <Input placeholder="タグをカンマ区切りで入力（例: マッサージ, リラクゼーション）" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                      <FormControl>
                        <Input 
                          type="checkbox" 
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="w-4 h-4" 
                        />
                      </FormControl>
                      <FormLabel className="mt-0">すぐに公開する</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="scheduled_for"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>公開予定日</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={!field.value ? "text-muted-foreground" : ""}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "yyyy年MM月dd日") : "公開日を選択"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={(date) => field.onChange(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="media" className="space-y-4">
                <FormItem>
                  <FormLabel>カバー画像</FormLabel>
                  <div className="grid gap-4">
                    <div className="border-2 border-dashed rounded-md p-4">
                      <div className="flex flex-col items-center justify-center gap-2">
                        {imagePreview ? (
                          <div className="relative w-full">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="rounded-md w-full max-h-[300px] object-cover"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                setImagePreview(null);
                                form.setValue('cover_image', null);
                              }}
                            >
                              削除
                            </Button>
                          </div>
                        ) : (
                          <>
                            <FileImage className="h-10 w-10 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              クリックして画像をアップロード
                            </p>
                          </>
                        )}
                        
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={onFileChange}
                          className={imagePreview ? "hidden" : ""}
                          disabled={uploadingImage}
                        />
                        
                        {uploadingImage && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            アップロード中...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </FormItem>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onSave}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={loading || uploadingImage}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    保存
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
