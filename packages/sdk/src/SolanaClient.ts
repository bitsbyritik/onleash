import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
} from "@solana/spl-token";
import type { TransferParams, Network } from "./types";

const MINTS: Partial<Record<Network, Partial<Record<string, string>>>> = {
  mainnet: {
    USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    BONK: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    JUP: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
  },
  devnet: {
    USDC: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
  },
};

const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
);

export class SolanaClient {
  constructor(
    private readonly connection: Connection,
    private readonly keypair: Keypair,
    private readonly network: Network = "mainnet",
  ) {}

  async send(transfer: TransferParams): Promise<string> {
    if (transfer.token === "SOL") {
      return this.sendSOL(transfer);
    }
    return this.sendSPL(transfer);
  }

  private async sendSOL(transfer: TransferParams): Promise<string> {
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: this.keypair.publicKey,
        toPubkey: new PublicKey(transfer.to),
        lamports: transfer.amount,
      }),
    );

    if (transfer.memo) {
      tx.add(this.memoInstruction(transfer.memo));
    }

    return sendAndConfirmTransaction(this.connection, tx, [this.keypair]);
  }

  private async sendSPL(transfer: TransferParams): Promise<string> {
    const mintAddress = MINTS[this.network]?.[transfer.token];
    if (!mintAddress) {
      throw new Error(
        `No mint address for ${transfer.token} on ${this.network}`,
      );
    }

    const mint = new PublicKey(mintAddress);
    const recipient = new PublicKey(transfer.to);

    const [fromATA, toATA] = await Promise.all([
      getOrCreateAssociatedTokenAccount(
        this.connection,
        this.keypair,
        mint,
        this.keypair.publicKey,
      ),
      getOrCreateAssociatedTokenAccount(
        this.connection,
        this.keypair,
        mint,
        recipient,
      ),
    ]);

    const tx = new Transaction().add(
      createTransferInstruction(
        fromATA.address,
        toATA.address,
        this.keypair.publicKey,
        transfer.amount,
      ),
    );

    if (transfer.memo) {
      tx.add(this.memoInstruction(transfer.memo));
    }

    return sendAndConfirmTransaction(this.connection, tx, [this.keypair]);
  }

  private memoInstruction(memo: string) {
    return {
      keys: [],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memo, "utf-8"),
    };
  }

  getPublicKey(): string {
    return this.keypair.publicKey.toBase58();
  }
}
