export type WalletStatus = 'active' | 'paused' | 'blocked';
export type TransferStatus = 'success' | 'pending' | 'blocked' | 'rejected';

export interface Wallet {
  id: string;
  name: string;
  pk: string;
  hierarchy?: {
    role: 'parent' | 'child';
    parentId?: string;
    parentWallet?: string;
    parentPolicy?: string;
    parentDailyCap?: number;
    parentSpendToday?: number;
    childDailyCap?: number;
    childSpendToday?: number;
  };
  status: WalletStatus;
  transfers: number;
  blocked: number;
  spent: number;
  cap: number;
  policy: string;
  created?: string;
  rules?: {
    maxTx: number;
    dailyCap: number;
    hitlAt: number;
    tokens: string[];
    hours: string;
  };
}

export interface Transfer {
  id: string;
  time: string;
  wallet: string;
  to: { lbl: string; to: string };
  amount: number;
  token: string;
  status: TransferStatus;
  reason?: string;
  _new?: boolean;
}

export interface Approval {
  id: string;
  wallet: string;
  to: string;
  toLabel: string;
  amount: number;
  token: string;
  memo: string;
  reason: string;
  requestedAt: string;
  secondsLeft: number;
  urgent: boolean;
}

export interface ResolvedApproval {
  id: string;
  wallet: string;
  amount: string;
  by: string;
  status: TransferStatus;
  time: string;
}

const ADDRS = [
  { lbl: 'JUP swap',     to: 'JUP6L2QJN2sG9pFkRrAqct' },
  { lbl: 'meteora pool', to: '9hLm2vQrW7uT4kFpQ2nWxY' },
  { lbl: 'pump.fun',     to: 'pumpFunVaultR9bM2vLi5x' },
  { lbl: 'orca',         to: 'orca8ALGvQ7uTpA1xJfNcK6' },
  { lbl: 'kamino lend',  to: 'kam9hLm2vQrWfTpA1xJfN' },
  { lbl: 'drift perps',  to: 'drftR9bM2vLi5xZh3YwR8a' },
  { lbl: 'unknown',      to: '4vLi5xKj9bM2drainer3Yw' },
];

export const WALLETS: Wallet[] = [
  {
    id: 'vega', name: 'vega-prod',
    pk: '7gXqJ4mPp9bM2vLi5xZh3YwR8aTcU1qN6sB',
    status: 'active', transfers: 1284, blocked: 12, spent: 87.40, cap: 100,
    policy: 'strict-v1', created: '2026-04-12',
    hierarchy: {
      role: 'child',
      parentId: 'orion',
      parentWallet: 'orion-treasury',
      parentPolicy: 'treasury-v3',
      parentDailyCap: 5000,
      parentSpendToday: 4988,
      childDailyCap: 100,
      childSpendToday: 87.40,
    },
    rules: { maxTx: 50, dailyCap: 100, hitlAt: 50, tokens: ['USDC','SOL','JUP'], hours: '00:00–23:59 UTC' },
  },
  {
    id: 'lyra', name: 'lyra-staging',
    pk: '4vLijDhT8kFpQ2nWxYbV5sZc9eMrGuKaH3X',
    status: 'paused', transfers: 318, blocked: 4, spent: 12.00, cap: 50, policy: 'lenient-v2',
  },
  {
    id: 'orion', name: 'orion-treasury',
    pk: '9hLm2vQrW7uTpA1xJfNcK6dRsB4yE8gZi5L',
    status: 'active', transfers: 642, blocked: 2, spent: 4280, cap: 5000, policy: 'treasury-v3',
    hierarchy: {
      role: 'parent',
      parentDailyCap: 5000,
      parentSpendToday: 4988,
    },
  },
  {
    id: 'rigel', name: 'rigel-mev',
    pk: '8aZK3mNp7qXcRfV1jYsWdL2hUtBe4iPgCo6',
    status: 'active', transfers: 4128, blocked: 89, spent: 920, cap: 1000, policy: 'mev-strict',
  },
  {
    id: 'altair', name: 'altair-arb',
    pk: 'Ar4iLkMb6vWfTpQzNxJrK9ScHdY8aBgU2eR',
    status: 'active', transfers: 2940, blocked: 31, spent: 412, cap: 500, policy: 'jup-arb-v1',
  },
  {
    id: 'sirius', name: 'sirius-drainer-test',
    pk: '4vLi5xKj9bM2drainer3YwR8aTcU1qN6sB',
    status: 'blocked', transfers: 0, blocked: 142, spent: 0, cap: 100, policy: 'quarantine',
  },
  {
    id: 'antares', name: 'antares-yield',
    pk: '6kEoTnY3pBgL9rWhXuS1zVqMvF7iJaCdH8N',
    status: 'active', transfers: 184, blocked: 0, spent: 78, cap: 200, policy: 'yield-conservative',
  },
];

export const TRANSFERS: Transfer[] = [
  { id: 't0',  time: 'just now', wallet: 'vega-prod',           to: ADDRS[4]!, amount: 60.00, token: 'USDC', status: 'blocked',  reason: 'parent_daily_cap_exceeded' },
  { id: 't1',  time: 'just now', wallet: 'rigel-mev',           to: ADDRS[0]!, amount: 24.50, token: 'USDC', status: 'success' },
  { id: 't2',  time: '2m ago',   wallet: 'altair-arb',          to: ADDRS[1]!, amount: 8.20,  token: 'SOL',  status: 'success' },
  { id: 't3',  time: '4m ago',   wallet: 'vega-prod',           to: ADDRS[6]!, amount: 30.00, token: 'USDC', status: 'blocked',  reason: 'blocklist_hit' },
  { id: 't4',  time: '6m ago',   wallet: 'rigel-mev',           to: ADDRS[2]!, amount: 12.00, token: 'USDC', status: 'rejected', reason: 'user_rejected' },
  { id: 't5',  time: '11m ago',  wallet: 'orion-treasury',      to: ADDRS[4]!, amount: 250.0, token: 'USDC', status: 'success' },
  { id: 't6',  time: '14m ago',  wallet: 'vega-prod',           to: ADDRS[1]!, amount: 18.40, token: 'JUP',  status: 'success' },
  { id: 't7',  time: '18m ago',  wallet: 'antares-yield',       to: ADDRS[5]!, amount: 60.00, token: 'USDC', status: 'pending',  reason: 'awaiting_hitl' },
  { id: 't8',  time: '24m ago',  wallet: 'altair-arb',          to: ADDRS[0]!, amount: 5.10,  token: 'SOL',  status: 'success' },
  { id: 't9',  time: '32m ago',  wallet: 'rigel-mev',           to: ADDRS[6]!, amount: 60.00, token: 'USDC', status: 'blocked',  reason: 'vendor_cap_exceeded' },
  { id: 't10', time: '41m ago',  wallet: 'lyra-staging',        to: ADDRS[1]!, amount: 2.20,  token: 'SOL',  status: 'success' },
  { id: 't11', time: '53m ago',  wallet: 'sirius-drainer-test', to: ADDRS[6]!, amount: 100.0, token: 'USDC', status: 'blocked',  reason: 'quarantined' },
  { id: 't12', time: '1h ago',   wallet: 'vega-prod',           to: ADDRS[0]!, amount: 14.00, token: 'USDC', status: 'success' },
  { id: 't13', time: '1h ago',   wallet: 'orion-treasury',      to: ADDRS[3]!, amount: 410.0, token: 'USDC', status: 'success' },
  { id: 't14', time: '1h ago',   wallet: 'rigel-mev',           to: ADDRS[6]!, amount: 75.00, token: 'USDC', status: 'blocked',  reason: 'blocklist_hit' },
  { id: 't15', time: '2h ago',   wallet: 'altair-arb',          to: ADDRS[1]!, amount: 22.00, token: 'JUP',  status: 'success' },
  { id: 't16', time: '2h ago',   wallet: 'vega-prod',           to: ADDRS[5]!, amount: 80.00, token: 'USDC', status: 'rejected', reason: 'user_rejected' },
  { id: 't17', time: '3h ago',   wallet: 'antares-yield',       to: ADDRS[4]!, amount: 18.00, token: 'USDC', status: 'success' },
  { id: 't18', time: '4h ago',   wallet: 'rigel-mev',           to: ADDRS[6]!, amount: 200.0, token: 'USDC', status: 'blocked',  reason: 'daily_cap_exceeded' },
];

export const APPROVALS_PENDING: Approval[] = [
  {
    id: 'a1', wallet: 'vega-prod',
    to: '8xKj3mNpRfV1jYsWdL', toLabel: 'unknown vendor',
    amount: 60.00, token: 'USDC', memo: 'jup swap → bonk',
    reason: 'above $50 threshold', requestedAt: 'requested 0:34 ago',
    secondsLeft: 28, urgent: true,
  },
  {
    id: 'a2', wallet: 'orion-treasury',
    to: 'kam9hLm2vQrWfTpA1xJfN', toLabel: 'kamino vault',
    amount: 1500.00, token: 'USDC', memo: 'rebalance into supply',
    reason: 'large transfer · over $1000', requestedAt: 'requested 1:12 ago',
    secondsLeft: 158, urgent: false,
  },
];

export const APPROVALS_RESOLVED: ResolvedApproval[] = [
  { id: 'r1', wallet: 'rigel-mev',     amount: '60.00 USDC', by: 'morgan',  status: 'success',  time: '2m ago' },
  { id: 'r2', wallet: 'altair-arb',    amount: '120.0 USDC', by: 'morgan',  status: 'rejected', time: '14m ago' },
  { id: 'r3', wallet: 'vega-prod',     amount: '85.00 USDC', by: 'priya',   status: 'success',  time: '32m ago' },
  { id: 'r4', wallet: 'antares-yield', amount: '210.0 USDC', by: 'morgan',  status: 'success',  time: '1h ago' },
  { id: 'r5', wallet: 'rigel-mev',     amount: '40.00 SOL',  by: 'expired', status: 'rejected', time: '2h ago' },
];
