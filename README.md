# OnLeash

OnLeash is a policy layer for Solana agent wallets. It wraps an agent keypair with spend limits, allow/block lists, per-vendor caps, approval thresholds, spend tracking, and human-in-the-loop approvals before a transfer is allowed to execute.

The repository is a Bun/Turborepo monorepo containing:

- a Next.js landing page and protected dashboard
- a TypeScript SDK for policy-checked transfers
- a Drizzle/Postgres data layer
- an Anchor program for on-chain policy and approval enforcement

## Workspace

```txt
apps/web                    Next.js app, dashboard, auth, and API routes
packages/sdk                TypeScript SDK used by agent runtimes
packages/db                 Drizzle schema, migrations, and Postgres client
packages/ui                 Shared React UI primitives
packages/eslint-config      Shared lint config
packages/typescript-config  Shared TypeScript config
programs                    Anchor workspace for the OnLeash program
```

## Product Surface

- Wallet-based sign-in with nonce challenge verification.
- Team workspace, API key management, and protected dashboard pages.
- Agent wallet registration, challenge verification, policies, transfers, approvals, violations, and spend endpoints.
- Policy controls for daily cap, per-vendor cap, approval threshold, allowlist mode, blocklist, notification channels, and versioned policy records.
- SDK primitives for `LeashWallet`, policy checks, spend tracking, HITL approval waits, wallet verification, API access, and Solana/Anchor execution.
- Anchor instructions for policy initialization, child policy initialization, policy updates, direct transfers, approval requests, approved transfers, rejection/expiry, activation/deactivation, closing, and daily spend reset.

## Prerequisites

- Bun `1.3.5`
- Node.js `>=18`
- Docker, for local Postgres
- Rust and Anchor tooling, for the Solana program
- A Solana keypair at `~/.config/solana/id.json` when running Anchor against localnet

## Setup

Install dependencies:

```sh
bun install
```

Start Postgres:

```sh
docker compose up -d postgres
```

Create `.env` in the repo root:

```sh
DATABASE_URL=postgres://onleash:onleash@localhost:5432/onleash
SESSION_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
```

Push the Drizzle schema:

```sh
bun run db:push
```

Start the app:

```sh
bun run dev
```

The web app runs at `http://localhost:3000`.

## Common Commands

```sh
bun run dev          # run workspace dev tasks
bun run build        # build all packages/apps through Turbo
bun run lint         # lint all configured workspaces
bun run check-types  # run type checks
bun run format       # format TS/TSX/MD files

bun run db:generate  # create Drizzle migrations
bun run db:migrate   # run Drizzle migrations using DATABASE_URL
bun run db:push      # push schema changes using DATABASE_URL
bun run db:studio    # open Drizzle Studio
```

Package-specific examples:

```sh
bun run --filter web dev
bun run --filter @repo/sdk build
bun run --filter @repo/db db:studio
```

## SDK Usage

The SDK exports `LeashWallet` plus lower-level clients and policy helpers.

```ts
import { Connection, Keypair } from "@solana/web3.js";
import { LeashWallet } from "@repo/sdk";

const wallet = new LeashWallet({
  keypair: Keypair.generate(),
  connection: new Connection("https://api.devnet.solana.com"),
  apiKey: process.env.ONLEASH_API_KEY!,
  walletId: process.env.ONLEASH_WALLET_ID!,
  network: "devnet",
  apibaseUrl: "http://localhost:3000",
});

const result = await wallet.send({
  to: "8aZKj1111111111111111111111111111111111111",
  amount: 60n,
  token: "USDC",
  memo: "agent payment",
});
```

`send()` validates input, verifies the wallet, loads policy and spend state, blocks policy violations, requests approval when thresholds require it, executes the transfer through Anchor, records spend, and returns a status such as `success`, `blocked`, or `rejected`.

## Web API Areas

The Next.js app exposes API routes for:

- `api/auth/*`: wallet nonce and sign-in flow
- `api/dashboard/*`: session workspace, logout, and API key management
- `api/sdk/wallets/*`: wallet registration, challenge verification, policy, transfers, and spend
- `api/sdk/approvals/*`: approval listing and resolution
- `api/sdk/transfers/*`: transfer updates
- `api/sdk/violations`: policy violation records

SDK routes authenticate with generated API keys.

## Database

The schema is in `packages/db/src/schema`. Current core tables include teams, users, auth nonces, API keys, agent wallets, notification channels, policies, transfers, policy violations, approvals, spend tracking, vendor spend, notification logs, audit logs, and webhook events.

Local Postgres defaults are defined in `docker-compose.yaml`:

```txt
postgres://onleash:onleash@localhost:5432/onleash
```

## Anchor Program

The Anchor workspace lives in `programs`. The localnet program id is:

```txt
6ufLBSxNADjAAS7NT5f9Phnvjxc2We7n7q8s9uKx5GBn
```

Useful commands from `programs`:

```sh
anchor build
anchor test
anchor deploy
```

The program currently exposes policy lifecycle instructions, policy-checked transfers, approval request/approve/reject/expire flows, approved transfer execution, and spend reset.

## Notes

- `apps/web/components/landing/HowItWorks.tsx` currently shows package names such as `@onleash/sdk`, while the local workspace package is `@repo/sdk`.
- Telegram/notification delivery is scaffolded in the API and schema; the approval route still has a placeholder for wiring a real notification service.
- The root README intentionally documents the current repo state, not the original Turborepo starter.
