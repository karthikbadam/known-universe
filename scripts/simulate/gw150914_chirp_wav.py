"""Render the GW150914 strain CSV to a 16-bit PCM WAV file.

The CSV is at 512 Hz; we linear-interpolate up to 48000 Hz so the
output plays via a standard HTMLAudioElement without any per-browser
Web Audio gymnastics. The chirp's 35–250 Hz frequency content is
preserved since the duration stays at ~0.45 s.

Run from repo root:
    python scripts/simulate/gw150914_chirp_wav.py
"""

from __future__ import annotations

import struct
import wave
from pathlib import Path

SRC_RATE = 512
DST_RATE = 48000
FADE_SEC = 0.015
GAIN = 0.9


def main() -> None:
    here = Path(__file__).resolve().parent
    csv_path = here.parent.parent / "public" / "data" / "gw150914_strain.csv"
    out_path = here.parent.parent / "public" / "data" / "gw150914_chirp.wav"

    strain: list[float] = []
    with csv_path.open("r", encoding="utf-8") as f:
        for line in f:
            s = line.strip()
            if not s or s.startswith("#") or s.startswith("t_s"):
                continue
            parts = s.split(",")
            try:
                v = float(parts[1])
            except (IndexError, ValueError):
                continue
            strain.append(v)

    if not strain:
        raise RuntimeError(f"No strain samples parsed from {csv_path}")

    peak = max(abs(v) for v in strain) or 1.0
    norm = [v * GAIN / peak for v in strain]

    duration = len(norm) / SRC_RATE
    n_dst = int(duration * DST_RATE)
    fade_samples = int(FADE_SEC * DST_RATE)

    dst = [0.0] * n_dst
    denom = (n_dst - 1) or 1
    last = len(norm) - 1
    for i in range(n_dst):
        t = (i / denom) * last
        lo = int(t)
        hi = min(lo + 1, last)
        frac = t - lo
        v = norm[lo] * (1 - frac) + norm[hi] * frac
        if i < fade_samples:
            v *= i / fade_samples
        elif i > n_dst - fade_samples:
            v *= (n_dst - i) / fade_samples
        dst[i] = v

    with wave.open(str(out_path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(DST_RATE)
        for v in dst:
            sample = int(max(-1.0, min(1.0, v)) * 32767)
            w.writeframes(struct.pack("<h", sample))

    size_kb = out_path.stat().st_size / 1024
    print(
        f"Wrote {out_path.relative_to(here.parent.parent)}: "
        f"{n_dst} samples @ {DST_RATE} Hz ({duration:.3f} s, {size_kb:.0f} KB)"
    )


if __name__ == "__main__":
    main()
