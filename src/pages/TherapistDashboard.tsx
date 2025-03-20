
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  MessageSquare,
  Users,
  Image as ImageIcon,
  Calendar,
  Settings,
  ChevronRight,
  Edit,
  Trash,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TherapistBookingRequests } from "@/components/therapist/TherapistBookingRequests";
import { TherapistProfileForm } from "@/components/therapist/TherapistProfileForm";
import { TherapistPostForm } from "@/components/therapist/TherapistPostForm";
import { supabase } from "@/integrations/supabase/client";
import TherapistLayout from "@/components/therapist/TherapistLayout";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TherapistPost {
  id: string;
  therapist_id: string;
  title: string;
  content: string;
  likes: number;
  created_at: string;
}

const TherapistDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [therapistData, setTherapistData] = useState<any>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [posts, setPosts] = useState<TherapistPost[]>([]);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTherapistData = async () => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error("ログインが必要です");
          navigate("/therapist-login");
          return;
        }

        // Fetch therapist data
        const { data: therapistData, error: therapistError } = await supabase
          .from("therapists")
          .select("*")
          .eq("id", user.id)
          .single();

        if (therapistError && therapistError.code !== "PGRST116") {
          console.error("Error fetching therapist data:", therapistError);
          toast.error("セラピスト情報の取得に失敗しました");
        }

        if (therapistData) {
          setTherapistData(therapistData);
        }

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile data:", profileError);
          toast.error("プロフィール情報の取得に失敗しました");
        } else {
          setProfileData(profileData);
        }

        // Fetch unread messages count
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .eq("receiver_id", user.id)
          .eq("is_read", false);

        if (messagesError) {
          console.error("Error fetching messages:", messagesError);
        } else {
          setUnreadMessages(messagesData?.length || 0);
        }

        // Fetch bookings
        const { data: bookingsData, error: bookingsError } = await supabase
          .from("bookings")
          .select("*")
          .eq("therapist_id", user.id);

        if (bookingsError) {
          console.error("Error fetching bookings:", bookingsError);
        } else {
          setBookings(bookingsData || []);
        }

        // Fetch posts
        const { data: postsData, error: postsError } = await supabase
          .from("therapist_posts")
          .select("*")
          .eq("therapist_id", user.id);

        if (postsError) {
          console.error("Error fetching posts:", postsError);
        } else {
          setPosts(postsData || []);
        }
      } catch (error) {
        console.error("Error in fetchTherapistData:", error);
        toast.error("データの取得中にエラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTherapistData();

    // Set up real-time subscription for new messages
    const messagesSubscription = supabase
      .channel("messages-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${supabase.auth.getUser().then(({ data }) => data.user?.id)}`,
        },
        (payload) => {
          setUnreadMessages((prev) => prev + 1);
          toast("新しいメッセージが届きました", {
            description: "確認するにはメッセージ画面に移動してください",
            action: {
              label: "確認する",
              onClick: () => navigate("/messages"),
            },
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
    };
  }, [navigate]);

  const handleCreatePost = async () => {
    try {
      if (!newPostTitle.trim() || !newPostContent.trim()) {
        toast.error("タイトルと内容を入力してください");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("ログインが必要です");
        return;
      }

      const { data, error } = await supabase.from("therapist_posts").insert({
        therapist_id: user.id,
        title: newPostTitle,
        content: newPostContent,
      }).select();

      if (error) {
        throw error;
      }

      toast.success("投稿が作成されました");
      setPosts([...(data || []), ...posts]);
      setNewPostTitle("");
      setNewPostContent("");
      setIsCreatingPost(false);
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("投稿の作成に失敗しました");
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("therapist_posts")
        .delete()
        .eq("id", postId);

      if (error) {
        throw error;
      }

      setPosts(posts.filter((post) => post.id !== postId));
      toast.success("投稿が削除されました");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("投稿の削除に失敗しました");
    }
  };

  // QuickAction component
  const QuickAction = ({ icon, title, count, onClick }: any) => (
    <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={onClick}>
      <CardContent className="p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{title}</h3>
          {count !== undefined && (
            <p className="text-sm text-muted-foreground">{count}</p>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <TherapistLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </TherapistLayout>
    );
  }

  if (!therapistData && !isEditing) {
    return (
      <TherapistLayout>
        <div className="container max-w-4xl py-12">
          <Card>
            <CardHeader>
              <CardTitle>プロフィール未設定</CardTitle>
              <CardDescription>
                セラピストプロフィールをまだ設定していません。セラピスト情報を入力して、お客様に自分をアピールしましょう。
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => setIsEditing(true)}>
                今すぐプロフィールを設定する
              </Button>
            </CardFooter>
          </Card>
        </div>
      </TherapistLayout>
    );
  }

  if (isEditing) {
    return (
      <TherapistLayout>
        <div className="container max-w-4xl py-12">
          <TherapistProfileForm
            existingData={therapistData}
            onCancel={() => setIsEditing(false)}
            onSuccess={(data) => {
              setTherapistData(data);
              setIsEditing(false);
              toast.success("プロフィールが更新されました");
            }}
          />
        </div>
      </TherapistLayout>
    );
  }

  const pendingBookingsCount =
    bookings?.filter((booking: any) => booking.status === "pending")?.length || 0;

  if (activeSection === "dashboard") {
    return (
      <TherapistLayout>
        <div className="container max-w-7xl py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">セラピストダッシュボード</h1>
              <p className="text-muted-foreground">
                {therapistData?.name}さん、おはようございます。最新の情報をチェックしましょう。
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="h-10"
              >
                <Edit className="mr-2 h-4 w-4" />
                プロフィール編集
              </Button>
              <Button onClick={() => navigate("/messages")} className="h-10">
                <MessageSquare className="mr-2 h-4 w-4" />
                メッセージ {unreadMessages > 0 && `(${unreadMessages})`}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <QuickAction
              icon={<CalendarCheck className="w-6 h-6" />}
              title="スケジュール管理"
              count={`${pendingBookingsCount}件の新規予約`}
              onClick={() => setActiveSection("bookings")}
            />
            <QuickAction
              icon={<Users className="w-6 h-6" />}
              title="顧客リスト"
              count="お客様情報を管理"
              onClick={() => setActiveSection("customers")}
            />
            <QuickAction
              icon={<ImageIcon className="w-6 h-6" />}
              title="ギャラリー管理"
              count="写真・動画の投稿"
              onClick={() => setActiveSection("posts")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>最近の予約</CardTitle>
                <CardDescription>最新の予約状況と承認待ちの確認</CardDescription>
              </CardHeader>
              <CardContent>
                {bookings && bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings
                      .sort(
                        (a: any, b: any) =>
                          new Date(b.created_at).getTime() -
                          new Date(a.created_at).getTime()
                      )
                      .slice(0, 5)
                      .map((booking: any) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between border-b pb-4"
                        >
                          <div>
                            <p className="font-medium">
                              {new Date(booking.date).toLocaleDateString(
                                "ja-JP",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {booking.status === "pending"
                                ? "承認待ち"
                                : booking.status === "confirmed"
                                ? "確定"
                                : booking.status === "cancelled"
                                ? "キャンセル"
                                : "完了"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {booking.price.toLocaleString()}円
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-muted-foreground">
                    予約がありません
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  onClick={() => setActiveSection("bookings")}
                  className="w-full"
                >
                  すべての予約を見る
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>メッセージ</CardTitle>
                <CardDescription>最新のメッセージ通知</CardDescription>
              </CardHeader>
              <CardContent>
                {unreadMessages > 0 ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="font-medium text-center">
                      {unreadMessages}件の未読メッセージがあります
                    </p>
                  </div>
                ) : (
                  <p className="text-center py-6 text-muted-foreground">
                    新しいメッセージはありません
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  onClick={() => navigate("/messages")}
                  className="w-full"
                >
                  メッセージを確認する
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>最近の投稿</CardTitle>
                    <CardDescription>
                      あなたの投稿したブログ記事やギャラリー
                    </CardDescription>
                  </div>
                  <Button onClick={() => setActiveSection("posts")}>
                    すべての投稿を見る
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {posts && posts.length > 0 ? (
                  <div className="space-y-6">
                    {posts
                      .sort(
                        (a, b) =>
                          new Date(b.created_at).getTime() -
                          new Date(a.created_at).getTime()
                      )
                      .slice(0, 3)
                      .map((post) => (
                        <div key={post.id} className="border-b pb-6">
                          <h3 className="text-lg font-medium mb-2">
                            {post.title}
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            {post.content.length > 100
                              ? `${post.content.substring(0, 100)}...`
                              : post.content}
                          </p>
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">
                              {new Date(post.created_at).toLocaleDateString(
                                "ja-JP",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </p>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePost(post.id)}
                              >
                                <Trash className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      まだ投稿がありません
                    </p>
                    <Button onClick={() => setIsCreatingPost(true)}>
                      最初の投稿を作成する
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </TherapistLayout>
    );
  }

  if (activeSection === "bookings") {
    return (
      <TherapistLayout>
        <div className="container max-w-7xl py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">予約管理</h1>
              <p className="text-muted-foreground">
                予約の確認と管理を行うことができます
              </p>
            </div>
            <Button onClick={() => setActiveSection("dashboard")}>
              ダッシュボードに戻る
            </Button>
          </div>

          <TherapistBookingRequests therapistId={profileData?.id} />
        </div>
      </TherapistLayout>
    );
  }

  if (activeSection === "posts") {
    return (
      <TherapistLayout>
        <div className="container max-w-7xl py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">投稿管理</h1>
              <p className="text-muted-foreground">
                ブログやギャラリーの投稿を管理できます
              </p>
            </div>
            <Button onClick={() => setActiveSection("dashboard")}>
              ダッシュボードに戻る
            </Button>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="mb-8">
              <TabsTrigger value="all">すべての投稿</TabsTrigger>
              <TabsTrigger value="create">新規投稿</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts && posts.length > 0 ? (
                  posts.map((post) => (
                    <Card key={post.id}>
                      <CardHeader>
                        <CardTitle>{post.title}</CardTitle>
                        <CardDescription>
                          {new Date(post.created_at).toLocaleDateString(
                            "ja-JP",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>{post.content}</p>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <div className="text-sm text-muted-foreground">
                          いいね: {post.likes}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          削除
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="md:col-span-2 text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      まだ投稿がありません
                    </p>
                    <Button onClick={() => setIsCreatingPost(true)}>
                      最初の投稿を作成する
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <CardTitle>新規投稿を作成</CardTitle>
                  <CardDescription>
                    お客様に見てもらいたい内容を投稿しましょう
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">タイトル</Label>
                    <Input
                      id="title"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="投稿のタイトルを入力してください"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">内容</Label>
                    <Textarea
                      id="content"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="投稿の内容を入力してください"
                      rows={8}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setIsCreatingPost(false)}>
                    キャンセル
                  </Button>
                  <Button onClick={handleCreatePost}>投稿する</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </TherapistLayout>
    );
  }

  if (activeSection === "customers") {
    // Fetch and display customer information
    return (
      <TherapistLayout>
        <div className="container max-w-7xl py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">顧客管理</h1>
              <p className="text-muted-foreground">
                予約したお客様の情報を確認できます
              </p>
            </div>
            <Button onClick={() => setActiveSection("dashboard")}>
              ダッシュボードに戻る
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>顧客リスト</CardTitle>
              <CardDescription>予約履歴のあるお客様の一覧</CardDescription>
            </CardHeader>
            <CardContent>
              {bookings && bookings.length > 0 ? (
                <div className="space-y-4">
                  {Array.from(
                    new Set(bookings.map((booking: any) => booking.user_id))
                  ).map((userId: any) => {
                    const userBookings = bookings.filter(
                      (booking: any) => booking.user_id === userId
                    );
                    const lastBooking = userBookings.sort(
                      (a: any, b: any) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )[0];

                    return (
                      <div
                        key={userId}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>
                              {userId ? userId.substring(0, 2).toUpperCase() : "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">顧客 ID: {userId?.substring(0, 8)}...</p>
                            <p className="text-sm text-muted-foreground">
                              最終予約日:{" "}
                              {new Date(lastBooking.date).toLocaleDateString(
                                "ja-JP"
                              )}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          メッセージ
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center py-6 text-muted-foreground">
                  顧客データはまだありません
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </TherapistLayout>
    );
  }

  return null;
};

export default TherapistDashboard;
