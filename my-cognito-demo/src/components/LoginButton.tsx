"use client";

import { createPKCE } from "@/lib/pkce";
import Cookies from "js-cookie";

export default function LoginButton() {
  // ← ここは「同期」関数のままにする

  const handleLogin = async () => {
    // ------- 非同期処理はここで実行 -------
    const { verifier, challenge } = await createPKCE();

    // 5 分だけ生存する一時クッキー
    Cookies.set("pkce_v", verifier, {
      secure: true,
      sameSite: "lax",
      expires: 1 / 288, // ＝5分
      path: "/auth",
    });

    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_COG_CLIENT_ID!,
      response_type: "code",
      scope: "openid profile email",
      redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
      code_challenge_method: "S256",
      code_challenge: challenge,
    });

    window.location.href =
      `${process.env.NEXT_PUBLIC_COG_DOMAIN!}/oauth2/authorize?` + params;
  };

  return (
    <button
      className="rounded bg-blue-600 px-6 py-2 text-white"
      onClick={handleLogin}
    >
      Passkey でログイン
    </button>
  );
}
