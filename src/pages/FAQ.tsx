
import Layout from '../components/Layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-10">よくある質問</h1>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>「るぴぴあ」とはどんなサイトですか？</AccordionTrigger>
            <AccordionContent>
            「るぴぴあ」は、女性向け風俗のセラピストと、自分に合う人をゆっくり探したい女性をつなぐ、相性重視のマッチングサイトです。
            複数の店舗に所属するセラピストの情報を一度に見られ、プロフィールや投稿を見ながら、気になる相手を自由に選べます。            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger>「るぴぴあ」は無料で登録できますか？</AccordionTrigger>
            <AccordionContent>
            はい。ユーザー登録やセラピストの閲覧・チャット機能の利用など、基本機能はすべて無料です。料金が発生するのは、実際にお店でサービスを利用する際のみなので、安心してご利用いただけます。
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger>セラピストはどうやって探せばいいですか？</AccordionTrigger>
            <AccordionContent>
            セラピスト一覧から接客スタイル・容姿などの条件で絞り込んだり、投稿内容から人柄を見てセラピストを探すことができます。価値観や趣味の共通点が見える機能もあり、相性の良さを見つけやすいのが「るぴぴあ」の特徴です。
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-5">
            <AccordionTrigger>予約はどうすればいいですか？</AccordionTrigger>
            <AccordionContent>
            日時や場所を入力した、予約リクエストを送信するだけの簡単予約です。リクエストの送信前に、セラピストとチャットでお話することもできます。
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-6">
            <AccordionTrigger>トラブルに巻き込まれないか心配です。</AccordionTrigger>
            <AccordionContent>
            セラピストとの間に不快な言動やトラブルがあった場合は、通報ボタンからすぐに報告できます。通報内容は店舗に連携され、必要に応じて運営側でも対応します。安全・安心に利用していただくための仕組みを整えています。
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-7">
            <AccordionTrigger>知人に知られずに利用できますか？</AccordionTrigger>
            <AccordionContent>
            はい。「るぴぴあ」はニックネームとアイコンでの利用が可能で、投稿やチャットの内容は外部に公開されません。
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-8">
            <AccordionTrigger>女性用風俗の利用がはじめてでも大丈夫ですか？</AccordionTrigger>
            <AccordionContent>
            もちろん大丈夫です。はじめての方こそ、複数の店舗やセラピストを比較できる「るぴぴあ」が安心です。プロフィールや投稿・チャットを通して、セラピストの人柄を知ることができます。
            </AccordionContent>
          </AccordionItem>          
          
          <AccordionItem value="item-10">
            <AccordionTrigger>女性用風俗の料金や支払い方法は？</AccordionTrigger>
            <AccordionContent>
            料金や支払い方法は各店舗によって異なりますが、事前にコース料金を確認できるため、納得した上で予約できます。
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-11">
            <AccordionTrigger>プライバシーは守られますか？</AccordionTrigger>
            <AccordionContent>
            はい。ユーザーの個人情報は一切公開されず、ニックネームのみで利用できます。また、運営は女性ユーザーの匿名性・安全性を最優先に設計しており、情報が外部に漏れることはありません。
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Layout>
  );
};

export default FAQ;
