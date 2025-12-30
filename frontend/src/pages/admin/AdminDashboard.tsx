import { useEffect, useState } from "react";
import "../../styles/dashboard.css";
import { adminOverview, adminLogout } from "../../lib/adminConsoleApi";
import { useNavigate } from "react-router-dom";

type Overview = {
  models: {
    total: number;
    enabled: number;
    active: null | { id: number; name: string; arch: string; version: string; enabled: boolean; is_active: boolean };
  };
  usage: {
    active_users_7d: number;
    daily_inferences_7d: { day: string; count: number }[];
  };
};

export default function AdminDashboard() {
  const nav = useNavigate();
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    adminOverview().then(setData).catch(() => {
      // if admin session missing
      nav("/admin/login", { replace: true });
    });
  }, []);

  const activeName =
    data?.models.active ? `${data.models.active.name} (${data.models.active.arch}, ${data.models.active.version})` : "None";

  return (
    <div className="dashPage">
      <div className="dashShell">
        {/* Sidebar */}
        <aside className="dashSidebar">
          <div className="dashBrand">
            <div className="dashLogo">B</div>
            <div>
              <div className="dashName">BanglaSign Admin</div>
              <div className="dashTag">Control Panel</div>
            </div>
          </div>

          <nav className="dashNav">
            <a className="dashNavItem active" href="/admin">Dashboard</a>
            <a className="dashNavItem" href="/admin/models">Models</a>
            <a className="dashNavItem" href="/admin/users">Users</a>
            <a className="dashNavItem" href="/admin/stats">Stats</a>
            <a className="dashNavItem" href="/admin/settings">Settings</a>
          </nav>

          <div className="dashSidebarFoot">
            <button
              className="dashGhostBtn"
              onClick={async () => {
                await adminLogout().catch(() => {});
                nav("/admin/login", { replace: true });
              }}
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="dashMain">
          <header className="dashTopbar">
            <div>
              <h1 className="dashTitle">Admin Dashboard</h1>
              <p className="dashSub">Deployment status, active model, and platform usage</p>
            </div>

            <div className="dashTopbarRight">
              <div className="dashPill">prod</div>
              <div className="dashAvatar">SN</div>
            </div>
          </header>

          <section className="dashGrid">
            <div className="dashCard">
              <div className="dashCardLabel">Active Model</div>
              <div className="dashCardValue">{data ? "Live" : "—"}</div>
              <div className="dashCardHint">{data ? activeName : "Loading…"}</div>
            </div>

            <div className="dashCard">
              <div className="dashCardLabel">Models</div>
              <div className="dashCardValue">{data ? data.models.total : "—"}</div>
              <div className="dashCardHint">{data ? `${data.models.enabled} enabled` : ""}</div>
            </div>

            <div className="dashCard">
              <div className="dashCardLabel">Active Users (7d)</div>
              <div className="dashCardValue">{data ? data.usage.active_users_7d : "—"}</div>
              <div className="dashCardHint">Unique users with inference events</div>
            </div>
          </section>

          <section className="dashWide">
            <div className="dashPanel">
              <div className="dashPanelTitle">Usage (7 days)</div>
              <div className="dashPanelBody">
                {(data?.usage.daily_inferences_7d ?? []).slice(-6).map((d) => (
                  <div className="dashRow" key={d.day}>
                    <div className="dot" />
                    <div>
                      <div className="dashRowTitle">{d.day}</div>
                      <div className="dashRowSub">{d.count} inferences</div>
                    </div>
                    <div className="dashRowMeta">—</div>
                  </div>
                ))}
                {!data && <div className="dashRowSub">Loading…</div>}
              </div>
            </div>

            <div className="dashPanel">
              <div className="dashPanelTitle">Actions</div>
              <div className="dashPanelBody">
                <ul className="dashList">
                  <li>Set which model is active</li>
                  <li>Enable/Disable models</li>
                  <li>Upload new .pth models</li>
                  <li>View platform usage</li>
                </ul>

                <button className="dashPrimaryBtn" onClick={() => nav("/admin/models")}>
                  Go to Model Control
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
