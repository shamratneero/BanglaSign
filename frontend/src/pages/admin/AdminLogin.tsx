import { useState } from "react";
import { adminLogin } from "../../api/adminAuth";
import "./admin-login.css";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await adminLogin(username, password);
      nav("/admin", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bsAdminPage">
      <div className="bsAdminBg" aria-hidden />
      <div className="bsAdminShell">
        <div className="bsAdminCard">
          {/* Left */}
          <div className="bsAdminLeft">
            <div className="bsBrand">
              <div className="bsLogo" aria-hidden />
              <div className="bsBrandText">
                <div className="bsBrandName">BanglaSign</div>
                <div className="bsBrandSub">Admin Console</div>
              </div>
            </div>

            <div className="bsLeftHint">
              Secure access for model deployment, logs, and system health.
            </div>
          </div>

          <div className="bsDivider" aria-hidden />

          {/* Right */}
          <div className="bsAdminRight">
            <div className="bsTitle">BanglaSign Admin</div>
            <div className="bsSubtitle">Please login to continue.</div>

            {error && <div className="bsError">{error}</div>}

            <form onSubmit={onSubmit} className="bsForm">
              <label className="bsLabel">Username</label>
              <input
                className="bsInput"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="Enter username"
              />

              <label className="bsLabel">Password</label>
              <input
                className="bsInput"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Enter password"
              />

              <button className="bsButton" type="submit" disabled={busy}>
                {busy ? "Signing in…" : "Login"}
              </button>

              {/* removed "forgot password" as requested */}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
