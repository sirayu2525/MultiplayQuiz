# Cognito Hosted UI + Next.js 15 でパスキー認証を導入するための設計ドキュメント

---

## 1. 背景と目的

- **目的**: サーバーレスに近い構成でパスキー（WebAuthn/FIDO2）によるパスワードレス認証を実現し、UX と運用コストを最適化する。
- **方針**: 認証・公開鍵管理・パスキー UI は **Cognito User Pool の Hosted UI** に完全委任し、フロントエンドは **Next.js 15 (App Router)** を BFF として活用する。

---

## 2. 構成概要

```
Browser ──▶ Cognito Hosted UI（Passkey/OTP）
   ▲                         │
   │302 (code)               ▼
Next.js 15 (App Router)
  ├─ Client: /auth/login（PKCE 生成 → /authorize リダイレクト）
  └─ Server Route: /auth/callback（/token 交換・JWT 検証・Cookie 発行）
```

- **Hosted UI ドメイン** `auth.example.com`（ACM + Route 53）
- **Callback URL** `https://app.example.com/auth/callback`
- **Cookie** `id_token` : HttpOnly / Secure / SameSite=Lax

---

## 3. 決定済みチェックリスト

| # | 項目          | 決定内容                                                               |
| - | ----------- | ------------------------------------------------------------------ |
| 1 | リージョン       | ap-northeast-1（東京）                                                 |
| 2 | ドメイン        | `auth.example.com` をカスタム設定                                         |
| 3 | App Client  | OAuth Flow: code+PKCE / Passkeys 有効 / Scopes: openid profile email |
| 4 | トークン TTL    | ID 60 min / Refresh 30 days                                        |
| 5 | Cookie ポリシー | HttpOnly + Secure + SameSite=Lax                                   |
| 6 | バックアップ要素    | Email OTP 必須、SMS 無効                                                |
| 7 | 環境分離        | dev / prod で別 User Pool                                            |
| 8 | ホスティング      | 開発: Vercel Hobby / 本番: Vercel Pro                                  |
| 9 | IaC         | Terraform で User Pool, App Client, Domain を管理                      |

---

## 4. 実装フロー（概要）

1. **/auth/login（Client）**
   - PKCE verifier・challenge 生成（Web Crypto）
   - `code_verifier` を One‑Time Cookie に保存
   - Hosted UI `/authorize` へリダイレクト
2. **ユーザー認証（Passkey or OTP）** – Cognito が実施
3. **/auth/callback（Server Route）**
   - `code` と Cookie の `code_verifier` で `/oauth2/token` 交換
   - `aws‑jwt‑verify` で ID Token 署名 / aud / exp 検証
   - `id_token` を HttpOnly Cookie として発行
4. **保護 API**
   - すべての Server Route / API Route で Cookie 内 `id_token` を検証してアクセス制御

---

## 5. 参考ドキュメント・公式サイト一覧


| カテゴリ            | 公式リファレンス & 記事                                                                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hosted UI 基本    | [User Pool managed login (公式ガイド)](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-userpools-oidc.html)                                                                   |
| Passkey 機能      | [Cognito adds support for passkeys (AWS What's New, 2024‑11)](https://aws.amazon.com/jp/about-aws/whats-new/2024/cognito-passkeys/)                                                        |
| PKCE 実装         | [Using PKCE in authorization‑code grants (公式)](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-userpools-token-endpoint.html#token-endpoint-pkce)                        |
| Token エンドポイント仕様 | [The Token Endpoint (公式)](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-userpools-token-endpoint.html)                                                                 |
| JWT 検証          | [awslabs/aws-jwt-verify (GitHub)](https://github.com/awslabs/aws-jwt-verify)                                                                                                               |
| Next App Router | [Server & Client Components Guide (Next.js 公式)](https://nextjs.org/docs/app/building-your-application/rendering/server-and-client-components)                                              |
| ベストプラクティス       | [Improve your app authentication workflow with new Cognito features (AWS Blog)](https://aws.amazon.com/blogs/security/improve-your-app-authentication-workflow-with-new-cognito-features/) |

---

### Appendix: 今後の拡張ポイント

- **WebSocket** が必要になった場合: Next を自ホスト (App Runner / ECS) に切り替え、`ws` パッケージで実装。
- **外部 IdP 追加**: 同一ユーザープールに Google / Apple を OIDC IdP として登録し、Callback URL に追記。
- **Fine‑grained 認可**: 別途 Keycloak 等を導入し、Cognito の ID Token を外部 IdP として連携。

