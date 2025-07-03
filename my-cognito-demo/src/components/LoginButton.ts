"use client";

import { createPKCE } from "@/lib/pkce";


export default function LoginButton() {
  const handleLogin = async () => {
    const { verifier, challenge } = await createPKCE();
    sessionStorage.setItem("pkce_verifier", verifier);   // 後で /token 交換用
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_COG_CLIENT_ID!,
      response_type: "code",
      scope: "openid email profile",
      redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
      code_challenge_method: "S256",
      code_challenge: challenge,
    });
    // Passkey UI を即表示させたいときは prompt=login でも可
    window.location.href =
      `${process.env.NEXT_PUBLIC_COG_DOMAIN!}/oauth2/authorize?` + params;
  };

  return (
    <button
      onClick={handleLogin}
      className="rounded bg-blue-600 px-6 py-2 text-white"
    >
      Passkey でログイン
    </button>
  );
}
