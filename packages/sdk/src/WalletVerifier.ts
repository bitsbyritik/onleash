import type { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";
import type { ApiClient } from "./ApiClient";

export class WalletVerifier {
  constructor(
    private readonly keypair: Keypair,
    private readonly api: ApiClient,
  ) {}

  async ensureVerified(): Promise<void> {
    const wallet = await this.api.getWallet();
    if (wallet.isVerified) return;
    await this.verify();
  }

  async verify(): Promise<void> {
    const { challenge } = await this.api.getChallenge();

    const messageBytes = new TextEncoder().encode(challenge);
    const signature = nacl.sign.detached(messageBytes, this.keypair.secretKey);

    await this.api.submitVerification({
      challenge,
      signature: bs58.encode(signature),
      publicKey: this.keypair.publicKey.toBase58(),
    });
  }
}
