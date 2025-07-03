import { cookies } from "next/headers";
import { CognitoJwtVerifier } from "aws-jwt-verify";

export async function GET() {
  const token = (await cookies()).get("id_token")?.value;
  if (!token) return Response.json({ error: "unauth" }, { status: 401 });

  const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.COG_POOL_ID!,
    clientId: process.env.COG_CLIENT_ID!,
    tokenUse: "id",
  });
  const payload = await verifier.verify(token);
  return Response.json({ message: `Hello ${payload.email}` });
}
