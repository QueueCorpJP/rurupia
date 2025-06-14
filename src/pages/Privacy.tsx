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
              るぴぴあ（以下「当社」または「当プラットフォーム」）は、ユーザーとセラピストを繋ぐマッチングプラットフォームを提供しています。当社は、ユーザーのプライバシーを最重要事項として位置づけ、個人情報の適切な保護に努めています。本プライバシーポリシーは、セラピスト検索・予約・メッセージングサービスの利用において当社が収集する情報、その使用方法、およびユーザーの権利について説明するものです。
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. 収集する情報</h2>
            <p>
              当社は、セラピスト検索・予約・マッチングサービスの提供のため、以下の情報を収集することがあります：
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>ユーザーアカウント情報：</strong> お名前、メールアドレス、電話番号、パスワード、LINE連携情報
              </li>
              <li>
                <strong>プロフィール・マッチング情報：</strong> 年齢、性別、希望するセラピストのタイプ、サービスの好み、プロフィール写真
              </li>
              <li>
                <strong>セラピスト情報（セラピスト登録者）：</strong> サービス内容、営業時間、料金、身分証明書、プロフィール画像・ギャラリー画像
              </li>
              <li>
                <strong>予約・利用情報：</strong> セラピスト予約履歴、キャンセル・変更履歴、サービス利用状況
              </li>
              <li>
                <strong>メッセージ・コミュニケーション情報：</strong> セラピストとのメッセージ履歴、投稿・コメント内容
              </li>
              <li>
                <strong>位置情報：</strong> セラピスト検索時の所在地情報（おおよその地域のみ）
              </li>
              <li>
                <strong>決済情報：</strong> 支払い方法、決済履歴
              </li>
              <li>
                <strong>技術的情報：</strong> アクセスログ
              </li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. 情報の使用目的</h2>
            <p>
              収集した情報は、以下の目的でのみ使用されます：
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>ユーザーとセラピストのマッチング・検索サービスの提供</li>
              <li>セラピスト予約の管理・処理</li>
              <li>セラピストとユーザー間のメッセージング機能の提供</li>
              <li>アカウント管理・認証（LINE連携含む）</li>
              <li>決済処理とセラピスト報酬の管理</li>
              <li>セラピストの本人確認・資格確認</li>
              <li>プラットフォームの安全性確保・不正利用の防止</li>
              <li>カスタマーサポート・問い合わせ対応</li>
              <li>サービス改善のための分析</li>
              <li>重要な通知・サービス更新のお知らせ</li>
              <li>法的義務の遵守</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. 情報の共有</h2>
            <p>
              当社は、サービス提供に必要な範囲内で、以下の場合に限り個人情報を共有することがあります：
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>セラピストとユーザー間：</strong> 予約確定時に必要な連絡先情報（お名前、電話番号など）をセラピストとユーザー間で共有
              </li>
              <li>
                <strong>提携店舗：</strong> セラピストが所属する店舗への予約・管理情報の提供
              </li>
              <li>
                <strong>決済代行業者：</strong> 安全な決済処理のための最小限の情報
              </li>
              <li>
                <strong>技術サービス提供者：</strong> インフラ運用、データ分析、セキュリティ監視のための業者
              </li>
              <li>
                <strong>法的要請：</strong> 法令に基づく開示要求、利用者の安全確保のために必要な場合
              </li>
            </ul>
            <p className="mt-4">
              <strong>重要：</strong>当社は、ユーザーの明示的な同意なしに、マーケティング目的やその他の商業目的で個人情報を第三者に販売・提供することは一切ありません。
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. データセキュリティ</h2>
            <p>
              ヒーリング・ウェルネスサービスという繊細な性質を考慮し、当社は特に厳格なセキュリティ対策を実施しています：
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>SSL暗号化通信によるデータ送信の保護</li>
              <li>アクセス権限の厳格な管理</li>
              <li>セラピストの身元確認・資格確認プロセス</li>
              <li>メッセージ内容の監視による不適切な利用の防止</li>
              <li>定期的なセキュリティ監査の実施</li>
            </ul>
            <p className="mt-4">
              ただし、インターネット経由の完全な安全性を100%保証することはできません。不審な活動を発見された場合は、速やかにご連絡ください。
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. データ保持期間</h2>
            <p>
              当社は、以下の期間、個人情報を保持します：
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>アカウント情報：</strong> アカウント削除まで</li>
              <li><strong>予約履歴：</strong> サービス提供完了後2年間</li>
              <li><strong>メッセージ履歴：</strong> 送信後1年間（トラブル対応のため）</li>
              <li><strong>セラピスト資格情報：</strong> 法的要件に基づき3年間</li>
              <li><strong>決済記録：</strong> 税務・法的要件に基づき7年間</li>
            </ul>
            <p className="mt-4">
              保持期間経過後の情報は、安全に削除または匿名化処理を行います。
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. ユーザーの権利</h2>
            <p>
              ユーザーは、個人情報について以下の権利を有しています：
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>個人情報の開示請求</li>
              <li>個人情報の訂正・追加・削除</li>
              <li>個人情報の利用停止・消去</li>
              <li>第三者提供の停止</li>
              <li>アカウントの削除</li>
              <li>データのダウンロード（予約履歴等）</li>
            </ul>
            <p className="mt-4">
              これらの権利を行使される場合は、本人確認を行った上で対応いたします。お問い合わせフォームまたは下記連絡先までご連絡ください。
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Cookie（クッキー）とトラッキング</h2>
            <p>
              当社は、以下の目的でCookieを使用しています：
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>ログイン状態の維持</li>
              <li>ユーザーの好みやセラピスト検索履歴の保存</li>
              <li>サービス改善のための利用状況分析</li>
              <li>セキュリティの向上</li>
            </ul>
            <p className="mt-4">
              ブラウザ設定により、Cookieの受け入れを制限できますが、一部機能が利用できなくなる場合があります。
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. 年齢制限</h2>
            <p>
              当サービスは、18歳以上の方を対象としています。18歳未満の方のご利用はお断りしており、意図的に18歳未満の方の個人情報を収集することはありません。18歳未満の方の情報が収集されたことが判明した場合は、速やかに削除いたします。
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. 第三者サービスとの連携</h2>
            <p>
              当サービスは、以下の第三者サービスと連携しています：
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>LINE：</strong> ログイン認証（LINEのプライバシーポリシーが適用されます）</li>
              <li><strong>決済サービス：</strong> 安全な決済処理のため</li>
              <li><strong>地図サービス：</strong> セラピスト位置情報表示のため</li>
            </ul>
            <p className="mt-4">
              これらのサービスには、それぞれ独自のプライバシーポリシーが適用されます。
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">11. ポリシーの変更</h2>
            <p>
              当社は、法令の改正やサービス内容の変更に伴い、本プライバシーポリシーを更新することがあります。重要な変更がある場合は、サービス内での通知やメール等で事前にお知らせいたします。
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">12. お問い合わせ</h2>
            <p>
              本プライバシーポリシー、個人情報の取扱い、セラピストサービスに関するプライバシーについてのご質問・ご相談は、以下の連絡先までお願いします：
            </p>
            <p className="mt-4">
              <strong>るぴぴあ カスタマーサポート</strong><br />
              メール: privacy@rupipia.jp<br />
              お問い合わせフォーム: サービス内「お問い合わせ」ページより<br />
              受付時間: 平日10:00〜18:00
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
