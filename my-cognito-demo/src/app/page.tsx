"use client";

import { configureAmplify } from "@/lib/awsConfig";
import { signIn, registerWebAuthn } from "aws-amplify/auth";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => configureAmplify(), []);

  // パスキーでサインイン
  const handleLogin = async () => {
    await signIn({
      username: "", // メール入力をスキップ → Hosted UI 側で入力
      options: { preferredChallenge: "WEB_AUTHN" },
    });
  };

  // 後からパスキーを追加登録
  const handleRegisterPasskey = async () => {
    await registerWebAuthn();
    alert("パスキーを登録しました。");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <button
        className="rounded bg-blue-600 px-6 py-2 text-white"
        onClick={handleLogin}
      >
        Passkey でログイン
      </button>

      <button
        className="rounded bg-green-600 px-4 py-2 text-white"
        onClick={handleRegisterPasskey}
      >
        パスキーを追加
      </button>
    </main>
  );
}
