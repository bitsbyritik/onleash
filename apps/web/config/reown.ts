'use client';

import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { solana, solanaDevnet } from '@reown/appkit/networks';

const solanaAdapter = new SolanaAdapter();

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? '';

const appUrl =
  typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL ?? 'https://onleash.xyz';

export const modal = createAppKit({
  adapters: [solanaAdapter],
  networks: [solana, solanaDevnet],
  projectId,
  metadata: {
    name: 'OnLeash',
    description: 'Spend Controls for AI Agent Wallets on Solana',
    url: appUrl,
    icons: [`${appUrl}/icon.png`],
  },
  features: {
    // Connection methods — email first, then social, then wallets
    connectMethodsOrder: ['email', 'social', 'wallet'],
    // Show wallets below the email input instead of hiding them
    emailShowWallets: true,
    // Collapse wallet list into a single "Continue with wallet" button
    collapseWallets: true,
    // Wallet connector display order
    connectorTypeOrder: ['walletConnect', 'recent', 'injected', 'featured', 'custom', 'external', 'recommended'],
    // Auth methods
    email: true,
    socials: ['google', 'github'],
    // Wallet feature tabs order (post-connect account view)
    walletFeaturesOrder: ['onramp', 'swaps', 'receive', 'send'],
    // Misc
    allWallets: true,
    legalCheckbox: false,
    analytics: false,
    receive: true,
    send: true,
    swaps: false,
    onramp: false,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#00ff88',          // OnLeash mint
    '--w3m-border-radius-master': '4px', // matches demo (was 0px)
  },
});
