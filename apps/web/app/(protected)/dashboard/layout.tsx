import "./dashboard.css";
import Sidebar from "@/app/components/dashboard/Sidebar";
import Topbar from "@/app/components/dashboard/Topbar";

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
