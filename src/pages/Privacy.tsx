
import Layout from '../components/Layout';

const Privacy = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-10">プライバシーポリシー</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-muted-foreground mb-6">
            最終更新日: 2025年6月14日
          </p>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. はじめに</h2>
            <p>
              るぴぴあ（以下「当社」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めています。本プライバシーポリシーは、当社が収集する情報の種類、その使用方法、および関連する権利について説明するものです。
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. 収集する情報</h2>
            <p>
              当社は、以下の情報を収集することがあります：
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>アカウント情報：</strong> 名前、メールアドレス、電話番号、パスワードなど。
              </li>
              <li>
                <strong>プロフィール情報：</strong> 性別、年齢、趣味、プロフィール写真など。
              </li>
              <li>
                <strong>支払い情報：</strong> クレジットカード情報、請求先住所など（これらの情報は安全な第三者の支払い処理業者を通じて処理されます）。
              </li>
              <li>
                <strong>位置情報：</strong> おおよその位置情報（セラピストの検索に使用）。
              </li>
              <li>
                <strong>デバイス情報：</strong> IPアドレス、ブラウザタイプ、デバイスIDなど。
              </li>
              <li>
                <strong>利用データ：</strong> サービスの利用履歴、アクセスログ、閲覧ページなど。
              </li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. 情報の使用目的</h2>
            <p>
              収集した情報は、以下の目的で使用されます：
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>アカウントの作成と管理</li>
              <li>サービスの提供と改善</li>
              <li>ユーザーとセラピストのマッチング</li>
              <li>支払い処理</li>
              <li>カスタマーサポートの提供</li>
              <li>サービスに関する通知や更新情報の送信</li>
              <li>マーケティングおよびプロモーション活動（オプトアウト可能）</li>
              <li>不正行為の検出と防止</li>
              <li>法的義務の遵守</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. 情報の共有</h2>
            <p>
              当社は、以下の場合に限り、個人情報を第三者と共有することがあります：
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>サービス提供者：</strong> 支払い処理、データ分析、マーケティング支援などのサービスを提供する業者。
              </li>
              <li>
                <strong>セラピスト：</strong> 予約を完了するために必要な情報をセラピストと共有します。
              </li>
              <li>
                <strong>法的要件：</strong> 法律の遵守、権利の保護、安全の確保のために必要な場合。
              </li>
              <li>
                <strong>事業譲渡：</strong> 合併、買収、資産売却の一部として情報が転送される場合（その場合は通知します）。
              </li>
            </ul>
            <p className="mt-4">
              当社は、ユーザーの明示的な同意なしに、第三者のマーケティング目的で個人情報を販売または貸し出すことはありません。
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. データセキュリティ</h2>
            <p>
              当社は、不正アクセス、改ざん、開示、または破壊から個人情報を保護するために適切な技術的および組織的対策を講じています。ただし、インターネット経由の送信や電子ストレージが100%安全であることを保証することはできません。
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. データ保持</h2>
            <p>
              当社は、サービス提供に必要な期間、または法的義務を遵守するために必要な期間、個人情報を保持します。不要になった情報は、安全に削除または匿名化されます。
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. ユーザーの権利</h2>
            <p>
              ユーザーは、以下の権利を有しています：
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>個人情報へのアクセス</li>
              <li>個人情報の訂正</li>
              <li>個人情報の削除（「忘れられる権利」）</li>
              <li>データ処理の制限</li>
              <li>データポータビリティ</li>
              <li>オプトアウト（マーケティング通信など）</li>
            </ul>
            <p className="mt-4">
              これらの権利を行使するには、以下の連絡先までお問い合わせください。
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Cookie（クッキー）</h2>
            <p>
              当社のウェブサイトは、ユーザーエクスペリエンスの向上、分析、マーケティングを目的としてCookieを使用しています。ブラウザの設定を変更することで、Cookieの受け入れを制限したり、拒否したりすることができますが、一部の機能が制限される場合があります。
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. 子どものプライバシー</h2>
            <p>
              当社のサービスは、18歳未満の方を対象としていません。18歳未満の方の個人情報を意図的に収集することはありません。18歳未満のお子様に関する情報を収集したことが判明した場合は、速やかに削除するための措置を講じます。
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. ポリシーの変更</h2>
            <p>
              当社は、本プライバシーポリシーを随時更新することがあります。重要な変更がある場合は、ウェブサイト上での通知やメールでのお知らせなど、適切な手段で通知します。
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">11. お問い合わせ</h2>
            <p>
              本プライバシーポリシーに関するご質問やお問い合わせは、以下の連絡先までお願いします：<br />
              メール: privacy@nokutoru.com<br />
              電話: 03-1234-5678<br />
              住所: 〒150-0002 東京都渋谷区渋谷2-24-12
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
