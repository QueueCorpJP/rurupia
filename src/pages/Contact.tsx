
import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form validation would go here
    
    // Form submission would go here
    
    // Show success toast
    toast({
      title: "お問い合わせを送信しました",
      description: "担当者からの返信をお待ちください。",
    });
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">お問い合わせ</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ご質問やご意見などございましたら、こちらのフォームからお気軽にお問い合わせください。
              通常、営業日2日以内にご返信いたします。
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="p-6 text-center flex flex-col items-center">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium text-lg mb-2">所在地</h3>
              <p className="text-muted-foreground">
                〒150-0002<br />
                東京都渋谷区渋谷2-24-12
              </p>
            </Card>
            
            <Card className="p-6 text-center flex flex-col items-center">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium text-lg mb-2">電話番号</h3>
              <p className="text-muted-foreground">03-1234-5678</p>
              <p className="text-sm text-muted-foreground mt-2">（平日 10:00-18:00）</p>
            </Card>
            
            <Card className="p-6 text-center flex flex-col items-center">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium text-lg mb-2">メールアドレス</h3>
              <p className="text-muted-foreground">info@nokutoru.com</p>
              <p className="text-sm text-muted-foreground mt-2">（24時間受付）</p>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">お名前 <span className="text-red-500">*</span></Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス <span className="text-red-500">*</span></Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">電話番号</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">件名 <span className="text-red-500">*</span></Label>
                  <Input 
                    id="subject" 
                    name="subject" 
                    value={formData.subject} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">お問い合わせ内容 <span className="text-red-500">*</span></Label>
                  <Textarea 
                    id="message" 
                    name="message" 
                    rows={6} 
                    value={formData.message} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                
                <Button type="submit" className="w-full md:w-auto">送信する</Button>
              </form>
            </div>
            
            <div className="lg:col-span-2">
              <Card className="p-6 h-full">
                <h3 className="font-medium text-xl mb-4">営業時間</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>月曜日 - 金曜日:</span>
                    <span>10:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>土曜日:</span>
                    <span>10:00 - 15:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>日曜日・祝日:</span>
                    <span>休業</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium text-xl mb-4">よくあるご質問</h3>
                  <p className="text-muted-foreground mb-4">
                    お問い合わせの前に、よくある質問をご確認ください。
                  </p>
                  <Button variant="outline" className="w-full">
                    FAQを見る
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
