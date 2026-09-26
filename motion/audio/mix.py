"""
UI sounds, synthesised and laid onto the music.

cues.json is exported by the page itself (render.mjs), so every sound sits on the
exact time the motion uses. Each sound is placed by its MEASURED peak, not its
start: a whoosh that swells for 180 ms is shifted so its loudest moment lands
on the cue, and a click's transient lands on the frame the cursor goes down.

Pitched sounds are in F minor with the track.

    python3 mix.py        -> esquirely-pipeline.wav (music + UI, seamless loop)
"""
import json, pathlib
import numpy as np
from scipy.signal import butter, sosfilt
from compose import SR, N, LOOP, write_wav, hz, svf_lp

HERE = pathlib.Path(__file__).parent
rng = np.random.default_rng(11)


def t_(n):
    return np.arange(n) / SR


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], 'bandpass', fs=SR, output='sos'), x)


def click():
    n = int(0.05 * SR); t = t_(n)
    return bp(rng.standard_normal(n), 2000, 7000) * np.exp(-t / 0.0025) * 0.6 + np.sin(TAU * 1900 * t) * np.exp(-t / 0.008) * 0.35


def tick(m):
    n = int(0.12 * SR); t = t_(n)
    return np.sin(TAU * hz(m) * t) * np.exp(-t / 0.03) * 0.5 + bp(rng.standard_normal(n), 3000, 9000) * np.exp(-t / 0.002) * 0.25


def blip(m):
    n = int(0.16 * SR); t = t_(n)
    return (np.sin(TAU * hz(m) * t) + 0.15 * np.sin(TAU * 2 * hz(m) * t)) * np.exp(-t / 0.045) * np.minimum(1, t / 0.002) * 0.45


def whoosh():
    n = int(0.42 * SR); t = t_(n)
    cutoff = 350 + 2600 * np.sin(np.pi * np.clip(t / 0.34, 0, 1)) ** 1.5
    x = svf_lp(rng.standard_normal(n), cutoff, 1.6)
    env = np.sin(np.pi * np.clip(t / 0.38, 0, 1)) ** 2.2
    return sosfilt(butter(2, 180, 'highpass', fs=SR, output='sos'), x * env) * 0.22


def success():
    n = int(0.6 * SR); t = t_(n)
    out = np.zeros(n)
    for delay, m in ((0.0, 84), (0.075, 89)):          # C6 then F6
        tt = np.maximum(0, t - delay)
        on = t >= delay
        out += on * (np.sin(TAU * hz(m) * tt) + 0.2 * np.sin(TAU * 2 * hz(m) * tt)) * np.exp(-tt / 0.16) * np.minimum(1, tt / 0.003)
    return out * 0.32


def grab():
    n = int(0.06 * SR); t = t_(n)
    return sosfilt(butter(2, 1400, 'lowpass', fs=SR, output='sos'), rng.standard_normal(n)) * np.exp(-t / 0.008) * 0.9


def drop():
    n = int(0.2 * SR); t = t_(n)
    f = 70 + 90 * np.exp(-t / 0.02)
    thud = np.sin(TAU * np.cumsum(f) / SR) * np.exp(-t / 0.05) * 0.8
    c = click()
    thud[:len(c)] += c * 0.4
    return thud


def toggle():
    a = click() * 0.7
    b_ = tick(89) * 0.6
    out = np.zeros(int(0.15 * SR))
    out[:len(a)] += a
    k = int(0.028 * SR)
    out[k:k + len(b_)] += b_[:len(out) - k]
    return out


def bell():
    n = int(1.1 * SR); t = t_(n)
    f0 = hz(89)                                          # F6
    parts = [(1.0, 1.0, 0.5), (2.76, 0.45, 0.25), (5.40, 0.25, 0.12), (0.5, 0.3, 0.6)]
    x = sum(a * np.sin(TAU * f0 * r * t) * np.exp(-t / d) for r, a, d in parts)
    ring = 0.5 + 0.5 * np.cos(TAU * 7 * t)              # a little tremble, the clapper
    return x * (0.75 + 0.25 * ring) * np.minimum(1, t / 0.002) * 0.3


TAU = 2 * np.pi
TICKS = [77, 80, 84, 82, 85, 72]         # F5 Ab5 C6 Bb5 Db6 C5: chips climb, tabs answer
BLIPS = [77, 80, 82, 84, 87]             # chart bars, F minor pentatonic upward


def peak_index(x):
    env = np.convolve(np.abs(x), np.ones(int(0.002 * SR)) / int(0.002 * SR), 'same')
    return int(np.argmax(env))


def main():
    cues = json.loads((HERE / 'cues.json').read_text())
    from compose import build   # re-render the music so this script stands alone
    music = build()
    ui = np.zeros(N)
    ti = bi = 0
    for c in cues:
        kind = c['type']
        if kind == 'tick':
            x = tick(TICKS[ti % len(TICKS)]); ti += 1
        elif kind == 'blip':
            x = blip(BLIPS[bi % len(BLIPS)]); bi += 1
        else:
            x = {'click': click, 'whoosh': whoosh, 'success': success, 'grab': grab,
                 'drop': drop, 'toggle': toggle, 'bell': bell}[kind]()
        # a whoosh should crest while the shape is moving fastest, ~90 ms after the change
        lag = 0.09 if kind == 'whoosh' else 0.0
        start = int(round((c['t'] + lag) * SR)) - peak_index(x)
        idx = (start + np.arange(len(x))) % N
        np.add.at(ui, idx, x * c.get('gain', 1))
    ui = sosfilt(butter(1, 120, 'highpass', fs=SR, output='sos'), ui)
    out = music * 0.86 + np.stack([ui, ui]) * 0.55
    out = np.tanh(1.1 * out / np.max(np.abs(out))) / np.tanh(1.1) * 10 ** (-1 / 20)
    write_wav(HERE / 'esquirely-pipeline.wav', out)
    print(f'esquirely-pipeline.wav  {len(cues)} UI cues on a {LOOP:.1f}s loop')


if __name__ == '__main__':
    main()
