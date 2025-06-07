
import Layout from '../components/Layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-10">よくある質問</h1>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>るぴぴあはどのようなサービスですか？</AccordionTrigger>
            <AccordionContent>
              るぴぴあは、男性セラピストによるリラクゼーションサービスのマッチングプラットフォームです。信頼できるセラピストと簡単に予約ができ、心と体のリラクゼーションをサポートします。
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger>予約方法を教えてください</AccordionTrigger>
            <AccordionContent>
              まずは、お好みのセラピストを検索・選択し、プロフィールページからセッションをリクエストしてください。セラピストからの承認後、予約が確定します。ログインすることで予約の管理がさらに便利になります。
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger>支払い方法は何がありますか？</AccordionTrigger>
            <AccordionContent>
              支払い方法は現地での現金払いのみになります。
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-5">
            <AccordionTrigger>セラピストはどのように選ばれていますか？</AccordionTrigger>
            <AccordionContent>
              すべてのセラピストは厳格な審査プロセスを経て、資格や経験、プロフェッショナリズムが確認されています。また、ユーザーからのレビューシステムにより、高品質なサービスの提供を維持しています。
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-6">
            <AccordionTrigger>セラピストとして登録するには？</AccordionTrigger>
            <AccordionContent>
              店舗から発行された登録リンクから、名前やセラピスト名などの情報を提出してください。審査後、承認されると登録完了となります。詳細な情報は登録後セラピスト用のプロフィールページから変更可能です。
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-7">
            <AccordionTrigger>予約のキャンセルや変更はできますか？</AccordionTrigger>
            <AccordionContent>
              マイページの予約タブから予約の管理が可能です。
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-8">
            <AccordionTrigger>サービス中に問題が発生した場合はどうすればいいですか？</AccordionTrigger>
            <AccordionContent>
              お問い合わせフォームまでご連絡ください。すべての問題に対して迅速に対応いたします。また、セッション後のフィードバックもサービス改善に役立てています。
            </AccordionContent>
          </AccordionItem>          
          
          <AccordionItem value="item-10">
            <AccordionTrigger>予約の確認方法はありますか？</AccordionTrigger>
            <AccordionContent>
              予約完了後、確認メールが送信されます。また、マイページの予約履歴からもすべての予約を確認できます。
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Layout>
  );
};

export default FAQ;
