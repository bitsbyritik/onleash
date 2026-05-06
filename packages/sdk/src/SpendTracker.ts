import type { ApiClient } from "./ApiClient";
import type { SpendState } from "./types";

export class SpendTracker {
  private cache: SpendState | null = null;
  private cacheDate: string | null = null;

  constructor(
    private readonly api: ApiClient,
    private readonly timezone: string,
  ) {}

  async getSpend(): Promise<SpendState> {
    const today = this.localDate();

    if (this.cache && this.cacheDate === today) {
      return this.cache;
    }

    const raw = await this.api.getSpend();

    const perVendor: Record<string, bigint> = {};
    for (const [addr, amt] of Object.entries(raw.perVendor)) {
      perVendor[addr] = BigInt(amt);
    }

    this.cache = {
      date: raw.date,
      totalSpent: BigInt(raw.totalSpent),
      perVendor,
    };
    this.cacheDate = today;

    return this.cache;
  }

  updateCache(toAddress: string, amount: bigint): void {
    if (!this.cache) return;
    this.cache.totalSpent += amount;
    this.cache.perVendor[toAddress] =
      (this.cache.perVendor[toAddress] ?? 0n) + amount;
  }

  invalidate(): void {
    this.cache = null;
    this.cacheDate = null;
  }

  private localDate(): string {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: this.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }
}
