import { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";


type Top = { label: string; confidence: number };
type InferResp = {
  label: string;
  confidence: number;
  top3: Top[];
  latency_ms: number;
};

function fmtPct(x: number) {
  return `${Math.round(x * 100)}%`;
}

export default function InferDemo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [running, setRunning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [result, setResult] = useState<InferResp | null>(null);
  const [reqEveryMs, setReqEveryMs] = useState(500);
  const [jpegQuality, setJpegQuality] = useState(0.75);
  const [renderFps, setRenderFps] = useState(0);
  const handRef = useRef<HandLandmarker | null>(null);
  const [roiReady, setRoiReady] = useState(false);

  const fullCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const roiCanvasRef = useRef<HTMLCanvasElement | null>(null);



  // ===== Styles (mockup-like glass) =====
  const s: Record<string, any> = {
    page: {
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: 28,
      background:
        "radial-gradient(1200px 800px at 20% 0%, rgba(120,80,255,.30), transparent 55%)," +
        "radial-gradient(900px 700px at 90% 10%, rgba(70,180,255,.18), transparent 55%)," +
        "radial-gradient(900px 700px at 70% 95%, rgba(255,80,200,.18), transparent 60%)," +
        "#070817",
      color: "rgba(255,255,255,.92)",
      fontFamily:
        "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
    },
    shell: {
      width: "min(1180px, 100%)",
      borderRadius: 28,
      padding: 18,
      background:
        "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04))",
      border: "1px solid rgba(255,255,255,.14)",
      boxShadow: "0 40px 120px rgba(0,0,0,.55)",
      backdropFilter: "blur(18px)",
    },
    inner: {
      borderRadius: 24,
      padding: 16,
      background:
        "linear-gradient(180deg, rgba(20,14,60,.55), rgba(15,10,45,.45))",
      border: "1px solid rgba(255,255,255,.10)",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "1.55fr 1fr",
      gap: 16,
      alignItems: "start",
    },

    card: {
      borderRadius: 18,
      background:
        "linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.03))",
      border: "1px solid rgba(255,255,255,.12)",
      boxShadow: "0 18px 60px rgba(0,0,0,.35)",
      overflow: "hidden",
    },
    cardHead: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 14px",
      borderBottom: "1px solid rgba(255,255,255,.10)",
      background:
        "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02))",
    },
    headTitle: { fontSize: 18, fontWeight: 800, letterSpacing: 0.2 },
    headSub: { opacity: 0.7, fontWeight: 700, marginLeft: 8 },

    pill: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 10px",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,.14)",
      background: "rgba(255,255,255,.06)",
      backdropFilter: "blur(10px)",
      fontSize: 13,
      opacity: 0.95,
      whiteSpace: "nowrap",
    },

    // Camera section
    camBody: { padding: 12 },
    camFrame: {
      borderRadius: 16,
      padding: 8,
      background: "rgba(255,255,255,.05)",
      border: "1px solid rgba(255,255,255,.10)",
    },
    video: {
      width: "100%",
      display: "block",
      borderRadius: 12,
      background: "transparent",
    },

    camFooter: {
      display: "flex",
      gap: 10,
      marginTop: 12,
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
    },
    actionsLeft: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
    actionsRight: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },

    btn: {
      padding: "10px 14px",
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,.14)",
      background: "rgba(255,255,255,.06)",
      color: "rgba(255,255,255,.92)",
      cursor: "pointer",
      backdropFilter: "blur(10px)",
    },
    btnPrimary: {
      background:
        "linear-gradient(180deg, rgba(120,80,255,.35), rgba(120,80,255,.18))",
      border: "1px solid rgba(160,130,255,.35)",
    },

    // Right stack
    rightStack: { display: "grid", gap: 16 },

    // Prediction card
    predBody: { padding: 14 },
    predRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginTop: 8,
    },
    bigLetter: {
      fontSize: 56,
      fontWeight: 900,
      lineHeight: 1,
      letterSpacing: 1,
    },
    modelSelect: {
      padding: "8px 12px",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,.12)",
      background: "rgba(255,255,255,.06)",
      color: "rgba(255,255,255,.92)",
      backdropFilter: "blur(10px)",
      outline: "none",
      fontWeight: 800,
    },

    miniTabs: {
      display: "flex",
      gap: 10,
      padding: 6,
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,.12)",
      background: "rgba(255,255,255,.05)",
      marginTop: 12,
    },
    tab: {
      padding: "8px 12px",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,.10)",
      background: "rgba(255,255,255,.04)",
      opacity: 0.85,
      fontWeight: 800,
      fontSize: 13,
    },
    tabActive: {
      background:
        "linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.06))",
      opacity: 1,
    },

    metricRow: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      marginTop: 12,
      opacity: 0.9,
    },
    metric: {
      padding: "8px 10px",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,.12)",
      background: "rgba(255,255,255,.04)",
      fontSize: 13,
      whiteSpace: "nowrap",
    },

    // Top-3 bars
    bars: { marginTop: 14, display: "grid", gap: 10 },
    barRow: {
      display: "grid",
      gridTemplateColumns: "26px 1fr",
      gap: 10,
      alignItems: "center",
    },
    barLabel: { fontWeight: 900, opacity: 0.92 },
    barTrack: {
      height: 12,
      borderRadius: 999,
      background: "rgba(255,255,255,.06)",
      border: "1px solid rgba(255,255,255,.10)",
      overflow: "hidden",
    },
    barFill: {
      height: "100%",
      borderRadius: 999,
      background:
        "linear-gradient(90deg, rgba(120,80,255,.85), rgba(255,80,200,.75))",
    },

    // Buffer/history (left bottom)
    histBody: { padding: 14 },
    histTitle: { fontWeight: 900, marginBottom: 10, fontSize: 16 },
    histItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 12px",
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,.10)",
      background: "rgba(255,255,255,.04)",
      marginBottom: 8,
    },
    small: { opacity: 0.7, fontSize: 13 },

    // Options card (right bottom)
    optBody: { padding: 14 },
    optTitle: { fontWeight: 900, marginBottom: 10, fontSize: 16 },
    optRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 0",
      borderBottom: "1px solid rgba(255,255,255,.08)",
    },
    optRowLast: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 0",
    },
    optLabel: { opacity: 0.92, fontWeight: 800 },
    optSub: { opacity: 0.65, fontWeight: 700, marginLeft: 6 },
    slider: { width: 170 },
    toggle: {
      width: 46,
      height: 26,
      borderRadius: 999,
      background: "rgba(255,255,255,.10)",
      border: "1px solid rgba(255,255,255,.14)",
      position: "relative",
    },
    knob: (on: boolean) => ({
      width: 20,
      height: 20,
      borderRadius: 999,
      position: "absolute" as const,
      top: 2,
      left: on ? 24 : 2,
      background: on
        ? "linear-gradient(180deg, rgba(0,220,180,.9), rgba(0,220,180,.45))"
        : "rgba(255,255,255,.55)",
      boxShadow: "0 6px 16px rgba(0,0,0,.35)",
      transition: "left .15s ease",
    }),

    errorBox: {
      marginBottom: 12,
      padding: 12,
      borderRadius: 16,
      border: "1px solid rgba(255,107,107,.55)",
      background: "rgba(255,107,107,.10)",
    },
  };

  // FPS counter (UI-only)
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let frames = 0;

    const tick = (t: number) => {
      frames++;
      if (t - last >= 1000) {
        setRenderFps(frames);
        frames = 0;
        last = t;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    let cancelled = false;
  
    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
  
        const hand = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
  
        if (!cancelled) {
          handRef.current = hand;
          setRoiReady(true);
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "MediaPipe init failed");
      }
    })();
  
    return () => {
      cancelled = true;
    };
  }, []);
  

  async function startCam() {
    setErr(null);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });

    const v = videoRef.current!;
    v.srcObject = stream;
    await v.play();
  }

  function stopCam() {
    const v = videoRef.current;
    const stream = v?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (v) v.srcObject = null;
  }

  async function sendFrameOnce() {
    const v = videoRef.current;
    if (!v) return;
  
    const hand = handRef.current;
    if (!hand) return; // ROI not ready yet
  
    // Create offscreen canvases once
    if (!fullCanvasRef.current) fullCanvasRef.current = document.createElement("canvas");
    if (!roiCanvasRef.current) roiCanvasRef.current = document.createElement("canvas");
  
    const fullC = fullCanvasRef.current!;
    const roiC = roiCanvasRef.current!;
    const fullCtx = fullC.getContext("2d");
    const roiCtx = roiC.getContext("2d");
    if (!fullCtx || !roiCtx) return;
  
    const W = v.videoWidth || 1280;
    const H = v.videoHeight || 720;
  
    // Draw full frame at native res for accurate landmark -> pixel mapping
    fullC.width = W;
    fullC.height = H;
    fullCtx.drawImage(v, 0, 0, W, H);
  
    // Detect landmarks on this frame
    const now = performance.now();
    const res = hand.detectForVideo(fullC, now);
  
    const landmarks = res?.landmarks?.[0];
    if (!landmarks || landmarks.length === 0) {
      return; // no hand -> don't send (your model needs ROI)
    }
  
    // Compute bbox from landmarks (like your python)
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const lm of landmarks) {
      const x = lm.x * W;
      const y = lm.y * H;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  
    const boxW = Math.max(1, maxX - minX);
    const boxH = Math.max(1, maxY - minY);
  
    // Padding (tune if needed)
    const pad = 0.35;
    let x1 = minX - boxW * pad;
    let y1 = minY - boxH * pad;
    let x2 = maxX + boxW * pad;
    let y2 = maxY + boxH * pad;
  
    // Clamp to frame
    x1 = Math.max(0, Math.floor(x1));
    y1 = Math.max(0, Math.floor(y1));
    x2 = Math.min(W - 1, Math.ceil(x2));
    y2 = Math.min(H - 1, Math.ceil(y2));
  
    const cropW = Math.max(1, x2 - x1);
    const cropH = Math.max(1, y2 - y1);
  
    // Resize ROI to model input size (IMPORTANT)
    const OUT = 128; // change to 128 if your backend model expects 128
    roiC.width = OUT;
    roiC.height = OUT;
  
    roiCtx.clearRect(0, 0, OUT, OUT);
    roiCtx.drawImage(fullC, x1, y1, cropW, cropH, 0, 0, OUT, OUT);
  
    // Encode ROI -> JPEG
    const blob: Blob = await new Promise((resolve, reject) => {
      roiC.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("ROI toBlob failed"))),
        "image/jpeg",
        jpegQuality
      );
    });
  
    const form = new FormData();
    form.append("image", blob, "roi.jpg");
  
    setBusy(true);
    setErr(null);
    try {
      const res2 = await fetch("/api/infer", {
        method: "POST",
        body: form,
        credentials: "include",
      });
  
      if (!res2.ok) {
        const txt = await res2.text().catch(() => "");
        throw new Error(`HTTP ${res2.status} ${txt}`);
      }
      const data = (await res2.json()) as InferResp;
      setResult(data);
    } catch (e: any) {
      setErr(e?.message ?? "Unknown error");
      setRunning(false);
    } finally {
      setBusy(false);
    }
  }
  

  // Main loop
  useEffect(() => {
    if (!running) return;

    let cancelled = false;
    let t: any = null;

    const loop = async () => {
      if (cancelled) return;
      if (!busy) {
        await sendFrameOnce();
      }
      t = setTimeout(loop, reqEveryMs);
    };

    loop();
    return () => {
      cancelled = true;
      if (t) clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, reqEveryMs, jpegQuality, busy]);

  useEffect(() => {
    startCam().catch((e) => setErr(e?.message ?? "Camera error"));
    return () => {
      setRunning(false);
      stopCam();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const top3 = result?.top3 ?? [];
  const top1 = top3[0]?.confidence ?? result?.confidence ?? 0;
  const top2 = top3[1]?.confidence ?? 0;
  const top3c = top3[2]?.confidence ?? 0;

  // Local UI-only toggles (mockup look; no logic changes)
  const [twoHandMode, setTwoHandMode] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div style={s.page}>
      <div style={s.shell}>
        <div style={s.inner}>
          {err && (
            <div style={s.errorBox}>
              <b>Error:</b> {err}
            </div>
          )}

          <div style={s.grid}>
            {/* LEFT COLUMN */}
            <div style={s.rightStack}>
              {/* CAMERA CARD */}
              <div style={s.card}>
                <div style={s.cardHead}>
                  <div>
                    <span style={s.headTitle}>Camera</span>
                    <span style={s.headSub}>{running ? "ON" : "OFF"}</span>
                  </div>
                  <div style={s.pill}>
                    <span style={{ opacity: 0.85 }}>⚡</span>
                    <span>{result ? `${result.latency_ms}ms` : "—"}</span>
                    <span style={{ opacity: 0.65 }}>·</span>
                    <span>{busy ? "sending…" : "idle"}</span>
                  </div>
                </div>

                <div style={s.pill}>
                    ROI: <b style={{ marginLeft: 6 }}>{roiReady ? "Ready" : "Loading…"}</b>
                </div>

                <div style={s.camBody}>
                  <div style={s.camFrame}>
                    <video ref={videoRef} style={s.video} playsInline muted />
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                  </div>

                  <div style={s.camFooter}>
                    <div style={s.actionsLeft}>
                      <button
                        onClick={() => setRunning((x) => !x)}
                        style={{ ...s.btn, ...(running ? s.btnPrimary : {}) }}
                      >
                        {running ? "Stop" : "Start"}
                      </button>
                      <button style={s.btn} onClick={() => { /* optional: later */ }}>
                        Switch Camera
                      </button>
                    </div>

                    <div style={s.actionsRight}>
                      <div style={s.pill}>UI FPS: {renderFps}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* TODAY / HISTORY CARD (visual only for now) */}
              <div style={s.card}>
                <div style={s.cardHead}>
                  <div style={s.headTitle}>Today</div>
                  <div style={s.pill}>
                    <span style={{ opacity: 0.7 }}>Buffer</span>
                    <b style={{ marginLeft: 6 }}>{result?.label ?? "—"}</b>
                  </div>
                </div>

                <div style={s.histBody}>
                  <div style={s.histItem}>
                    <div>
                      <b style={{ letterSpacing: 0.5 }}>{result?.label ?? "—"}</b>
                      <span style={{ marginLeft: 10, opacity: 0.7 }}>
                        {result ? fmtPct(result.confidence) : "—"}
                      </span>
                    </div>
                    <span style={s.small}>Now</span>
                  </div>

                  <div style={s.histItem}>
                    <span style={s.small}>9:30 AM</span>
                    <span style={{ opacity: 0.85 }}>—</span>
                  </div>

                  <div style={s.histItem}>

                    <span style={s.small}>9:12 AM</span>
                    <span style={{ opacity: 0.85 }}>—</span>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                    <button style={s.btn}>Backspace</button>
                    <button style={s.btn}>Clear Buffer</button>
                    <button style={s.btnPrimary}>Finalize</button>
                    <button style={s.btn}>Finish</button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={s.rightStack}>
              {/* PREDICTION CARD */}
              <div style={s.card}>
                <div style={s.cardHead}>
                  <div style={s.headTitle}>Prediction</div>

                  {/* UI-only model selector (wire to real model later) */}
                  <select style={s.modelSelect} defaultValue="effnet">
                    <option value="effnet">EfficientNet</option>
                    <option value="resnet">ResNet18</option>
                    <option value="mlp">MLP</option>
                  </select>
                </div>

                <div style={s.predBody}>
                  <div style={s.predRow}>
                    <div style={s.bigLetter}>{result?.label ?? "—"}</div>

                    <div style={s.miniTabs}>
                      <div style={{ ...s.tab, ...s.tabActive }}>ResNet18</div>
                      <div style={s.tab}>MLP</div>
                    </div>
                  </div>

                  <div style={s.metricRow}>
                    <div style={s.metric}>
                      Confidence: <b>{result ? fmtPct(result.confidence) : "—"}</b>
                    </div>
                    <div style={s.metric}>
                      Latency: <b>{result ? `${result.latency_ms} ms` : "—"}</b>
                    </div>
                    <div style={s.metric}>
                      Interval: <b>{reqEveryMs} ms</b>
                    </div>
                  </div>

                  {/* visual Top-3 bars */}
                  <div style={s.bars}>
                    <div style={s.barRow}>
                      <div style={s.barLabel}>{top3[0]?.label ?? "1"}</div>
                      <div style={s.barTrack}>
                        <div style={{ ...s.barFill, width: `${Math.max(0, Math.min(100, top1 * 100))}%` }} />
                      </div>
                    </div>
                    <div style={s.barRow}>
                      <div style={s.barLabel}>{top3[1]?.label ?? "2"}</div>
                      <div style={s.barTrack}>
                        <div style={{ ...s.barFill, width: `${Math.max(0, Math.min(100, top2 * 100))}%`, opacity: 0.75 }} />
                      </div>
                    </div>
                    <div style={s.barRow}>
                      <div style={s.barLabel}>{top3[2]?.label ?? "3"}</div>
                      <div style={s.barTrack}>
                        <div style={{ ...s.barFill, width: `${Math.max(0, Math.min(100, top3c * 100))}%`, opacity: 0.55 }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* OPTIONS CARD */}
              <div style={s.card}>
                <div style={s.cardHead}>
                  <div style={s.headTitle}>Options</div>
                  <div style={s.pill}>▾</div>
                </div>

                <div style={s.optBody}>
                  <div style={s.optRow}>
                    <div>
                      <span style={s.optLabel}>Confidence</span>
                      <span style={s.optSub}>Threshold</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={95}
                      defaultValue={63}
                      style={s.slider}
                      onChange={() => {}}
                    />
                  </div>

                  <div style={s.optRow}>
                    <div>
                      <span style={s.optLabel}>Prediction</span>
                      <span style={s.optSub}>Speed</span>
                    </div>
                    <input
                      type="range"
                      min={150}
                      max={1200}
                      value={reqEveryMs}
                      style={s.slider}
                      onChange={(e) => setReqEveryMs(Number(e.target.value))}
                    />
                  </div>

                  <div style={s.optRow}>
                    <div>
                      <span style={s.optLabel}>Two-Hand</span>
                      <span style={s.optSub}>Mode</span>
                    </div>
                    <div
                      style={s.toggle}
                      onClick={() => setTwoHandMode((x) => !x)}
                      role="button"
                      aria-label="Two-hand mode"
                    >
                      <div style={s.knob(twoHandMode)} />
                    </div>
                  </div>

                  <div style={s.optRowLast}>
                    <div>
                      <span style={s.optLabel}>Dark</span>
                      <span style={s.optSub}>mode</span>
                    </div>
                    <div
                      style={s.toggle}
                      onClick={() => setDarkMode((x) => !x)}
                      role="button"
                      aria-label="Dark mode"
                    >
                      <div style={s.knob(darkMode)} />
                    </div>
                  </div>

                  <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ ...s.metric, background: "rgba(255,255,255,.06)" }}>
                      JPEG:{" "}
                      <input
                        type="number"
                        min={0.3}
                        max={0.95}
                        step={0.05}
                        value={jpegQuality}
                        onChange={(e) => setJpegQuality(Number(e.target.value))}
                        style={{
                          width: 70,
                          marginLeft: 8,
                          padding: "6px 8px",
                          borderRadius: 10,
                          border: "1px solid rgba(255,255,255,.14)",
                          background: "rgba(255,255,255,.06)",
                          color: "rgba(255,255,255,.92)",
                          outline: "none",
                        }}
                      />
                    </div>
                    <div style={{ ...s.metric, background: "rgba(255,255,255,.06)" }}>
                      Sending: <b style={{ marginLeft: 6 }}>{busy ? "Yes" : "No"}</b>
                    </div>
                  </div>

                  <div style={{ marginTop: 12, opacity: 0.7, fontSize: 13 }}>
                    Tip: If latency is high, increase prediction speed (interval) or reduce JPEG quality.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12, opacity: 0.7, fontSize: 12 }}>
            V1 UI — ROI coming next. This screen is focused on layout + hierarchy first.
          </div>
        </div>
      </div>
    </div>
  );
}
