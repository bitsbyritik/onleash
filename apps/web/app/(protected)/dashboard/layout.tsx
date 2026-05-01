import "./dashboard.css";
import Sidebar from "./_components/Sidebar";
import Topbar from "./_components/Topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dash-app">
      <Sidebar />
      <div className="dash-main">
        <Topbar />
        {children}
      </div>
    </div>
  );
}
