import { useState } from 'react';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { MapPin, Mail, Send } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !subject || !message) {
      toast.error('すべての項目を入力してください');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .insert({
          name,
          email,
          subject,
          message
        });
      
      if (error) {
        console.error('Error submitting inquiry:', error);
        toast.error('お問い合わせの送信に失敗しました');
      } else {
        toast.success('お問い合わせを送信しました', {
          description: '担当者からの返信をお待ちください。'
        });
        // Reset form
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">お問い合わせ</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            ご質問、ご要望、お問い合わせがありましたら、以下のフォームよりお気軽にご連絡ください。24時間以内に担当者からご連絡いたします。
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>連絡先情報</CardTitle>
              <CardDescription>
                以下の方法でもお問い合わせいただけます。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-4">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium">住所</h3>
                  <p className="text-sm text-muted-foreground">
                    〒130-0022<br />
                    東京都墨田区江東橋4丁目27番14号<br />
                    楽天地ビル3F
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium">メールアドレス</h3>
                  <p className="text-sm text-muted-foreground">
                  info@noctle.com
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    24時間受付中
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>お問い合わせフォーム</CardTitle>
              <CardDescription>
                以下のフォームに必要事項をご記入ください。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">お名前 <span className="text-red-500">*</span></Label>
                      <Input 
                        id="name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="山田 太郎" 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">メールアドレス <span className="text-red-500">*</span></Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">件名 <span className="text-red-500">*</span></Label>
                    <Input 
                      id="subject" 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="お問い合わせの件名" 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">メッセージ <span className="text-red-500">*</span></Label>
                    <Textarea 
                      id="message" 
                      rows={6} 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="お問い合わせ内容をご記入ください" 
                      required 
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "送信中..."
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      送信する
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
