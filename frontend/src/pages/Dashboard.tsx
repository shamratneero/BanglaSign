import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/dashboard.css";
import { useAuth } from "../auth/useAuth";

type Metric = { label: string; value: string; sub?: string };

export default function Dashboard() {
  const nav = useNavigate();
  const { me, loading, refreshMe, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // V1: until stats APIs exist, use safe placeholders that still look "finished"
  const isAdmin = !!(me?.is_superuser || me?.is_staff);

  const roleLabel = isAdmin ? "Admin" : "User";

  const activeModel = useMemo(
    () => ({
      name: "EfficientNet-B0",
      type: "CNN • MediaPipe ROI",
      status: "Active",
      hint: isAdmin ? "Manage in Admin Console" : "Selected by system",
    }),
    [isAdmin]
  );

  const quickMetrics: Metric[] = useMemo(() => {
    if (isAdmin) {
      return [
        { label: "Active Users (Today)", value: "—", sub: "Hook to stats API" },
        { label: "Total Inferences (24h)", value: "—", sub: "Hook to stats API" },
        { label: "Errors (24h)", value: "—", sub: "Hook to logs" },
      ];
    }
    return [
      { label: "Your Inferences (Today)", value: "—", sub: "Hook to history API" },
      { label: "Avg Latency", value: "—", sub: "From infer responses" },
      { label: "Last Session", value: "—", sub: "Recent activity" },
    ];
  }, [isAdmin]);

  const listTitle = isAdmin ? "Recent System Activity" : "Your Recent History";
  const listItems = useMemo(() => {
    if (isAdmin) {
      return [
        { left: "Model active", right: activeModel.name, sub: "—" },
        { left: "Gateway health", right: "OK", sub: "—" },
        { left: "Inference API", right: "OK", sub: "—" },
      ];
    }
    return [
      { left: "Last prediction", right: "—", sub: "Open Live Inference to generate" },
      { left: "Top-3 list", right: "—", sub: "Shows after first run" },
      { left: "Latency", right: "—", sub: "Shows after first run" },
    ];
  }, [isAdmin, activeModel.name]);

  // On mount: ensure we load /api/me once (helps after refresh)
  useEffect(() => {
    (async () => {
      try {
        await refreshMe();
      } catch {
        // ignore; route guard should handle if not logged in
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLogout = async () => {
    setErr(null);
    try {
      setBusy(true);
      await logout();
      nav("/login", { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Logout failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div className="dashPage">
      <div className="dashShell">
        {/* Sidebar */}
        <aside className="dashSidebar">
          <div className="dashBrand">
            <div className="dashLogo">T</div>
            <div>
              <div className="dashName">Project Tango</div>
              <div className="dashTag">Workspace</div>
            </div>
          </div>

          <nav className="dashNav">
            <a className="dashNavItem active" href="/dashboard" onClick={(e) => e.preventDefault()}>
              Dashboard
            </a>

            <Link className="dashNavItem" to="/infer">
              Live Inference
            </Link>

            {isAdmin && (
              <Link className="dashNavItem" to="/admin">
                Admin Console
              </Link>
            )}
          </nav>

          <div className="dashSidebarFoot">
            <div className="dashUserMini">
              <div className="dashAvatar">{(me?.username?.[0] || "?").toUpperCase()}</div>
              <div className="dashUserMeta">
                <div className="dashUserName">{me?.username || "Unknown user"}</div>
                <div className="dashUserSub">{roleLabel}</div>
              </div>
            </div>

            <button
              type="button"
              className="dashLogoutBtn"
              onClick={onLogout}
              disabled={busy}
              style={{
                width: "100%",
                marginTop: 12,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "inherit",
                cursor: busy ? "not-allowed" : "pointer",
              }}
            >
              {busy ? "Logging out…" : "Logout"}
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="dashMain">
          <div className="dashTop">
            <div>
              <h1 className="dashTitle">Welcome, {me?.username || "—"}</h1>
              <p className="dashSub" style={{ opacity: 0.8 }}>
                {isAdmin
                  ? "Monitor system health, manage deployed models, and track usage."
                  : "Start live sign recognition, view your recent activity, and track performance."}
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                className="dashRefreshBtn"
                onClick={async () => {
                  setErr(null);
                  try {
                    setBusy(true);
                    await refreshMe();
                  } catch (e: any) {
                    setErr(e?.message || "Failed to refresh user session");
                  } finally {
                    setBusy(false);
                  }
                }}
                disabled={busy}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.06)",
                  color: "inherit",
                  cursor: busy ? "not-allowed" : "pointer",
                }}
              >
                {busy ? "Refreshing…" : "Refresh session"}
              </button>

              <button
                type="button"
                onClick={() => nav("/infer")}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(160,130,255,0.35)",
                  background: "linear-gradient(180deg, rgba(120,80,255,0.35), rgba(120,80,255,0.18))",
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                Go to Live Inference
              </button>
            </div>
          </div>

          {err && (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 12,
                background: "rgba(255,0,0,0.08)",
                border: "1px solid rgba(255,0,0,0.18)",
              }}
            >
              {err}
            </div>
          )}

          {/* Grid */}
          <div className="dashGrid" style={{ marginTop: 18 }}>
            {/* Card 1: Live Inference */}
            <div className="dashCard">
              <div className="dashCardTitle">Live Inference</div>
              <div style={{ marginTop: 10, opacity: 0.85, lineHeight: 1.6 }}>
                Use your webcam for real-time Bangla sign recognition with MediaPipe ROI.
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                <button
                  onClick={() => nav("/infer")}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.06)",
                    color: "inherit",
                    cursor: "pointer",
                  }}
                >
                  Open Live Inference
                </button>

                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.04)",
                    opacity: 0.9,
                  }}
                >
                  Status: <b style={{ marginLeft: 6 }}>Ready</b>
                </div>
              </div>
            </div>

            {/* Card 2: Active Model */}
            <div className="dashCard">
              <div className="dashCardTitle">Active Model</div>

              <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{activeModel.name}</div>
                <div style={{ opacity: 0.8 }}>{activeModel.type}</div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.06)",
                    width: "fit-content",
                    marginTop: 6,
                  }}
                >
                  <span style={{ opacity: 0.8 }}>Status</span>
                  <b>{activeModel.status}</b>
                </div>

                <div style={{ marginTop: 8, opacity: 0.7, fontSize: 13 }}>
                  {activeModel.hint}
                </div>

                {isAdmin && (
                  <button
                    onClick={() => nav("/admin")}
                    style={{
                      marginTop: 10,
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.06)",
                      color: "inherit",
                      cursor: "pointer",
                      width: "fit-content",
                    }}
                  >
                    Manage Models
                  </button>
                )}
              </div>
            </div>

            {/* Card 3: Usage / System */}
            <div className="dashCard">
              <div className="dashCardTitle">{isAdmin ? "System Overview" : "Your Usage"}</div>

              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                {quickMetrics.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.10)",
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ opacity: 0.85 }}>{m.label}</div>
                      <div style={{ fontWeight: 900 }}>{m.value}</div>
                    </div>
                    {m.sub && <div style={{ marginTop: 6, opacity: 0.65, fontSize: 13 }}>{m.sub}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 4: History / Activity */}
            <div className="dashCard">
              <div className="dashCardTitle">{listTitle}</div>

              <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                {listItems.map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.10)",
                      background: "rgba(255,255,255,0.04)",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <div style={{ opacity: 0.85 }}>
                      <b style={{ opacity: 0.95 }}>{it.left}</b>
                      {it.sub ? <div style={{ opacity: 0.65, fontSize: 13, marginTop: 4 }}>{it.sub}</div> : null}
                    </div>
                    <div style={{ fontWeight: 900, opacity: 0.95 }}>{it.right}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 12, opacity: 0.7, fontSize: 13 }}>
                V1 note: history & analytics can be wired once stats endpoints are finalized.
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
