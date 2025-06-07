# Supabase Email Templates - Japanese Configuration

## Overview
To make all Supabase authentication emails appear in Japanese from "るぴぴあ", you need to configure custom email templates in the Supabase dashboard.

## Steps to Configure

### 1. Access Email Templates
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates**
3. You'll see several template types:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

### 2. Configure Each Template

#### Confirm Signup (確認登録)
```html
<h2>るぴぴあへようこそ！</h2>
<p>アカウント登録を完了するため、下記のリンクをクリックしてください。</p>
<p><a href="{{ .ConfirmationURL }}">メールアドレスを確認する</a></p>
<p>このリンクは24時間で有効期限が切れます。</p>
<p>もしこのメールに心当たりがない場合は、無視してください。</p>
<br>
<p>るぴぴあチーム</p>
```

#### Magic Link (マジックリンク)
```html
<h2>るぴぴあ - ログインリンク</h2>
<p>下記のリンクをクリックしてログインしてください。</p>
<p><a href="{{ .ConfirmationURL }}">ログインする</a></p>
<p>このリンクは1時間で有効期限が切れます。</p>
<p>もしこのメールに心当たりがない場合は、無視してください。</p>
<br>
<p>るぴぴあチーム</p>
```

#### Change Email Address (メールアドレス変更)
```html
<h2>るぴぴあ - メールアドレス変更確認</h2>
<p>メールアドレスの変更を完了するため、下記のリンクをクリックしてください。</p>
<p><a href="{{ .ConfirmationURL }}">メールアドレス変更を確認する</a></p>
<p>このリンクは24時間で有効期限が切れます。</p>
<p>もしこのメール変更をリクエストしていない場合は、すぐにサポートまでご連絡ください。</p>
<br>
<p>るぴぴあチーム</p>
```

#### Reset Password (パスワードリセット)
```html
<h2>るぴぴあ - パスワードリセット</h2>
<p>パスワードをリセットするため、下記のリンクをクリックしてください。</p>
<p><a href="{{ .ConfirmationURL }}">パスワードをリセットする</a></p>
<p>このリンクは1時間で有効期限が切れます。</p>
<p>もしパスワードリセットをリクエストしていない場合は、無視してください。</p>
<br>
<p>るぴぴあチーム</p>
```

### 3. Email Settings Configuration

#### From Email Address
- Set the sender email to a domain you own (e.g., `noreply@rupipia.jp`)
- Configure proper SPF/DKIM records for deliverability

#### From Name
- Set to: `るぴぴあ`

#### Subject Line Templates
- **Confirm signup**: `るぴぴあ - メールアドレスの確認`
- **Magic Link**: `るぴぴあ - ログインリンク`
- **Change Email**: `るぴぴあ - メールアドレス変更確認`
- **Reset Password**: `るぴぴあ - パスワードリセット`

### 4. Testing
After configuration:
1. Test each email type by triggering the respective actions
2. Check that emails arrive in Japanese
3. Verify the sender shows as "るぴぴあ"
4. Confirm all links work properly

### 5. Additional Considerations

#### Custom SMTP (Recommended for Production)
- Configure custom SMTP server for better deliverability
- Use a Japanese-friendly email service provider
- Ensure proper domain authentication

#### Rate Limiting
- Configure appropriate rate limits for auth emails
- Consider Japanese business hours for support

## Template Variables Available
- `{{ .ConfirmationURL }}` - The confirmation/action URL
- `{{ .Email }}` - User's email address
- `{{ .SiteURL }}` - Your site URL
- `{{ .TokenHash }}` - Token hash (for advanced use)

## Notes
- All templates support HTML formatting
- Ensure responsive design for mobile devices
- Test thoroughly before going live
- Consider adding company contact information for support 