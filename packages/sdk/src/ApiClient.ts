import type {
  ApiSpendResponse,
  ApiPolicyResponse,
  ApiTransferResponse,
  ApiApprovalResponse,
  ApiChallengeResponse,
  ApiWalletResponse,
  TransferStatus,
  ApprovalStatus,
} from "./types";
import { ApiError } from "./types";

export class ApiClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  readonly walletId: string;

  constructor(config: { apiKey: string; walletId: string; baseUrl?: string }) {
    this.apiKey = config.apiKey;
    this.walletId = config.walletId;
    this.baseUrl = (config.baseUrl ?? "https://api.onleash.dev").replace(
      /\/$/,
      "",
    );
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        ...options.headers,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: res.statusText }));
      throw new ApiError(res.status, (body as any).message ?? res.statusText);
    }

    return res.json() as Promise<T>;
  }

  async getWallet(): Promise<ApiWalletResponse> {
    return this.request<ApiWalletResponse>(`/api/sdk/wallets/${this.walletId}`);
  }

  async getChallenge(): Promise<ApiChallengeResponse> {
    return this.request<ApiChallengeResponse>(
      `/api/sdk/wallets/${this.walletId}/challenge`,
      { method: "POST" },
    );
  }

  async submitVerification(params: {
    signature: string;
    publicKey: string;
  }): Promise<void> {
    await this.request(`/api/sdk/wallets/${this.walletId}/verify`, {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  async getPolicy(): Promise<ApiPolicyResponse> {
    return this.request<ApiPolicyResponse>(
      `/api/sdk/wallets/${this.walletId}/policy`,
    );
  }

  async getSpend(): Promise<ApiSpendResponse> {
    return this.request<ApiSpendResponse>(
      `/api/sdk/wallets/${this.walletId}/spend`,
    );
  }

  async recordSpend(params: {
    toAddress: string;
    amount: string;
    token: string;
  }): Promise<void> {
    await this.request(`/api/sdk/wallets/${this.walletId}/spend`, {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  async createTransfer(params: {
    fromAddress: string;
    toAddress: string;
    amount: string;
    token: string;
    status: TransferStatus;
    memo?: string;
    sessionId?: string;
    policyId: string;
    policyVersion: number;
    signature?: string;
    rawTransaction?: string;
  }): Promise<ApiTransferResponse> {
    return this.request<ApiTransferResponse>(
      `/api/sdk/wallets/${this.walletId}/transfers`,
      {
        method: "POST",
        body: JSON.stringify(params),
      },
    );
  }

  async updateTransfer(
    transferId: string,
    params: {
      status: TransferStatus;
      signature?: string;
      rawTransaction?: string;
    },
  ): Promise<void> {
    await this.request(`/api/sdk/transfers/${transferId}`, {
      method: "PATCH",
      body: JSON.stringify(params),
    });
  }

  async createViolation(params: {
    transferId: string;
    walletId: string;
    rule: string;
    message: string;
    attemptedAmount: string;
    limitAmount?: string;
    sessionId?: string;
  }): Promise<void> {
    await this.request(`/api/sdk/violations`, {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  async createApproval(params: {
    transferId: string;
    expiresAt: string;
  }): Promise<ApiApprovalResponse> {
    return this.request<ApiApprovalResponse>(`/api/sdk/approvals`, {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  async getApproval(approvalId: string): Promise<ApiApprovalResponse> {
    return this.request<ApiApprovalResponse>(
      `/api/sdk/approvals/${approvalId}`,
    );
  }
}
