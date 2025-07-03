import { Amplify } from "aws-amplify";

export const configureAmplify = () => {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId:        process.env.NEXT_PUBLIC_COG_POOL_ID!,
        userPoolClientId:  process.env.NEXT_PUBLIC_COG_CLIENT_ID!,
        loginWith: {
          oauth: {
            domain:  process.env.NEXT_PUBLIC_COG_DOMAIN!,
            scopes:  ["openid", "email", "profile"],
            redirectSignIn:  process.env.NEXT_PUBLIC_REDIRECT_URI!,
            redirectSignOut: process.env.NEXT_PUBLIC_REDIRECT_URI!,
            responseType: "code",
          },
        },
      },
    },
  });
};
