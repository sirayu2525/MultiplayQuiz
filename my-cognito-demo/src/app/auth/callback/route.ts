import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { CognitoJwtVerifier } from "aws-jwt-verify";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const verifier = req.cookies.get("pkce_tmp")?.value
    ?? (await req.text()); // fallback (dev ツール用)

  if (!code || !verifier) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  //  /token 交換
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.COG_CLIENT_ID!,
    redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
    code,
    code_verifier: verifier,
  });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_COG_DOMAIN!}/oauth2/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }
  );
  const json = await res.json();
  if (!json.id_token) {
    return NextResponse.json(json, { status: 400 });
  }

  //  ID トークン検証 (署名・aud・exp)
  const verifierJwt = CognitoJwtVerifier.create({
    userPoolId: process.env.COG_POOL_ID!,
    clientId: process.env.COG_CLIENT_ID!,
    tokenUse: "id",
  });
  await verifierJwt.verify(json.id_token);

  // HttpOnly Cookie に保存
  const response = NextResponse.redirect(req.nextUrl.origin + "/");
  response.cookies.set("id_token", json.id_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return response;
}
