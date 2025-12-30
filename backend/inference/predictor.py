import json
import time
from pathlib import Path

import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import transforms
from torchvision.models import efficientnet_b0


# ---- file paths inside the container ----
# Your backend code lives in /app, and you placed files in backend/models/...
MODELS_DIR = Path("/app/models")
WEIGHTS_PATH = MODELS_DIR / "active.pth"
LABELS_PATH = MODELS_DIR / "idx_to_bangla.json"

# ---- device (keep CPU for now; stable for shipping) ----
DEVICE = torch.device("cpu")

# ---- transforms (exactly like your notebook) ----
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

_model = None
_idx_to_bangla = None
_num_classes = None


def _load_once():
    global _model, _idx_to_bangla, _num_classes

    if _model is not None and _idx_to_bangla is not None:
        return

    if not WEIGHTS_PATH.exists():
        raise FileNotFoundError(f"Missing model weights: {WEIGHTS_PATH}")
    if not LABELS_PATH.exists():
        raise FileNotFoundError(f"Missing label map: {LABELS_PATH}")

    with open(LABELS_PATH, "r", encoding="utf-8") as f:
        _idx_to_bangla = json.load(f)

    _num_classes = len(_idx_to_bangla)

    model = efficientnet_b0(weights=None)
    model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, _num_classes)

    ckpt = torch.load(str(WEIGHTS_PATH), map_location="cpu")
    state = ckpt["state_dict"] if isinstance(ckpt, dict) and "state_dict" in ckpt else ckpt
    model.load_state_dict(state, strict=True)

    model.to(DEVICE).eval()
    _model = model


def predict_pil(img: Image.Image):
    _load_once()

    t0 = time.perf_counter()

    x = transform(img.convert("RGB")).unsqueeze(0).to(DEVICE)

    with torch.inference_mode():
        logits = _model(x)
        probs = F.softmax(logits, dim=1)[0]  # [C]

        k = min(3, probs.shape[0])
        topv, topi = torch.topk(probs, k=k)

    top3 = []
    for conf, idx in zip(topv.tolist(), topi.tolist()):
        lab = _idx_to_bangla.get(str(idx), str(idx))
        top3.append((lab, float(conf)))

    latency_ms = int((time.perf_counter() - t0) * 1000)
    best_label, best_conf = top3[0]

    return {
        "label": best_label,
        "confidence": float(best_conf),
        "top3": [{"label": l, "confidence": c} for (l, c) in top3],
        "latency_ms": latency_ms,
    }
