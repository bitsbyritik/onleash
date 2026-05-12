import "dotenv/config";
import { Keypair, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import bs58 from "bs58";
import { LeashWallet } from "@onleash/sdk";

// ── Config ────────────────────────────────────────────────────────────────────

const API_KEY = process.env.ONLEASH_API_KEY!;
const WALLET_ID = process.env.ONLEASH_WALLET_ID!;

if (!API_KEY || !WALLET_ID) {
  console.error("\n  Missing env vars. Copy .env.example → .env and fill in ONLEASH_API_KEY and ONLEASH_WALLET_ID.\n");
  process.exit(1);
}

const DEVNET_RPC = "https://api.devnet.solana.com";
// A real devnet address to send SOL to (won't lose real money)
const VENDOR_A = "GsbwXfJraMomNxBcjYLcG3mxkBUiyWXAB32fGbSMQRdW";
const VENDOR_B = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";

// ── Terminal helpers ──────────────────────────────────────────────────────────

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

function header(title: string) {
  console.log(`\n${c.cyan}${"─".repeat(56)}${c.reset}`);
  console.log(`${c.bold}${c.white}  ${title}${c.reset}`);
  console.log(`${c.cyan}${"─".repeat(56)}${c.reset}`);
}

function step(n: number, label: string) {
  console.log(`\n${c.bold}${c.cyan}[${n}]${c.reset} ${c.white}${label}${c.reset}`);
}

function ok(msg: string) {
  console.log(`    ${c.green}✓${c.reset}  ${msg}`);
}

function blocked(msg: string) {
  console.log(`    ${c.red}✗${c.reset}  ${c.red}BLOCKED${c.reset} — ${msg}`);
}

function waiting(msg: string) {
  console.log(`    ${c.yellow}⏳${c.reset} ${msg}`);
}

function info(key: string, val: string) {
  console.log(`    ${c.gray}${key}:${c.reset} ${c.dim}${val}${c.reset}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  header("OnLeash SDK Demo  •  Devnet AI Agent");

  // Load or generate keypair
  let keypair: Keypair;
  if (process.env.AGENT_PRIVATE_KEY) {
    keypair = Keypair.fromSecretKey(bs58.decode(process.env.AGENT_PRIVATE_KEY));
  } else {
    keypair = Keypair.generate();
    console.log(`\n  ${c.yellow}Generated new keypair — save this private key:${c.reset}`);
    console.log(`  ${c.dim}${bs58.encode(keypair.secretKey)}${c.reset}`);
  }

  info("Agent wallet", keypair.publicKey.toBase58());
  info("Wallet ID   ", WALLET_ID);

  // Airdrop if needed
  const connection = new Connection(DEVNET_RPC, "confirmed");
  const balance = await connection.getBalance(keypair.publicKey);
  if (balance < 0.1 * LAMPORTS_PER_SOL) {
    console.log(`\n  ${c.yellow}Low balance — requesting airdrop...${c.reset}`);
    const sig = await connection.requestAirdrop(keypair.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction({ signature: sig, ...(await connection.getLatestBlockhash()) });
    ok(`Airdropped 2 SOL`);
  } else {
    info("Balance     ", `${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
  }

  // Init SDK
  const leash = new LeashWallet({
    keypair,
    network: "devnet",
    apiKey: API_KEY,
    walletId: WALLET_ID,
    connection,
  });

  // ── Step 1: Verify ──────────────────────────────────────────────────────────
  step(1, "Verifying agent wallet with OnLeash...");
  await leash.verify();
  ok("Wallet verified");

  // ── Step 2: Load policy ─────────────────────────────────────────────────────
  step(2, "Loading spend policy from OnLeash...");
  const policy = await leash.getPolicy();
  ok(`Policy loaded`);
  info("Daily cap          ", `${policy.dailyCap} lamports`);
  info("Per-vendor cap     ", `${policy.perVendorCap} lamports`);
  info("Approval threshold ", `${policy.approvalThreshold} lamports`);
  info("Blocklist          ", policy.blocklist.length ? policy.blocklist.join(", ") : "none");

  // ── Step 3: Normal transfer ─────────────────────────────────────────────────
  step(3, "Sending small transfer (below threshold)...");
  const smallAmount = policy.approvalThreshold / 10n;
  const r1 = await leash.send({ to: VENDOR_A, amount: smallAmount, token: "SOL", memo: "payment to vendor A" });

  if (r1.status === "success") {
    ok(`Transfer executed on-chain`);
    info("Signature", r1.signature!);
    info("Explorer ", `https://explorer.solana.com/tx/${r1.signature}?cluster=devnet`);
  } else {
    blocked(r1.reason ?? r1.status);
  }

  // ── Step 4: Blocked — over daily cap ────────────────────────────────────────
  step(4, "Attempting transfer over daily cap...");
  const overCap = policy.dailyCap + 1_000_000n;
  const r2 = await leash.send({ to: VENDOR_A, amount: overCap, token: "SOL" });

  if (r2.status === "blocked") {
    ok(`Policy engine blocked the transfer (as expected)`);
    info("Rule   ", r2.violatedRule ?? "");
    info("Reason ", r2.reason ?? "");
  } else {
    console.log(`    ${c.yellow}⚠${c.reset}  Expected block, got: ${r2.status}`);
  }

  // ── Step 5: Blocked — blocklisted address ───────────────────────────────────
  if (policy.blocklist.length > 0) {
    step(5, "Attempting transfer to blocklisted address...");
    const r3 = await leash.send({ to: policy.blocklist[0]!, amount: smallAmount, token: "SOL" });

    if (r3.status === "blocked") {
      ok(`Blocklist rule enforced`);
      info("Rule   ", r3.violatedRule ?? "");
    } else {
      console.log(`    ${c.yellow}⚠${c.reset}  Expected block, got: ${r3.status}`);
    }
  }

  // ── Step 6: Approval flow ───────────────────────────────────────────────────
  step(6, "Sending transfer that requires human approval...");
  const approvalAmount = policy.approvalThreshold;

  if (approvalAmount > policy.dailyCap) {
    console.log(`    ${c.gray}— skipped (approval threshold exceeds daily cap)${c.reset}`);
  } else {
    waiting("Waiting for approval in OnLeash dashboard (timeout: 60s)...");
    waiting("Open https://onleash-web.vercel.app/dashboard to approve or reject.");

    const r4 = await leash.send({
      to: VENDOR_B,
      amount: approvalAmount,
      token: "SOL",
      sessionId: "demo-approval",
    });

    if (r4.status === "success") {
      ok(`Approved and executed on-chain`);
      info("Signature", r4.signature!);
      info("Explorer ", `https://explorer.solana.com/tx/${r4.signature}?cluster=devnet`);
    } else if (r4.status === "rejected") {
      ok(`Rejected by approver (transfer cancelled)`);
      info("Approval ID", r4.approvalId ?? "");
    } else {
      blocked(r4.reason ?? r4.status);
    }
  }

  // ── Done ────────────────────────────────────────────────────────────────────
  console.log(`\n${c.cyan}${"─".repeat(56)}${c.reset}`);
  console.log(`${c.bold}${c.green}  Demo complete.${c.reset}`);
  console.log(`${c.cyan}${"─".repeat(56)}${c.reset}\n`);
}

main().catch((e) => {
  console.error(`\n${c.red}Fatal:${c.reset}`, e.message);
  process.exit(1);
});
