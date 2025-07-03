// ブラウザ限定ユーティリティ（"use client" しない）
export async function createPKCE() {
  // 32byte のランダム値
  const random = crypto.getRandomValues(new Uint8Array(32));
  const verifier = btoa(String.fromCharCode(...random))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  // SHA-256 → base64url = challenge
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier)
  );
  const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return { verifier, challenge };
}
