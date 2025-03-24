
import { useState, useEffect } from 'react';
import { TherapistLayout } from '@/components/therapist/TherapistLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const TherapistPosts = () => {
  const [therapistId, setTherapistId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const getTherapistData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setTherapistId(user.id);
          
          // Here we would typically fetch posts
          // This is a placeholder for now
          const mockPosts = []; // In a real app, fetch from Supabase
          setPosts(mockPosts);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    getTherapistData();
  }, []);

  return (
    <TherapistLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">記事管理</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            新しい記事
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-3">読み込み中...</span>
          </div>
        ) : posts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Post cards would go here */}
            {posts.map((post, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-medium">{post.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {post.excerpt}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <h3 className="font-medium text-lg">記事がありません</h3>
            <p className="text-muted-foreground mt-2 mb-4">
              新しい記事を作成して、あなたの専門知識を共有しましょう
            </p>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              最初の記事を作成
            </Button>
          </div>
        )}
      </div>
    </TherapistLayout>
  );
};

export default TherapistPosts;
