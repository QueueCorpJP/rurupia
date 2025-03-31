
import Layout from "@/components/Layout";
import { MapPin, Mail, Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const About = () => {
  const companyInfo = {
    name: "株式会社のくとる",
    established: "2022年4月",
    capital: "1,000万円",
    ceo: "山田太郎",
    employees: "10名",
    business: "リラクゼーションサービスマッチングプラットフォームの運営",
    address: "〒150-0002 東京都渋谷区渋谷2-24-12",
    email: "info@nokutoru.com",
    phone: "03-1234-5678",
  };

  return (
    <Layout>
      <div className="container py-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center">会社概要</h1>
            <div className="h-1 w-20 bg-primary mx-auto"></div>
            
            <p className="text-muted-foreground text-center mt-6 mb-12">
              のくとるは、質の高い男性セラピストによるリラクゼーションサービスを
              <br className="hidden md:inline" />
              安心して利用できるマッチングプラットフォームです
            </p>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 md:p-8">
                <h2 className="text-2xl font-semibold mb-6 text-center">企業情報</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                    <div className="font-medium text-muted-foreground">会社名</div>
                    <div className="md:col-span-2">{companyInfo.name}</div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                    <div className="font-medium text-muted-foreground">設立</div>
                    <div className="md:col-span-2">{companyInfo.established}</div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                    <div className="font-medium text-muted-foreground">資本金</div>
                    <div className="md:col-span-2">{companyInfo.capital}</div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                    <div className="font-medium text-muted-foreground">代表取締役</div>
                    <div className="md:col-span-2">{companyInfo.ceo}</div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                    <div className="font-medium text-muted-foreground">従業員数</div>
                    <div className="md:col-span-2">{companyInfo.employees}</div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                    <div className="font-medium text-muted-foreground">事業内容</div>
                    <div className="md:col-span-2">{companyInfo.business}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-6 text-center">会社所在地</h2>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 md:p-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">本社</p>
                        <p className="text-muted-foreground">{companyInfo.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-medium">電話番号</p>
                        <p className="text-muted-foreground">{companyInfo.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-medium">メールアドレス</p>
                        <p className="text-muted-foreground">{companyInfo.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-6 text-center">会社理念</h2>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 md:p-8">
                  <p className="text-center mb-6 font-medium text-lg text-primary">「心と体の健康をサポートする、信頼できるリラクゼーションサービスを全ての人に」</p>
                  
                  <p className="mb-4">
                    のくとるは、お客様と専門的なセラピストを結ぶプラットフォームとして、高品質なリラクゼーションサービスへのアクセスを提供します。
                  </p>
                  
                  <p className="mb-4">
                    私たちは、お客様一人ひとりのニーズに合った最適なセラピストとのマッチングを実現し、心身の健康と安らぎを促進することを目指しています。
                  </p>
                  
                  <p>
                    安全性と信頼性を最優先に、透明性のある情報提供と厳格な品質基準を通じて、すべての人が安心してサービスを利用できる環境づくりに取り組んでいます。
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 mb-8">
              <iframe 
                title="Google Maps"
                className="w-full h-[400px] rounded-lg shadow-md"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.6779670422864!2d139.7027956!3d35.6585247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188ca94d8927d9%3A0xf08da3ab648fc8a0!2z5riL6LC35Yy65bGL6LC377yS5LiB55uu77yS77yU4oiS77yR77yS!5e0!3m2!1sja!2sjp!4v1654064928010!5m2!1sja!2sjp"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
