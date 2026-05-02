import type { Metadata } from "next";
import {
  Bebas_Neue,
  DM_Mono,
  Instrument_Serif,
  Fira_Code,
} from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const clerkAppearance = {
  variables: {
    colorPrimary:         "#00ff88",
    colorBackground:      "#090c17",
    colorInputBackground: "#06080f",
    colorInputText:       "#eef2ff",
    colorText:            "#eef2ff",
    colorTextSecondary:   "#8892b0",
    colorDanger:          "#ff4d6a",
    colorSuccess:         "#00ff88",
    colorWarning:         "#f59e0b",
    colorNeutral:         "#8892b0",
    borderRadius:         "12px",
    fontFamily:           "inherit",
    fontSize:             "13px",
  },
  elements: {
    /* ── Card shell ── */
    card: {
      background:    "rgba(15, 20, 36, 0.96)",
      border:        "1px solid rgba(130, 150, 255, 0.12)",
      boxShadow:     "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,255,136,0.04)",
      backdropFilter:"blur(20px)",
    },
    /* ── Header ── */
    headerTitle: {
      color:         "#eef2ff",
      letterSpacing: "0.04em",
      fontSize:      "22px",
    },
    headerSubtitle: { color: "#8892b0" },
    /* ── Form fields ── */
    formFieldLabel:  { color: "#8892b0", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" },
    formFieldInput: {
      background:   "#06080f",
      border:       "1px solid rgba(130, 150, 255, 0.12)",
      color:        "#eef2ff",
      borderRadius: "8px",
      fontSize:     "13px",
      outline:      "none",
    },
    formFieldInputShowPasswordButton: { color: "#8892b0" },
    /* ── Primary button (Sign in / Continue) ── */
    formButtonPrimary: {
      background:    "linear-gradient(135deg, #00ff88 0%, #9945ff 100%)",
      color:         "#06080f",
      fontWeight:    "700",
      letterSpacing: "0.1em",
      fontSize:      "12px",
      border:        "none",
      borderRadius:  "8px",
      boxShadow:     "none",
    },
    /* ── Social / OAuth buttons ── */
    socialButtonsBlockButton: {
      background:   "#0f1424",
      border:       "1px solid rgba(130, 150, 255, 0.12)",
      color:        "#eef2ff",
      borderRadius: "8px",
    },
    socialButtonsBlockButtonText: { color: "#8892b0", fontSize: "12px" },
    socialButtonsBlockButtonArrow: { color: "#3d4a6b" },
    /* GitHub icon — invert black→white on dark bg; Google/Solana keep native colors */
    socialButtonsProviderIcon__github: { filter: "brightness(0) invert(1)", opacity: "0.9" },
    /* ── Divider ── */
    dividerLine: { background: "rgba(130, 150, 255, 0.1)" },
    dividerText: { color: "#3d4a6b", fontSize: "11px" },
    /* ── Footer links ── */
    footerActionLink: { color: "#00ff88" },
    footerActionText: { color: "#8892b0" },
    footer:           { borderTop: "1px solid rgba(130, 150, 255, 0.08)" },
    /* ── "Secured by Clerk" badge ── */
    badge:            { background: "rgba(130,150,255,0.08)", border: "1px solid rgba(130,150,255,0.18)", color: "#8892b0" },
    badgeText:        { color: "#8892b0", fontSize: "11px" },
    internal:         { color: "#8892b0" },
    /* ── Identity preview (back button row) ── */
    identityPreviewText:          { color: "#eef2ff" },
    identityPreviewEditButtonIcon: { color: "#8892b0" },
    /* ── Alerts / errors ── */
    alertText:  { color: "#ff4d6a", fontSize: "12px" },
    formFieldErrorText: { color: "#ff4d6a", fontSize: "11px" },
    /* ── Internal nav (OTP, back) ── */
    otpCodeFieldInput: {
      background:   "#06080f",
      border:       "1px solid rgba(130, 150, 255, 0.15)",
      color:        "#00ff88",
      borderRadius: "8px",
    },
  },
};

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
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en">
        <body
          className={`${bebasNeue.variable} ${dmMono.variable} ${instrumentSerif.variable} ${firaCode.variable}`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
