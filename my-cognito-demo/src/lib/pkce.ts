// ブラウザ専用ユーティリティ
export async function createPKCE(): Promise<{
  verifier: string;
  challenge: string;
}> {
  const array = crypto.getRandomValues(new Uint8Array(32));
  const verifier = btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
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
