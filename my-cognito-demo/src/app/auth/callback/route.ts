import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import * as cookie from "cookie";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  // ❶ 受信チェック
  if (!code) {
    return NextResponse.json({ error: "code query missing" }, { status: 400 });
  }

  // ❷ クッキーから verifier を取得
  const cookieHeader = req.headers.get("cookie") ?? "";
  const { pkce_v: verifier } = cookie.parse(cookieHeader);
  if (!verifier) {
    return NextResponse.json({ error: "verifier missing" }, { status: 400 });
  }

  // ❸ /oauth2/token へ交換
  const tokenRes = await fetch(
    `${process.env.NEXT_PUBLIC_COG_DOMAIN!}/oauth2/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.COG_CLIENT_ID!,               // ★サーバー変数
        code,
        redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
        code_verifier: verifier,
      }),
    }
  );

  if (!tokenRes.ok) {
    return NextResponse.json(await tokenRes.json(), { status: 400 });
  }

  const { id_token } = await tokenRes.json();

  // ❹ ID Token 署名・aud 検証
  const verifierJwt = CognitoJwtVerifier.create({
    userPoolId: process.env.COG_POOL_ID!,
    clientId: process.env.COG_CLIENT_ID!,
    tokenUse: "id",
  });

  try {
    await verifierJwt.verify(id_token);
  } catch (e) {
    return NextResponse.json({ error: "jwt invalid" }, { status: 401 });
  }

  // ❺ セッションクッキー発行 & 一時 verifier クッキー削除
  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.set("id_token", id_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1 h
  });
  res.cookies.set("pkce_v", "", { maxAge: 0, path: "/auth" }); // 削除
  return res;
}
