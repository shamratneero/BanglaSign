#!/usr/bin/env bash
set -euo pipefail

FRONTEND_DIR="/Users/shamratneero/Desktop/tango/project-tango/frontend"
cd "$FRONTEND_DIR"

echo "== Project Tango: Applying Auth Design B =="

# ---- 1) Ensure folders ----
mkdir -p src/pages src/styles public/auth

# ---- 2) Copy hero image (safe for docker/prod) ----
# Try common paths; you can also pass your own path as first arg.
IMG_SRC="${1:-}"
if [[ -z "$IMG_SRC" ]]; then
  CANDIDATES=(
    "/Users/shamratneero/Downloads/pexels-moktader-billah-3562307-20754865.jpg"
    "/Users/shamratneero/Downloads/hero.jpg"
    "/Users/shamratneero/Downloads/auth.jpg"
  )
  for c in "${CANDIDATES[@]}"; do
    if [[ -f "$c" ]]; then IMG_SRC="$c"; break; fi
  done
fi

if [[ -n "${IMG_SRC}" && -f "${IMG_SRC}" ]]; then
  cp "${IMG_SRC}" public/auth/hero.jpg
  echo "✅ Copied hero image -> public/auth/hero.jpg"
else
  echo "⚠️ Could not find hero image automatically."
  echo "   You can re-run with an explicit path:"
  echo "   ./apply_auth_B.sh \"/full/path/to/your/image.jpg\""
fi

# ---- 3) Backup existing files (if present) ----
backup() {
  local f="$1"
  if [[ -f "$f" ]]; then
    cp "$f" "${f}.bak.$(date +%Y%m%d_%H%M%S)"
    echo "🗂️  Backup created: ${f}.bak.*"
  fi
}
backup "src/styles/auth.css"
backup "src/pages/Login.tsx"
backup "src/pages/Register.tsx"

# ---- 4) Write Version B auth.css ----
cat > src/styles/auth.css <<'CSS'
/* ========== Global base ========== */
* { box-sizing: border-box; }
html, body { height: 100%; }

.authPage{
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:32px 16px;

  background:
    radial-gradient(900px 600px at 20% 15%, rgba(140,120,255,.22), transparent 60%),
    radial-gradient(700px 500px at 80% 25%, rgba(130,220,255,.18), transparent 55%),
    radial-gradient(900px 700px at 50% 100%, rgba(70,90,255,.16), transparent 60%),
    #0b0f1a;

  color:#e9ecf3;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
}

/* ========== Shell ========== */
.authShell{
  width:min(1120px, 100%);
  display:grid;
  grid-template-columns: 1.1fr 1fr;
  border-radius:24px;
  overflow:hidden;

  background: rgba(18, 22, 36, .52);
  border: 1px solid rgba(255,255,255,.10);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  box-shadow:
    0 24px 80px rgba(0,0,0,.55),
    inset 0 1px 0 rgba(255,255,255,.06);
}

/* ========== Left (Payoneer vibe: big headline + device mock) ========== */
.authMedia{
  position:relative;
  min-height:620px;
  padding:26px;

  background:
    linear-gradient(180deg, rgba(120,92,255,.28), rgba(10,12,20,.62)),
    url(/auth/hero.jpg);
  background-size:cover;
  background-position:center;
}

.authMedia::after{
  content:"";
  position:absolute;
  inset:0;
  background:
    radial-gradient(900px 600px at 20% 10%, rgba(255,255,255,.10), transparent 60%),
    linear-gradient(180deg, rgba(8,10,18,.18), rgba(8,10,18,.78));
  pointer-events:none;
}

.authMediaInner{
  position:relative;
  z-index:1;
  height:100%;
  display:flex;
  flex-direction:column;
  gap:18px;
}

.authMediaTop{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}

.brandRow{
  display:flex;
  align-items:center;
  gap:10px;
}

.brandBadge{
  width:38px;
  height:38px;
  border-radius:12px;
  display:grid;
  place-items:center;
  font-weight:800;
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.14);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.brandText{
  line-height:1.05;
}
.brandText b{ display:block; font-size:14px; }
.brandText span{ display:block; font-size:12px; opacity:.82; margin-top:2px; }

.ghostPill{
  display:inline-flex;
  align-items:center;
  gap:8px;
  font-size:13px;
  color:#e9ecf3;
  text-decoration:none;
  padding:10px 12px;
  border-radius:999px;
  background: rgba(255,255,255,.10);
  border: 1px solid rgba(255,255,255,.14);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.mediaHero{
  margin-top:10px;
  max-width:520px;
}

.mediaHeadline{
  font-size:56px;
  letter-spacing:-0.04em;
  line-height:1.03;
  margin:0;
}

.mediaHeadline span{
  color: rgba(210,220,255,.95);
}

.mediaLead{
  margin-top:14px;
  font-size:14px;
  opacity:.85;
  max-width:420px;
  line-height:1.55;
}

.deviceRow{
  margin-top:auto;
  display:flex;
  gap:18px;
  align-items:flex-end;
  flex-wrap:wrap;
}

/* fake device mock */
.deviceMock{
  width:220px;
  height:360px;
  border-radius:28px;
  position:relative;
  background: rgba(255,255,255,.10);
  border: 1px solid rgba(255,255,255,.14);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 24px 60px rgba(0,0,0,.45);
  overflow:hidden;
}

.deviceMock::before{
  content:"";
  position:absolute;
  inset:10px;
  border-radius:22px;
  background:
    radial-gradient(240px 240px at 30% 20%, rgba(140,120,255,.35), transparent 60%),
    radial-gradient(220px 220px at 70% 80%, rgba(120,220,255,.22), transparent 55%),
    rgba(10,12,20,.55);
  border: 1px solid rgba(255,255,255,.10);
}

.deviceNotch{
  position:absolute;
  top:12px;
  left:50%;
  transform:translateX(-50%);
  width:92px;
  height:22px;
  border-radius:14px;
  background: rgba(0,0,0,.42);
  border: 1px solid rgba(255,255,255,.10);
}

.deviceCard{
  position:absolute;
  left:18px;
  right:18px;
  bottom:18px;
  padding:14px;
  border-radius:18px;
  background: rgba(255,255,255,.10);
  border: 1px solid rgba(255,255,255,.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.deviceCard b{ display:block; font-size:13px; }
.deviceCard span{ display:block; font-size:12px; opacity:.8; margin-top:4px; }

.mediaMiniStats{
  display:flex;
  flex-direction:column;
  gap:10px;
  max-width:260px;
}

.statPill{
  padding:12px 14px;
  border-radius:14px;
  background: rgba(255,255,255,.10);
  border: 1px solid rgba(255,255,255,.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-size:12px;
  opacity:.92;
}

/* ========== Right (AMU vibe: clean glass form) ========== */
.authFormWrap{
  padding:52px 50px;
  display:flex;
  align-items:center;
  justify-content:center;
  background: rgba(255,255,255,.02);
}

.authForm{
  width:min(420px, 100%);
}

.authTitle{
  font-size:44px;
  letter-spacing:-0.03em;
  margin:0 0 8px;
}

.authSubtitle{
  margin:0 0 22px;
  font-size:14px;
  opacity:.82;
}

.authSubtitle a{
  color:#b9a9ff;
  text-decoration:underline;
  text-underline-offset:3px;
}

.field{
  margin:12px 0;
}

.field label{
  display:block;
  font-size:12px;
  opacity:.82;
  margin:0 0 8px;
}

.field input{
  width:100%;
  height:46px;
  border-radius:12px;
  border:1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06);
  color:#e9ecf3;
  padding:0 14px;
  outline:none;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
}

.field input::placeholder{ color: rgba(233,236,243,.45); }

.field input:focus{
  border-color: rgba(170,150,255,.55);
  box-shadow: 0 0 0 3px rgba(170,150,255,.16);
}

.grid2{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap:12px;
}

.inputRow{
  display:flex;
  align-items:center;
  gap:10px;
}

.inputRow input{ flex:1; }

.iconBtn{
  width:46px;
  height:46px;
  flex: 0 0 46px;
  border-radius:12px;
  border:1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06);
  color:#e9ecf3;
  cursor:pointer;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.rowBetween{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin:8px 0 14px;
}

.tinyLink{
  font-size:12px;
  color:#e9ecf3;
  opacity:.85;
  text-decoration:none;
}
.tinyLink:hover{ text-decoration:underline; }

.checkRow{
  display:flex;
  align-items:flex-start;
  gap:10px;
  margin:14px 0 18px;
  font-size:12px;
  opacity:.9;
}
.checkRow input{ margin-top:2px; }

.checkRow a{
  color:#b9a9ff;
  text-decoration:underline;
  text-underline-offset:3px;
}

.primaryBtn{
  width:100%;
  height:48px;
  border:none;
  border-radius:14px;
  background: linear-gradient(90deg, rgba(133,102,255,.95), rgba(110,160,255,.95));
  color:white;
  font-weight:700;
  cursor:pointer;
  box-shadow:
    0 18px 50px rgba(110,160,255,.18),
    inset 0 1px 0 rgba(255,255,255,.18);
}
.primaryBtn:hover{ filter: brightness(1.03); }
.primaryBtn:active{ transform: translateY(1px); }

.divider{
  display:flex;
  align-items:center;
  gap:12px;
  margin:18px 0 14px;
  opacity:.7;
  font-size:12px;
}
.divider::before,
.divider::after{
  content:"";
  height:1px;
  flex:1;
  background: rgba(255,255,255,.12);
}

.socialRow{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap:12px;
}

.socialBtn{
  height:44px;
  border-radius:14px;
  border:1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.04);
  color:#e9ecf3;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:10px;
  font-weight:700;
}

.socialIcon{
  width:22px;
  height:22px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  border-radius:8px;
  background: rgba(255,255,255,.10);
}

.footNote{
  margin-top:18px;
  font-size:11px;
  opacity:.72;
  text-align:center;
}
.footNote a{
  color:#b9a9ff;
  text-decoration:underline;
  text-underline-offset:3px;
}

/* ========== Responsive ========== */
@media (max-width: 980px){
  .authShell{ grid-template-columns: 1fr; }
  .authMedia{ min-height:420px; }
  .authFormWrap{ padding:30px 18px; }
  .authTitle{ font-size:36px; }
  .mediaHeadline{ font-size:44px; }
}

@media (max-width: 520px){
  .grid2{ grid-template-columns: 1fr; }
  .socialRow{ grid-template-columns: 1fr; }
  .deviceRow{ gap:12px; }
  .deviceMock{ width:200px; height:330px; }
}
CSS

# ---- 5) Write Version B Login/Register pages ----
cat > src/pages/Login.tsx <<'TSX'
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

              <a className="ghostPill" href="/" onClick={(e) => e.preventDefault()}>
                Back to website →
              </a>
            </div>

            <div className="mediaHero">
              <h1 className="mediaHeadline">
                Build your <span>real-time</span> translation.
              </h1>
              <p className="mediaLead">
                Train, test, and deploy your Bangla Sign Language models with a clean workflow.
                Sign in to continue.
              </p>
            </div>

            <div className="deviceRow">
              <div className="deviceMock" aria-hidden="true">
                <div className="deviceNotch" />
                <div className="deviceCard">
                  <b>Live Preview</b>
                  <span>ROI • FPS • Top-3 predictions</span>
                </div>
              </div>

              <div className="mediaMiniStats">
                <div className="statPill">✅ Cookie-JWT auth behind Nginx gateway</div>
                <div className="statPill">⚡ Vite + React frontend, Docker build ready</div>
                <div className="statPill">🧠 Model switcher + spell correction coming next</div>
              </div>
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
              <a className="tinyLink" href="/" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </div>

            <button className="primaryBtn" type="submit">
              Sign in
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
              By continuing you agree to our <a href="/" onClick={(e) => e.preventDefault()}>Terms</a> &{" "}
              <a href="/" onClick={(e) => e.preventDefault()}>Privacy</a>.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
TSX

cat > src/pages/Register.tsx <<'TSX'
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

export default function Register() {
  const nav = useNavigate();
  const [first, setFirst] = useState("Shamrat");
  const [last, setLast] = useState("Neero");
  const [email, setEmail] = useState("you@example.com");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(true);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) return alert("Please accept Terms & Conditions");
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

              <a className="ghostPill" href="/" onClick={(e) => e.preventDefault()}>
                Back to website →
              </a>
            </div>

            <div className="mediaHero">
              <h1 className="mediaHeadline">
                Create your <span>workspace</span>.
              </h1>
              <p className="mediaLead">
                One account for dataset tools, model evaluation, and real-time inference UI.
              </p>
            </div>

            <div className="deviceRow">
              <div className="deviceMock" aria-hidden="true">
                <div className="deviceNotch" />
                <div className="deviceCard">
                  <b>Projects</b>
                  <span>Models • Reports • Deploy</span>
                </div>
              </div>

              <div className="mediaMiniStats">
                <div className="statPill">🔒 Secure auth foundation already wired</div>
                <div className="statPill">📦 Docker builds + gateway routing stable</div>
                <div className="statPill">🎛️ Dropdown model selection coming next</div>
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

            <div className="grid2">
              <div className="field">
                <label>First name</label>
                <input value={first} onChange={(e) => setFirst(e.target.value)} placeholder="First name" />
              </div>
              <div className="field">
                <label>Last name</label>
                <input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Last name" />
              </div>
            </div>

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
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>
                I agree to the <a href="/" onClick={(e) => e.preventDefault()}>Terms & Conditions</a>
              </span>
            </label>

            <button className="primaryBtn" type="submit">
              Create account
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
              We’ll never share your email. <a href="/" onClick={(e) => e.preventDefault()}>Learn more</a>.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
TSX

echo "✅ Wrote: src/styles/auth.css"
echo "✅ Wrote: src/pages/Login.tsx"
echo "✅ Wrote: src/pages/Register.tsx"

# ---- 6) Ensure correct CSS imports (in case something else existed) ----
# (Already in our templates, so nothing else needed.)

echo ""
echo "Next:"
echo "  1) cd $FRONTEND_DIR"
echo "  2) chmod +x apply_auth_B.sh"
echo "  3) ./apply_auth_B.sh   (or pass image path as arg)"
echo ""
echo "Then rebuild:"
echo "  cd /Users/shamratneero/Desktop/tango/project-tango"
echo "  docker compose up -d --build frontend gateway"
