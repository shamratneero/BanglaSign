#!/usr/bin/env bash
set -euo pipefail

FRONTEND_DIR="frontend"
ASSET_DIR="$FRONTEND_DIR/src/assets"
CSS_FILE="$FRONTEND_DIR/src/styles/auth.css"
TARGET_IMG="$ASSET_DIR/auth-bg.jpg"

IMG_SRC="${1:-$HOME/Downloads/pexels-moktader-billah-3562307-20754865.jpg}"

if [[ ! -d "$FRONTEND_DIR" ]]; then
  echo "❌ Can't find '$FRONTEND_DIR'. Run from project root (where docker-compose.yml is)."
  exit 1
fi

if [[ ! -f "$IMG_SRC" ]]; then
  echo "❌ Image not found: $IMG_SRC"
  echo "Usage: ./fix-auth-bg.sh /full/path/to/image.jpg"
  exit 1
fi

mkdir -p "$ASSET_DIR"
cp -f "$IMG_SRC" "$TARGET_IMG"
echo "✅ Copied image -> $TARGET_IMG"

if [[ ! -f "$CSS_FILE" ]]; then
  echo "❌ CSS not found: $CSS_FILE"
  exit 1
fi

python3 - <<'PY'
from pathlib import Path
import re

css_path = Path("frontend/src/styles/auth.css")
s = css_path.read_text(encoding="utf-8", errors="ignore")

# 1) Replace any existing url(...) with the correct path (Vite-safe)
if "url(" in s:
    s2 = re.sub(r'url\([^\)]*\)', 'url("../assets/auth-bg.jpg")', s)
    css_path.write_text(s2, encoding="utf-8")
    print('✅ Replaced existing url(...) with url("../assets/auth-bg.jpg")')
else:
    # 2) No url() found: inject into .authMedia background if possible
    # Find .authMedia { ... background: ...; }
    m = re.search(r'\.authMedia\s*\{.*?\}', s, flags=re.S)
    if not m:
        raise SystemExit("❌ No .authMedia block found at all. Check your class name in CSS.")
    block = m.group(0)
    if "background" in block:
        # add image layer at end of background
        block2 = re.sub(
            r'(background\s*:\s*)([^;]+);',
            r'\1\2,\n      url("../assets/auth-bg.jpg");',
            block,
            count=1,
            flags=re.S
        )
    else:
        # no background property: add one
        block2 = block[:-1] + '\n  background: url("../assets/auth-bg.jpg");\n}'
    s2 = s[:m.start()] + block2 + s[m.end():]
    css_path.write_text(s2, encoding="utf-8")
    print('✅ Injected url("../assets/auth-bg.jpg") into .authMedia background')
PY

echo "🎉 Done. Now rebuild:"
echo "docker compose up -d --build frontend gateway"
