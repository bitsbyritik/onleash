import type { Metadata } from "next";
import {
  Bebas_Neue,
  DM_Mono,
  Instrument_Serif,
  Fira_Code,
} from "next/font/google";
import "../global.css";
import SolanaWalletProvider from "@/components/WalletProvider";
import ReownProvider from "@/components/ReownProvider";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const dmMono = DM_Mono({
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-ui",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-prose",
});

const firaCode = Fira_Code({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-code",
});

export const metadata: Metadata = {
  title: "OnLeash — Spend Controls for AI Agent Wallets on Solana",
  description:
    "Programmable spend limits, per-vendor caps, Telegram HITL approvals, and multi-agent hierarchy budgets. Trustless Anchor program enforcement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${bebasNeue.variable} ${dmMono.variable} ${instrumentSerif.variable} ${firaCode.variable}`}
      >
        <div className="bg-grid" aria-hidden="true" />
        <div className="bg-vignette" aria-hidden="true" />
        <div className="bg-scanlines" aria-hidden="true" />
        <div className="bg-noise" aria-hidden="true" />
        <ReownProvider>
          <SolanaWalletProvider>
            {children}
          </SolanaWalletProvider>
        </ReownProvider>
      </body>
    </html>
  );
}
