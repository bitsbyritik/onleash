'use client';

import '@/config/reown';
import type { ReactNode } from 'react';

export default function ReownProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
