import { cookies } from "next/headers";
import { CognitoJwtVerifier } from "aws-jwt-verify";

export async function GET() {
  /* 1) Cookie から id_token を取り出す */
  const token = (await cookies()).get("id_token")?.value;
  if (!token) {
    return Response.json({ error: "unauthenticated" }, { status: 401 });
  }

  /* 2) 署名・aud 検証 */
  const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.NEXT_PUBLIC_COG_POOL_ID!,
    clientId:   process.env.NEXT_PUBLIC_COG_CLIENT_ID!,
    tokenUse:   "id",
  });

  let payload: any;
  try {
    payload = await verifier.verify(token);
  } catch {
    return Response.json({ error: "invalid token" }, { status: 401 });
  }

  /* 3) 正常レスポンス */
  return Response.json({ message: `Hello ${payload.email}!` });
}
