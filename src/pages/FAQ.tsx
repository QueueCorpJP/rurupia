
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
              クレジットカード、デビットカード、各種電子決済に対応しています。すべての支払いは暗号化され、安全に処理されます。一部のセラピストは現金払いにも対応していますが、事前に確認が必要です。
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4">
            <AccordionTrigger>キャンセルポリシーはどうなっていますか？</AccordionTrigger>
            <AccordionContent>
              予約の24時間前までのキャンセルは無料です。それ以降のキャンセルについては、セッション料金の50%をキャンセル料として申し受けます。無断キャンセルの場合は100%のキャンセル料が発生します。
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
              セラピスト登録ページから必要事項を入力し、資格証明や経歴などの情報を提出してください。審査後、承認されると登録完了となります。詳細はセラピスト向けのガイドラインをご確認ください。
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-7">
            <AccordionTrigger>予約のキャンセルや変更はできますか？</AccordionTrigger>
            <AccordionContent>
              マイページから予約の管理が可能です。変更やキャンセルは、予約の24時間前までであれば手数料なしで行えます。それ以降の変更については、各セラピストのポリシーに従います。
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-8">
            <AccordionTrigger>サービス中に問題が発生した場合はどうすればいいですか？</AccordionTrigger>
            <AccordionContent>
              お問い合わせフォームまたはカスタマーサポート（03-1234-5678）までご連絡ください。すべての問題に対して迅速に対応いたします。また、セッション後のフィードバックもサービス改善に役立てています。
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-9">
            <AccordionTrigger>ギフトカードは利用できますか？</AccordionTrigger>
            <AccordionContent>
              はい、ギフトカードをご用意しています。大切な方へのプレゼントとして、リラクゼーションセッションをギフトすることができます。詳細はギフトカードページをご覧ください。
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-10">
            <AccordionTrigger>予約の確認方法はありますか？</AccordionTrigger>
            <AccordionContent>
              予約完了後、確認メールが送信されます。また、マイページの予約履歴からもすべての予約を確認できます。予約日の24時間前にはリマインダーメールも送信されます。
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Layout>
  );
};

export default FAQ;
