import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Wallet } from "./component/wallet";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tokenonana",
  description: "SPL Tokens",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Wallet>{children}</Wallet>
      </body>
    </html>
  );
}
