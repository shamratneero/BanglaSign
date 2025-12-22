#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

CSS="src/styles/auth.css"
LOGIN="src/pages/Login.tsx"
REGISTER="src/pages/Register.tsx"

if [[ ! -f "$CSS" ]]; then
  echo "❌ Missing $CSS"
  echo "Make sure you're inside the Vite frontend folder."
  exit 1
fi

# Backup
cp "$CSS" "$CSS.bak.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup created: $CSS.bak.*"

# Fix imports (./auth.css -> ../styles/auth.css)
for f in "$LOGIN" "$REGISTER"; do
  if [[ -f "$f" ]]; then
    perl -0777 -pi -e 's/import\s+["'\'']\.\/auth\.css["'\''];/import "..\/styles\/auth.css";/g' "$f"
    perl -0777 -pi -e 's/import\s+["'\'']\.\.\/\.\.\/styles\/auth\.css["'\''];/import "..\/styles\/auth.css";/g' "$f"
  fi
done
echo "✅ Updated CSS imports in Login/Register"

MARKER="/* === AUTO: Glass + Overlap Fix (Project Tango) === */"

if grep -qF "$MARKER" "$CSS"; then
  echo "ℹ️ Marker already exists in $CSS — skipping append."
  exit 0
fi

cat >> "$CSS" <<'CSS'

/* === AUTO: Glass + Overlap Fix (Project Tango) === */
/* Fix overlap in grid inputs (min-width issue) */
*,
*::before,
*::after { box-sizing: border-box; }

.grid2 > * { min-width: 0; }
.field { min-width: 0; }
.field input { width: 100%; }

/* Full glassmorphism shell */
.authShell{
  background: rgba(255,255,255,.06) !important;
  border: 1px solid rgba(255,255,255,.14) !important;
  backdrop-filter: blur(18px) !important;
  -webkit-backdrop-filter: blur(18px) !important;
  box-shadow:
    0 30px 90px rgba(0,0,0,.55),
    inset 0 1px 0 rgba(255,255,255,.10) !important;
  position: relative !important;
}

.authShell::before{
  content:"";
  position:absolute;
  inset:-1px;
  background:
    radial-gradient(900px 600px at 15% 15%, rgba(170,150,255,.22), transparent 55%),
    radial-gradient(800px 600px at 85% 25%, rgba(120,220,255,.16), transparent 55%);
  pointer-events:none;
  z-index:0;
}

.authMedia,
.authFormWrap{ position: relative; z-index: 1; }

/* Glass inputs */
.field input{
  background: rgba(255,255,255,.07) !important;
  border: 1px solid rgba(255,255,255,.14) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border-radius: 12px !important;
}

.field input:focus{
  border-color: rgba(170,150,255,.70) !important;
  box-shadow: 0 0 0 4px rgba(170,150,255,.18) !important;
}

/* Better responsive collapse for name fields */
@media (max-width: 740px){
  .grid2{ grid-template-columns: 1fr !important; }
}
CSS

echo "✅ Appended glass + overlap fixes to $CSS"
echo "👉 Now run: npm run dev (or docker compose rebuild if needed)"
