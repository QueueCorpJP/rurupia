
interface Post {
  id: number;
  content: string;
  image?: string;
  date: string;
}

interface TherapistPostsProps {
  posts: Post[];
  therapistName: string;
}

const TherapistPosts = ({ posts, therapistName }: TherapistPostsProps) => {
  return (
    <div className="mt-8">
      <h2 className="font-semibold text-lg mb-3">最近の投稿</h2>
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="border rounded-lg overflow-hidden">
            {post.image && (
              <img 
                src={post.image} 
                alt="Post" 
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <div className="flex justify-between">
                <div className="font-medium">{therapistName}</div>
                <div className="text-xs text-muted-foreground">{post.date}</div>
              </div>
              <p className="text-sm mt-2">{post.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TherapistPosts;
