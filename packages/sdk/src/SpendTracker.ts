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
  }
}
