import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import { useAuth } from "../auth/useAuth";

export default function Register() {
  const nav = useNavigate();
  const { register, refreshMe } = useAuth();

  const [first, setFirst] = useState("Shamrat");
  const [last, setLast] = useState("Neero");
  const [email, setEmail] = useState("you@example.com");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agree) {
      setError("Please accept Terms & Conditions");
      return;
    }

    // Backend expects username/password.
    // We'll use email as username so UX remains normal.
    const username = email.trim();
    if (!username) {
      setError("Email/username is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }

    try {
      setSubmitting(true);
      await register(username, password); // <-- IMPORTANT: new signature
      await refreshMe();                 // ensure context has /api/me
      nav("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="authPage">
      <div className="authShell">
        {/* Left media */}
        <div className="authMedia">
          <div className="authMediaInner">
            <div className="authMediaTop">
              <div className="brandRow">
                <div className="brandBadge">T</div>
                <div className="brandText">
                  <b>Project Tango</b>
                  <span>Bangla Sign Language Workspace</span>
                </div>
              </div>

              <a className="ghostPill" href="/" onClick={(e) => e.preventDefault()}>
                Back to website →
              </a>
            </div>

            <div className="mediaHero">
              <h1 className="mediaHeadline">
                Create your <span>workspace</span>.
              </h1>
              <p className="mediaLead">
                One account for dataset tools, model evaluation, and real-time
                inference UI.
              </p>
            </div>

            <div className="deviceRow">
              <div className="deviceCard">
                <div className="deviceDot" />
                <div className="deviceMeta">
                  <b>Projects</b>
                  <span>Organize datasets, runs, and deployments</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="authFormWrap">
          <form className="authForm" onSubmit={onSubmit}>
            <h2 className="authTitle">Create an account</h2>
            <p className="authSubtitle">
              Already have an account? <Link to="/login">Log in</Link>
            </p>

            {/* Keep these fields for UI, but backend ignores them for now */}
            <div className="grid2">
              <div className="field">
                <label>First name</label>
                <input
                  value={first}
                  onChange={(e) => setFirst(e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div className="field">
                <label>Last name</label>
                <input
                  value={last}
                  onChange={(e) => setLast(e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="field">
              <label>Email / Username</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="text"
                autoComplete="username"
              />
            </div>

            <div className="field">
              <label>Password</label>
              <div className="inputRow">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="iconBtn"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <label className="checkRow">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span>
                I agree to the{" "}
                <a href="/" onClick={(e) => e.preventDefault()}>
                  Terms & Conditions
                </a>
              </span>
            </label>

            {error && (
              <div style={{ marginTop: 10, padding: 10, borderRadius: 10, background: "rgba(255,0,0,0.08)" }}>
                {error}
              </div>
            )}

            <button className="primaryBtn" type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create account"}
            </button>

            <div className="divider">or register with</div>

            <div className="socialRow">
              <button type="button" className="socialBtn" onClick={() => alert("Later")}>
                <span className="socialIcon">G</span> Google
              </button>
              <button type="button" className="socialBtn" onClick={() => alert("Later")}>
                <span className="socialIcon"></span> Apple
              </button>
            </div>

            <div className="footNote">
              We’ll never share your email.{" "}
              <a href="/" onClick={(e) => e.preventDefault()}>
                Learn more
              </a>
              .
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
