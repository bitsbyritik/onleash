import './dashboard/dashboard.css';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db, eq } from '@repo/db';
import { teams } from '@repo/db/schema';
import Sidebar from '@/components/dashboard/Sidebar';
import SolanaWalletProvider from '@/components/WalletProvider';
import { sessionOptions, type SessionData } from '@/lib/auth/session';

export const metadata = {
  title: 'Dashboard · OnLeash',
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId || !session.teamId) redirect('/sign-in');

  const team = await db.query.teams.findFirst({
    where: eq(teams.id, session.teamId),
  });

  return (
    <div className="ds">
      <Sidebar
        pendingCount={2}
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
