import "../styles/landing.css";

const DOCS_URL = "https://docs.google.com/document/d/1mpQBmjX3Olswji-g4TvGfoAXSoj2nCY8/edit?usp=sharing&ouid=102566180684021942800&rtpof=true&sd=true"; // replace with your docs later
const GITHUB_URL = "https://github.com/shamratneero/BanglaSign"; // replace if needed
const PAPER_URL = "/assets/paper.pdf"; // put your pdf in: frontend/public/assets/paper.pdf

export default function Landing() {
  return (
    <div className="lp">
      {/* Background */}
      <div className="lpBg" />
      <div className="lpNoise" />

      {/* Top Nav */}
      <header className="lpNav">
        <div className="lpNavInner">
          <div className="lpBrand">
            <div className="lpMark">T</div>
            <div>
              <div className="lpBrandName">Project Tango</div>
              <div className="lpBrandSub">Bangla Sign Language • Real-time Translation</div>
            </div>
          </div>

          <nav className="lpLinks">
            <a className="lpLink" href={DOCS_URL} target="_blank" rel="noreferrer">
              Documentation
            </a>
            <a className="lpLink" href="/infer">
              Live Demo
            </a>
            <a className="lpLink" href={GITHUB_URL} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a className="lpBtn" href={PAPER_URL} download>
              Download Paper
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="lpMain">
        <section className="lpHero">
          <div className="lpHeroInner">
            <div className="lpPill">
              <span className="lpDot" />
              Deployment-ready • Docker + Nginx • Secure API
            </div>

            <h1 className="lpH1">
              Real-time Bangla Sign Recognition,
              <span className="lpAccent"> built for deployment.</span>
            </h1>

            <p className="lpLead">
              Project Tango runs webcam inference in the browser, calls a secure backend, and returns top-k predictions
              with latency — backed by a Super Admin console for model registry, activation, and usage stats.
            </p>

            <div className="lpCtas">
              <a className="lpPrimary" href="/infer">
                Try Live Demo
              </a>
              <a className="lpSecondary" href={DOCS_URL} target="_blank" rel="noreferrer">
                Read Docs
              </a>
            </div>

            {/* Social proof row */}
            <div className="lpProof">
              <div className="lpProofLabel">Built with</div>
              <div className="lpLogoRow">
                <span className="lpLogo">React</span>
                <span className="lpLogo">Django</span>
                <span className="lpLogo">DRF</span>
                <span className="lpLogo">Nginx</span>
                <span className="lpLogo">Postgres</span>
                <span className="lpLogo">MediaPipe</span>
              </div>
            </div>
          </div>

          {/* Right preview card (mock screenshot area) */}
          <div className="lpPreview">
            <div className="lpPreviewCard">
              <div className="lpPreviewTop">
                <div className="lpWindowDots">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="lpPreviewTitle">Live Inference Preview</div>
              </div>

              <div className="lpPreviewBody">
                <div className="lpMetricGrid">
                  <div className="lpMetric">
                    <div className="lpMetricK">Latency</div>
                    <div className="lpMetricV">~45ms</div>
                  </div>
                  <div className="lpMetric">
                    <div className="lpMetricK">Top-1</div>
                    <div className="lpMetricV">98%</div>
                  </div>
                  <div className="lpMetric">
                    <div className="lpMetricK">FPS</div>
                    <div className="lpMetricV">24</div>
                  </div>
                </div>

                <div className="lpMiniList">
                  <div className="lpMiniRow">
                    <span className="lpBadge">1</span> আ <span className="lpMiniPct">0.98</span>
                  </div>
                  <div className="lpMiniRow">
                    <span className="lpBadge ghost">2</span> ই <span className="lpMiniPct">0.12</span>
                  </div>
                  <div className="lpMiniRow">
                    <span className="lpBadge ghost">3</span> উ <span className="lpMiniPct">0.08</span>
                  </div>
                </div>

                <div className="lpPreviewHint">
                  This is a UI mock — your real /infer page stays unchanged.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Features */}
        <section className="lpSection">
          <div className="lpSectionHead">
            <h2 className="lpH2">Everything you need to learn and translate Bangla Fingerspelling!</h2>
            <p className="lpSub">
              Not a notebook demo — a deployable system: model registry, secure auth, gateway routing, and real-time UX.
            </p>
          </div>

          <div className="lpGrid">
            <div className="lpCard big">
              <h3>Real-time inference</h3>
              <p>Webcam → ROI → API → top-k predictions + latency and confidence overlays.</p>
              <div className="lpTagRow">
                <span className="lpTag">Top-3</span>
                <span className="lpTag">FPS</span>
                <span className="lpTag">Latency</span>
              </div>
            </div>

            <div className="lpCard">
              <h3>Model registry</h3>
              <p>Upload .pth, enable/disable models, select a single active model for production.</p>
            </div>

            <div className="lpCard">
              <h3>Admin console</h3>
              <p>Production-oriented controls for model ops + system overview metrics.</p>
            </div>

            <div className="lpCard">
              <h3>Gateway routing</h3>
              <p>Nginx reverse proxy handling SPA + API with upload limits and timeouts.</p>
            </div>

            <div className="lpCard">
              <h3>Secure auth</h3>
              <p>Cookie-JWT flows for public users + separate admin authentication.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="lpFooter">
          <div className="lpFooterInner">
            <div className="lpFootLeft">
              <div className="lpFootTitle">Project Tango</div>
              <div className="lpFootSub">Bangla Sign Language • Real-time Translation</div>
            </div>
            <div className="lpFootLinks">
              <a href="/login">Live Demo</a>
              <a href="/login">Login</a>
              <a href="/register">Register</a>
              
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
