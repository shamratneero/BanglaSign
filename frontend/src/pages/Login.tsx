import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import { useAuth } from "../auth/useAuth";

export default function Login() {
  const nav = useNavigate();
  const { login, refreshMe } = useAuth();

  const [email, setEmail] = useState("you@example.com"); // used as username
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      await login(username, password);
      await refreshMe();
      nav("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Login failed");
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
                Build your <span>real-time</span> translation.
              </h1>
              <p className="mediaLead">
                Train, test, and deploy your Bangla Sign Language models with a
                clean workflow. Sign in to continue.
              </p>
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="authFormWrap">
          <form className="authForm" onSubmit={onSubmit}>
            <h2 className="authTitle">Sign in</h2>
            <p className="authSubtitle">
              Continue to your dashboard. Don’t have an account?{" "}
              <Link to="/register">Create one</Link>
            </p>

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
                  autoComplete="current-password"
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

            <div className="rowBetween">
              <span />
              <a className="tinyLink" href="/" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </div>

            {error && (
              <div style={{ marginTop: 10, padding: 10, borderRadius: 10, background: "rgba(255,0,0,0.08)" }}>
                {error}
              </div>
            )}

            <button className="primaryBtn" type="submit" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
            </button>

            <div className="divider">or</div>

            <div className="socialRow">
              <button type="button" className="socialBtn" onClick={() => alert("Later")}>
                <span className="socialIcon">G</span> Continue with Google
              </button>
              <button type="button" className="socialBtn" onClick={() => alert("Later")}>
                <span className="socialIcon">f</span> Continue with Facebook
              </button>
            </div>

            <div className="footNote">
              By continuing you agree to our{" "}
              <a href="/" onClick={(e) => e.preventDefault()}>
                Terms
              </a>{" "}
              &{" "}
              <a href="/" onClick={(e) => e.preventDefault()}>
                Privacy
              </a>
              .
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
