export interface Wallet {
  id: string;
  name: string;
  key: string;
  status: "active" | "inactive";
  spend: number;
  cap: number;
  policy: string;
  transfers: number;
  blocked: number;
  rate: number;
}

export type TransferStatus =
  | "success"
  | "blocked"
  | "pending"
  | "rejected"
  | "expired";

export interface Transfer {
  time: string;
  to: string;
  amount: string;
  usd: string;
  token: string;
  status: TransferStatus;
  reason: string;
  sig: string;
}

export interface Approval {
  id: string;
  wallet: string;
  to: string;
  amount: string;
  token: string;
  memo: string;
  created: string;
  expires: number;
  reason: string;
}

export const WALLETS: Wallet[] = [
  { id: "w1", name: "trading-bot-01", key: "7xKr8mNp...9dQpLmXb", status: "active",   spend: 6.2,  cap: 10, policy: "v3", transfers: 42,  blocked: 3, rate: 93 },
  { id: "w2", name: "payment-agent",  key: "Bz3qRsWv...2kJhFgNm", status: "active",   spend: 22.5, cap: 50, policy: "v2", transfers: 128, blocked: 1, rate: 99 },
  { id: "w3", name: "arbitrage-bot",  key: "Qp9mXkLz...7tNdCvBa", status: "inactive", spend: 0,    cap: 25, policy: "v1", transfers: 0,   blocked: 0, rate: 0  },
];

export const TRANSFERS: Transfer[] = [
  { time: "14:32:01", to: "9dQp...LmXb", amount: "5.00",  usd: "$5.00",  token: "USDC", status: "success",  reason: "—",                  sig: "3mNp...8kLw" },
  { time: "14:28:44", to: "7xKr...3mNp", amount: "12.00", usd: "$12.00", token: "USDC", status: "blocked",  reason: "blocklist match",    sig: "—" },
  { time: "14:15:22", to: "Bz3q...FgNm", amount: "7.50",  usd: "$7.50",  token: "SOL",  status: "pending",  reason: "exceeds threshold",  sig: "—" },
  { time: "13:58:10", to: "Qp9m...CvBa", amount: "2.10",  usd: "$2.10",  token: "USDC", status: "success",  reason: "—",                  sig: "xK2p...9mNd" },
  { time: "13:44:03", to: "4hLp...Nz8m", amount: "8.00",  usd: "$8.00",  token: "USDC", status: "rejected", reason: "user rejected",      sig: "—" },
  { time: "13:30:51", to: "9dQp...LmXb", amount: "1.50",  usd: "$1.50",  token: "USDC", status: "success",  reason: "—",                  sig: "pQ7m...2xKr" },
  { time: "12:15:00", to: "Rv6n...Wq4t", amount: "0.50",  usd: "$0.50",  token: "USDC", status: "expired",  reason: "approval timed out", sig: "—" },
];

export const APPROVALS: Approval[] = [
  { id: "ap1", wallet: "trading-bot-01", to: "Bz3q...FgNm", amount: "7.50",  token: "SOL",  memo: "Arbitrage settlement",  created: "14:15", expires: 272, reason: "exceeds $5 threshold" },
  { id: "ap2", wallet: "payment-agent",  to: "9mKp...Rv3q", amount: "18.00", token: "USDC", memo: "API credits renewal",    created: "13:52", expires: 848, reason: "exceeds $5 threshold" },
];
