import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("you@example.com");
  const [password, setPassword] = useState("password");
  const [showPw, setShowPw] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: hook API later
    nav("/dashboard");
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

              <a
                className="ghostPill"
                href="/"
                onClick={(e) => e.preventDefault()}
              >
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
              <label>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
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
              <a
                className="tinyLink"
                href="/"
                onClick={(e) => e.preventDefault()}
              >
                Forgot password?
              </a>
            </div>

            <button className="primaryBtn" type="submit">
              Sign in
            </button>

            <div className="divider">or</div>

            <div className="socialRow">
              <button
                type="button"
                className="socialBtn"
                onClick={() => alert("Later")}
              >
                <span className="socialIcon">G</span> Continue with Google
              </button>
              <button
                type="button"
                className="socialBtn"
                onClick={() => alert("Later")}
              >
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
