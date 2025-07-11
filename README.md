# Rurupia（るぴぴあ） - セラピスト向けマッチングプラットフォーム

クライアントとセラピストを繋ぐWebアプリケーションです。セラピー関連サービスの管理とセラピストとクライアント間のやり取りを可能にするプラットフォームを提供しています。

## 機能

- 複数のユーザー役割：クライアント、セラピスト、店舗管理者、システム管理者
- セラピストの検索・フィルタリング機能
- 予約の管理
- クライアントとセラピスト間のメッセージ機能
- メール/パスワード、LINE、Googleでの認証
- リッチテキストエディター搭載のブログシステム
- 店舗・システム管理者向けアナリティクス機能
- モバイル・デスクトップ対応のレスポンシブデザイン

## 技術スタック

- **フロントエンド:** React、TypeScript、Vite、TailwindCSS、Shadcn UI
- **バックエンド:** Supabase（認証、データベース、ストレージ）
- **インフラ:** AWS（S3、CloudFront）

## デプロイメント

このプロジェクトは GitHub Actions を使用して AWS に自動デプロイされます：

1. ReactアプリケーションがViteを使用してビルドされます
2. ビルドされたアセットがAWS S3にアップロードされます
3. CloudFrontディストリビューションが無効化され、最新のコンテンツが配信されます
4. Lambda API関数が最新のコードで更新されます

### AWS リソース

- **S3バケット:** `therapist-connectivity-frontend-93b9faa0`（東京リージョン）
- **CloudFrontディストリビューション:** `dqv3ckdbgwb1i.cloudfront.net`
- **カスタムドメイン:** `rupipia.jp`（DNS設定待ち）

### CI/CD セットアップ

リポジトリには以下を自動実行するGitHub Actionsワークフローが含まれています：
- アプリケーションのビルド
- AWS S3へのデプロイ
- CloudFrontキャッシュの無効化
- Lambda API関数の更新

このCI/CDパイプラインを使用するには、以下のGitHubリポジトリシークレットを設定する必要があります：
- `AWS_ACCESS_KEY_ID`: S3とCloudFrontの権限を持つAWSアクセスキー
- `AWS_SECRET_ACCESS_KEY`: 対応するAWSシークレットキー
- `VITE_SUPABASE_URL`: SupabaseプロジェクトURL
- `VITE_SUPABASE_ANON_KEY`: Supabase匿名キー
- `SUPABASE_SERVICE_ROLE_KEY`: Supabaseサービスロールキー（Lambda用）
- `VITE_TINYMCE_API_KEY`: TinyMCE APIキー

## 開発環境

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# 本番用ビルド
npm run build

# 本番ビルドのプレビュー
npm run preview
```

## 環境変数の設定

プロジェクトを動作させるには、以下の環境変数を `.env` ファイルに設定する必要があります：

```bash
# Supabase設定
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# 管理者設定
VITE_ADMIN_DEFAULT_PASSWORD=your-secure-admin-password
```

サンプルファイル `.env.example` を参考にしてください。

## DNS設定

カスタムドメイン（rupipia.jp）を設定するには、以下の手順が必要です：

1. SSL証明書のDNS検証レコードを追加：
   - CNAME: `_9a689ffbd47df0f833e3dcb0d742c029.rupipia.jp`
   - 値: `_ca8dbb7f5b87f13819f0f5bcd230052e.xlfgrmvvlj.acm-validations.aws`

2. 証明書の検証後、CNAMEレコードを追加：
   - CNAME: `rupipia.jp`
   - 値: `dqv3ckdbgwb1i.cloudfront.net`

## ライブデモ
アプリケーションは以下のURLでデプロイされ、アクセス可能です：[https://therapist-connectivity.vercel.app/](https://therapist-connectivity.vercel.app/)

## 利用可能なルート

### メインページ
- `/` - ホーム/ランディングページ
- `/therapists` - 全セラピスト一覧
- `/therapists/:id` - 特定のセラピスト詳細表示
- `/book/:id` - 特定のセラピストとの予約
- `/contact` - お問い合わせページ
- `/blog` - ブログ一覧ページ
- `/blog/:slug` - 個別ブログ記事

### ユーザールート
- `/user-profile` - ユーザープロフィール管理
- `/user-bookings` - ユーザー予約の表示・管理
- `/messages` - メッセージ概要
- `/messages/:id` - 個別メッセージスレッド

### セラピストルート
- `/therapist-dashboard` - セラピストダッシュボード
- `/therapist-login` - セラピストログイン
- `/therapist-signup` - セラピスト登録

### 認証ルート
- `/login` - ユーザーログイン
- `/signup` - ユーザー登録
- `/store-login` - 店舗管理者ログイン
- `/store-signup` - 店舗登録

### 管理者パネルルート
全ての管理者ルートには `/admin` プレフィックスが付きます
- `/admin` - 管理者ダッシュボード
- `/admin/accounts` - ユーザーアカウント管理
- `/admin/requests` - リクエスト処理
- `/admin/inquiries` - お問い合わせ管理
- `/admin/blog` - ブログ管理
- `/admin/settings` - 管理者設定

### 店舗管理ルート
全ての店舗ルートには `/store-admin` プレフィックスが付きます
- `/store-admin` - 店舗ダッシュボード
- `/store-admin/therapists` - セラピスト管理
- `/store-admin/bookings` - 予約管理
- `/store-admin/courses` - コース管理
- `/store-admin/inquiries` - 店舗お問い合わせ処理
- `/store-admin/analytics` - アナリティクス表示

## セキュリティ対策

- XSS攻撃対策：DOMPurifyを使用したHTMLサニタイゼーション
- 認証情報の環境変数化：ハードコーディングされた秘密鍵の削除
- Row Level Security（RLS）ポリシーによるデータアクセス制御

## プロジェクト構造

```
src/
├── components/          # 再利用可能なUIコンポーネント
├── pages/              # ページコンポーネント
├── integrations/       # 外部サービス統合
│   └── supabase/       # Supabase設定とクライアント
├── utils/              # ユーティリティ関数
├── contexts/           # Reactコンテキスト
├── hooks/              # カスタムReactフック
└── types/              # TypeScript型定義
```

## 貢献

1. このリポジトリをフォークしてください
2. 機能ブランチを作成してください（`git checkout -b feature/amazing-feature`）
3. 変更をコミットしてください（`git commit -m 'Add some amazing feature'`）
4. ブランチにプッシュしてください（`git push origin feature/amazing-feature`）
5. プルリクエストを開いてください

## ライセンス

このプロジェクトは MIT ライセンスの下で配布されています。詳細については `LICENSE` ファイルをご覧ください。
