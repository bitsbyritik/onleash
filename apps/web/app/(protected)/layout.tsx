import './dashboard/dashboard.css';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db, eq, and, count } from '@repo/db';
import { agentWallets, approvals, teams, transfers } from '@repo/db/schema';
import Sidebar from '@/components/dashboard/Sidebar';
import SolanaWalletProvider from '@/components/WalletProvider';
import { sessionOptions, type SessionData } from '@/lib/auth/session';

export const metadata = {
  title: 'Dashboard · OnLeash',
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId || !session.teamId) redirect('/sign-in');

  const [team, pendingResult] = await Promise.all([
    db.query.teams.findFirst({ where: eq(teams.id, session.teamId) }),
    db
      .select({ value: count() })
      .from(approvals)
      .innerJoin(transfers, eq(approvals.transferId, transfers.id))
      .innerJoin(agentWallets, eq(transfers.walletId, agentWallets.id))
      .where(
        and(
          eq(agentWallets.teamId, session.teamId),
          eq(approvals.status, 'pending'),
        ),
      ),
  ]);

  const pendingApprovals = pendingResult[0]?.value ?? 0;

  return (
    <div className="ds">
      <Sidebar
        pendingCount={pendingApprovals}
        workspaceName={team?.name ?? 'Workspace'}
        workspaceSlug={team?.slug ?? 'workspace'}
        network={team?.defaultNetwork ?? 'devnet'}
      />
      <main className="ds-main">
        <SolanaWalletProvider>
          {children}
        </SolanaWalletProvider>
      </main>
    </div>
  );
}
