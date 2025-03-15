
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { ArrowLeft, Heart, MessageSquare, Image, Eye, Clock, Lock } from 'lucide-react';
import { therapists } from '../utils/data';
import { Therapist } from '../utils/types';

interface Post {
  id: number;
  content: string;
  image?: string;
  date: string;
  likes: number;
  comments: number;
  isPrivate?: boolean;
  isScheduled?: boolean;
  scheduledDate?: string;
}

const TherapistPosts = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<number[]>([]);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      if (id) {
        const foundTherapist = therapists.find(t => t.id === parseInt(id));
        setTherapist(foundTherapist || null);
        
        // Mock posts data with more content for this page
        setPosts([
          {
            id: 1,
            content: "今日は新しいアロマオイルを使った施術をしました。お客様にも大好評でした！アロマテラピーは心と体の両方に効果があり、特にラベンダーオイルはリラックス効果が高いです。皆さんもぜひ試してみてください。",
            image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3",
            date: "2日前",
            likes: 15,
            comments: 3
          },
          {
            id: 2,
            content: "マッサージの技術向上のための研修に参加してきました。新しい知識をセッションに活かせるのが楽しみです。特に肩こりと腰痛に効果的な新しい手技を学びました。次回のセッションでぜひお試しください！",
            image: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?ixlib=rb-4.0.3",
            date: "1週間前",
            likes: 24,
            comments: 5
          },
          {
            id: 3,
            content: "来週から新しいサービスを始めます。詳細は近日中に発表しますので、お楽しみに！",
            date: "2週間前",
            likes: 10,
            comments: 2,
            isScheduled: true,
            scheduledDate: "明日公開"
          },
          {
            id: 4,
            content: "限定コンテンツです。フォロワーの皆様だけに特別なマッサージテクニックを紹介します。日常生活でも簡単にできるセルフケアの方法です。",
            image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3",
            date: "3週間前",
            likes: 32,
            comments: 7,
            isPrivate: true
          }
        ]);
      }
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [id]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
            <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
            <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!therapist) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">セラピストが見つかりません</h2>
          <p className="text-muted-foreground mt-2">
            お探しのセラピストは存在しないか、削除されました。
          </p>
          <button
            onClick={() => navigate('/therapists')}
            className="inline-flex items-center mt-4 text-primary hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            全てのセラピストに戻る
          </button>
        </div>
      </Layout>
    );
  }

  const togglePostExpansion = (postId: number) => {
    setExpandedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId) 
        : [...prev, postId]
    );
  };

  const isPostExpanded = (postId: number) => expandedPosts.includes(postId);
  const japaneseName = `${therapist.name}（${therapist.name.split(' ')[0]}）`;

  return (
    <Layout>
      <button
        onClick={() => navigate(`/therapists/${id}`)}
        className="inline-flex items-center mb-6 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        セラピスト詳細に戻る
      </button>
      
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
            {/* Avatar could be added here */}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{japaneseName}の投稿</h1>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>{posts.length}件の投稿</span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsFollowing(!isFollowing)}
            className={`ml-auto px-4 py-1 rounded-full text-sm font-medium ${
              isFollowing 
                ? 'bg-primary/10 text-primary' 
                : 'bg-primary text-primary-foreground'
            }`}
          >
            {isFollowing ? 'フォロー中' : 'フォローする'}
          </button>
        </div>
        
        <div className="space-y-6">
          {posts.map(post => (
            <div key={post.id} className="border rounded-lg overflow-hidden bg-card">
              {/* Post Header */}
              <div className="p-4 pb-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                    {/* Avatar could be added here */}
                  </div>
                  <div>
                    <div className="font-medium">{japaneseName}</div>
                    <div className="text-xs text-muted-foreground">{post.date}</div>
                  </div>
                </div>
                
                {post.isScheduled && (
                  <div className="text-xs flex items-center text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {post.scheduledDate || '予約投稿'}
                  </div>
                )}
                
                {post.isPrivate && (
                  <div className="text-xs flex items-center text-muted-foreground">
                    <Lock className="h-3 w-3 mr-1" />
                    フォロワー限定
                  </div>
                )}
              </div>
              
              {/* Post Content */}
              <div className="px-4 pb-3">
                {post.isPrivate && !isFollowing ? (
                  <div className="py-6 text-center">
                    <Lock className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground mb-3">このコンテンツはフォロワー限定です</p>
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm">
                      フォローして投稿を見る
                    </button>
                  </div>
                ) : (
                  <>
                    {post.content.length <= 140 || isPostExpanded(post.id) ? (
                      <p className="text-sm mt-2 whitespace-pre-wrap">{post.content}</p>
                    ) : (
                      <>
                        <p className="text-sm mt-2 whitespace-pre-wrap">
                          {post.content.substring(0, 140)}...
                        </p>
                        <button 
                          onClick={() => togglePostExpansion(post.id)}
                          className="text-sm text-primary mt-1 hover:underline"
                        >
                          詳細を表示
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
              
              {/* Post Image (if exists) */}
              {post.image && !post.isPrivate && (
                <div className={post.isPrivate && !isFollowing ? "filter blur-sm" : ""}>
                  <img 
                    src={post.image} 
                    alt="Post" 
                    className="w-full max-h-96 object-cover"
                  />
                </div>
              )}
              
              {/* Post Actions */}
              <div className="px-4 py-3 flex items-center space-x-6 text-muted-foreground border-t">
                <button className="flex items-center text-sm hover:text-primary transition-colors">
                  <Heart className="h-4 w-4 mr-1" />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center text-sm hover:text-primary transition-colors">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>{post.comments}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default TherapistPosts;
