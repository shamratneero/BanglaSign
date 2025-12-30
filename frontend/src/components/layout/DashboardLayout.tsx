import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./layout.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboardShell">
      <Sidebar />
      <div className="dashboardMain">
        <Topbar />
        <main className="dashboardContent">{children}</main>
      </div>
    </div>
  );
}
