import './dashboard.css';
import Sidebar from '@/components/dashboard/Sidebar';

export const metadata = {
  title: 'Dashboard · OnLeash',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ds">
      <Sidebar pendingCount={2} />
      <main className="ds-main">
        {children}
      </main>
    </div>
  );
}
