import { useEffect, useState } from "react";
import "../../styles/dashboard.css";
import { listModels, uploadModel, toggleModel, activateModel, deleteModel } from "../../lib/adminConsoleApi";
import { useNavigate } from "react-router-dom";

type ModelRow = {
  id: number;
  name: string;
  arch: string;
  version: string;
  enabled: boolean;
  is_active: boolean;
  created_at: string;
};

export default function AdminModels() {
  const nav = useNavigate();
  const [rows, setRows] = useState<ModelRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    const data = await listModels();
    setRows(data);
  }

  useEffect(() => {
    refresh().catch(() => nav("/admin/login", { replace: true }));
  }, []);

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const fd = new FormData(e.currentTarget);
      await uploadModel(fd);
      (e.currentTarget as any).reset?.();
      await refresh();
    } catch (ex: any) {
      setErr(ex?.response?.data?.detail ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dashPage">
      <div className="dashShell">
        <aside className="dashSidebar">
          <div className="dashBrand">
            <div className="dashLogo">B</div>
            <div>
              <div className="dashName">BanglaSign Admin</div>
              <div className="dashTag">Model Control</div>
            </div>
          </div>

          <nav className="dashNav">
            <a className="dashNavItem" href="/admin">Dashboard</a>
            <a className="dashNavItem active" href="/admin/models">Models</a>
          </nav>
        </aside>

        <main className="dashMain">
          <header className="dashTopbar">
            <div>
              <h1 className="dashTitle">Models</h1>
              <p className="dashSub">Upload, enable/disable, and set active model</p>
            </div>
          </header>

          {/* Upload */}
          <section className="dashWide">
            <div className="dashPanel">
              <div className="dashPanelTitle">Upload Model (.pth)</div>
              <div className="dashPanelBody">
                {err && <div style={{ marginBottom: 12, opacity: 0.9 }}>{err}</div>}
                <form onSubmit={onUpload} style={{ display: "grid", gap: 10 }}>
                  <input name="name" placeholder="Model name (e.g., EfficientNet-B0 Crop)" required />
                  <select name="arch" required defaultValue="effnet_b0">
                    <option value="effnet_b0">EfficientNet-B0</option>
                    <option value="resnet18">ResNet18</option>
                    <option value="mlp">MLP</option>
                  </select>
                  <input name="version" placeholder="Version (e.g., v1)" defaultValue="v1" />
                  <input name="description" placeholder="Description (optional)" />
                  <input name="file" type="file" accept=".pth" required />
                  <button className="dashPrimaryBtn" type="submit" disabled={busy}>
                    {busy ? "Uploading…" : "Upload"}
                  </button>
                </form>
              </div>
            </div>

            <div className="dashPanel">
              <div className="dashPanelTitle">Registered Models</div>
              <div className="dashPanelBody">
                <div style={{ display: "grid", gap: 10 }}>
                  {rows.map((m) => (
                    <div key={m.id} className="dashRow" style={{ alignItems: "center" }}>
                      <div className="dot" />
                      <div>
                        <div className="dashRowTitle">
                          {m.name}{" "}
                          {m.is_active ? <span style={{ marginLeft: 8, opacity: 0.85 }}>(ACTIVE)</span> : null}
                        </div>
                        <div className="dashRowSub">
                          {m.arch} • {m.version} • {m.enabled ? "Enabled" : "Disabled"}
                        </div>
                      </div>

                      <div className="dashRowMeta" style={{ display: "flex", gap: 8 }}>
                        <button
                          className="dashGhostBtn"
                          onClick={async () => {
                            await toggleModel(m.id, !m.enabled);
                            await refresh();
                          }}
                        >
                          {m.enabled ? "Disable" : "Enable"}
                        </button>

                        <button
                          className="dashPrimaryBtn"
                          disabled={!m.enabled || m.is_active}
                          onClick={async () => {
                            await activateModel(m.id);
                            await refresh();
                          }}
                        >
                          Activate
                        </button>

                        <button
                            className="dashGhostBtn"
                            onClick={async () => {
                                const ok = confirm(`Delete model "${m.name}"? This cannot be undone.`);
                                if (!ok) return;
                                await deleteModel(m.id);
                                await refresh();
                            }}
                            >
                            Delete
                        </button>

                      </div>
                    </div>
                  ))}
                  {rows.length === 0 && <div className="dashRowSub">No models registered yet.</div>}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
