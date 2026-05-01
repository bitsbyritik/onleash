import type { Metadata } from "next";
import { Bebas_Neue, DM_Mono, Instrument_Serif, Fira_Code } from "next/font/google";
import "./globals.css";

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
  title: "OnLeash — Programmable Spend Controls for AI Agents on Solana",
  description:
    "OnLeash wraps any Solana wallet with programmable spend controls. Daily caps. Blocklists. Human approval flows. Backed onchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bebasNeue.variable} ${dmMono.variable} ${instrumentSerif.variable} ${firaCode.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
