import "@/app/globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Cognito Passkey Demo",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
