"""
"Pipeline" — an original 120 BPM deep-house loop for the Esquirely motion piece.

Seven bars of F minor, synthesised from nothing but numpy, so there is no
licence to track: the track is ours. Everything is written onto a circular
buffer exactly one loop long, so every tail (reverb, open hats, the crash on
the downbeat) wraps round to the start and the loop point is inaudible.

    python3 compose.py            -> track.wav (48 kHz, 16-bit stereo, 14.000 s)
"""
import numpy as np
from scipy.signal import butter, sosfilt
import wave, pathlib

SR = 48000
BPM = 120
BEAT = 60 / BPM
BARS = 7
LOOP = BARS * 4 * BEAT            # 14.0 s
N = int(round(LOOP * SR))
S16 = BEAT / 4                    # one sixteenth
SWING = 0.035 * BEAT              # late offbeat sixteenths, a touch of shuffle

rng = np.random.default_rng(7)
HERE = pathlib.Path(__file__).parent


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def t_(n):
    return np.arange(n) / SR


def place(buf, x, at, gain=1.0, pan=0.0):
    """Add mono x into stereo buf at time `at` (s), wrapping past the loop end."""
    i0 = int(round((at % LOOP) * SR))
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    idx = (i0 + np.arange(len(x))) % N
    np.add.at(buf[0], idx, x * gain * l * np.sqrt(2))
    np.add.at(buf[1], idx, x * gain * r * np.sqrt(2))


def filt(x, kind, f, order=2):
    sos = butter(order, f, btype=kind, fs=SR, output='sos')
    return sosfilt(sos, x)


def saw(f, n, phase=0.0):
    p = (phase + np.cumsum(np.full(n, f) / SR)) % 1.0
    # PolyBLEP-free is fine here: everything saw-based is low-passed hard.
    return 2 * p - 1


def svf_lp(x, cutoff, q=0.8):
    """Time-varying state-variable low-pass. cutoff is an array (Hz)."""
    y = np.empty_like(x)
    lp = bp = 0.0
    g = 2 * np.sin(np.pi * np.minimum(cutoff, SR / 6) / SR)
    damp = 1 / q
    for i in range(len(x)):
        hp = x[i] - lp - damp * bp
        bp += g[i] * hp
        lp += g[i] * bp
        y[i] = lp
    return y


# ------------------------------------------------------------------ voices

def kick():
    n = int(0.34 * SR); t = t_(n)
    f = 47 + 118 * np.exp(-t / 0.028)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR)
    env = np.exp(-t / 0.15) * np.minimum(1, t / 0.0015)
    click = filt(rng.standard_normal(n), 'highpass', 3000) * np.exp(-t / 0.004) * 0.35
    return np.tanh(1.3 * (body * env + click)) * 0.95


def clap():
    n = int(0.45 * SR); t = t_(n)
    noise = filt(rng.standard_normal(n), 'bandpass', [900, 3200])
    env = np.zeros(n)
    for k, d in enumerate([0.0, 0.009, 0.019]):
        m = t >= d
        env[m] += np.exp(-(t[m] - d) / (0.006 if k < 2 else 0.16)) * (0.8 if k < 2 else 1)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05) * 0.25
    return (noise * env + tone) * 0.9


def hat(open_=False):
    n = int((0.34 if open_ else 0.07) * SR); t = t_(n)
    metal = sum(np.sign(np.sin(2 * np.pi * f * t)) for f in (317, 421, 563, 687, 811, 1013))
    x = filt(metal * 0.2 + rng.standard_normal(n), 'highpass', 7200, 4)
    return x * np.exp(-t / (0.11 if open_ else 0.018)) * np.minimum(1, t / 0.0008)


def shaker():
    n = int(0.06 * SR); t = t_(n)
    x = filt(rng.standard_normal(n), 'bandpass', [5000, 11000])
    return x * np.sin(np.pi * np.minimum(t / 0.05, 1)) ** 2


def bass_note(m, dur):
    n = int((dur + 0.05) * SR); t = t_(n)
    f = hz(m)
    x = np.sin(2 * np.pi * f * t) + 0.35 * filt(saw(f, n), 'lowpass', 420)
    env = np.minimum(1, t / 0.004) * np.clip((dur + 0.05 - t) / 0.05, 0, 1) * np.exp(-t / 0.5)
    return np.tanh(1.4 * x * env)


def stab(notes, dur=0.22, bright=1.0):
    n = int((dur + 0.08) * SR); t = t_(n)
    x = np.zeros(n)
    for m in notes:
        for d in (-0.09, 0.0, 0.08):          # detune in semitones
            x += saw(hz(m + d), n, rng.random())
    x /= len(notes) * 3
    cutoff = 380 + 3400 * bright * np.exp(-t / 0.07)
    env = np.minimum(1, t / 0.003) * np.exp(-t / (dur * 0.55))
    return svf_lp(x, cutoff, 1.1) * env


def pad(notes, dur):
    n = int((dur + 0.4) * SR); t = t_(n)
    x = np.zeros(n)
    for m in notes:
        for d in (-0.12, 0.12):
            x += saw(hz(m + d), n, rng.random())
    x = filt(x / (len(notes) * 2), 'lowpass', 900)
    env = np.minimum(1, t / 0.25) * np.clip((dur + 0.4 - t) / 0.4, 0, 1)
    return x * env


def pluck(m, dur=0.3):
    n = int((dur + 0.1) * SR); t = t_(n)
    f = hz(m)
    x = np.sin(2 * np.pi * f * t + 1.2 * np.exp(-t / 0.03) * np.sin(2 * np.pi * 2 * f * t))
    return x * np.exp(-t / 0.13) * np.minimum(1, t / 0.002)


def noise_riser(dur):
    n = int(dur * SR); t = t_(n)
    x = rng.standard_normal(n)
    cutoff = 500 * (18 ** (t / dur))
    y = svf_lp(x, cutoff, 2.2)
    return y * (t / dur) ** 2.2


def crash():
    n = int(2.6 * SR); t = t_(n)
    x = filt(rng.standard_normal(n), 'highpass', 5200, 2)
    return x * np.exp(-t / 0.7) * np.minimum(1, t / 0.001)


# ------------------------------------------------------------------ score
# F minor. Seven bars, the seventh a turnaround whose C7(b9) leans back to bar 1.
CHORDS = [
    # (bar, beat, voicing, bass root)
    (0, 0, [53, 56, 60, 63, 67], 41),   # Fm9
    (1, 0, [53, 56, 60, 63, 67], 41),
    (2, 0, [49, 53, 56, 60, 63], 37),   # Dbmaj9
    (3, 0, [49, 53, 56, 60, 63], 37),
    (4, 0, [56, 60, 61, 65], 46),       # Bbm9 (rootless)
    (5, 0, [55, 58, 60, 63, 67], 36),   # Cm7 / add9 colour
    (6, 0, [56, 60, 61, 65], 37),       # Dbmaj7
    (6, 2, [55, 58, 61, 64], 36),       # C7(b9)
]


def chord_at(bar, beat):
    cur = CHORDS[0]
    for c in CHORDS:
        if (c[0], c[1]) <= (bar, beat):
            cur = c
    return cur


def pos(bar, six):
    """Time of a sixteenth within a bar, with swing on the off-sixteenths."""
    t = (bar * 16 + six) * S16
    return t + (SWING if six % 2 else 0)


def build():
    drums = np.zeros((2, N)); music = np.zeros((2, N)); send = np.zeros((2, N))
    K, C, CH, OH, SH = kick(), clap(), hat(), hat(True), shaker()

    kicks = []
    for bar in range(BARS):
        for b in range(4):
            tk = (bar * 4 + b) * BEAT
            kicks.append(tk)
            place(drums, K, tk, 0.9)
            if b in (1, 3):
                place(drums, C, tk, 0.85, 0.05)
                place(send, C, tk, 0.25)
            place(drums, OH, tk + BEAT / 2, 0.21, 0.25)
        for s in range(16):
            if s % 4 == 2:
                continue                              # open hat owns the "and"
            vel = 0.09 + 0.05 * (s % 2) + 0.02 * rng.random()
            place(drums, CH, pos(bar, s), vel, -0.3)
            if s % 2:
                place(drums, SH, pos(bar, s), 0.07, 0.45)

    # Turnaround: clap roll over the last two beats of bar 7, swelling into the loop.
    for i, s in enumerate(range(8, 16)):
        place(drums, C, pos(6, s) - (SWING if s % 2 else 0), 0.2 + 0.08 * i, 0.1 * (-1) ** i)
    place(music, noise_riser(4 * BEAT), 6 * 4 * BEAT, 0.3)
    place(drums, crash(), 0.0, 0.2, 0.2)
    place(send, crash(), 0.0, 0.05)

    # Bass: rolling offbeat line, octave hop on the last sixteenth of each beat pair.
    for bar in range(BARS):
        for s in (2, 3, 6, 10, 11, 14, 15):
            _, _, _, root = chord_at(bar, s // 4)
            m = root + (12 if s in (3, 11) else 0) + (7 if s == 15 and bar % 2 else 0)
            place(music, bass_note(m, S16 * (1.6 if s in (2, 10) else 0.8)), pos(bar, s), 0.36)

    # Stabs: syncopated, brighter on the "3" of the pattern.
    for bar in range(BARS):
        for s, br in ((3, 0.8), (6, 0.55), (10, 1.0), (13, 0.5)):
            if bar == 6 and s == 13:
                continue
            _, _, v, _ = chord_at(bar, s // 4)
            x = stab(v, 0.22, br)
            place(music, x, pos(bar, s), 1.3, -0.15)
            place(send, x, pos(bar, s), 0.5)
        # Pad underneath, one per chord.
    for i, (bar, beat, v, _) in enumerate(CHORDS):
        nxt = CHORDS[i + 1] if i + 1 < len(CHORDS) else (BARS, 0, None, None)
        dur = ((nxt[0] * 4 + nxt[1]) - (bar * 4 + beat)) * BEAT
        p = pad([m + 12 for m in v], dur)
        place(music, p, (bar * 4 + beat) * BEAT, 0.2, 0.3)
        place(send, p, (bar * 4 + beat) * BEAT, 0.12)

    # Pluck hook, answered each bar; dotted-eighth echo via the delay below.
    hook = [(0, 72), (3, 75), (6, 77), (10, 80), (12, 79)]
    answer = [(0, 77), (4, 75), (7, 72), (10, 70)]
    for bar in range(BARS):
        for s, m in (hook if bar % 2 == 0 else answer):
            _, _, v, _ = chord_at(bar, s // 4)
            # Nudge any note clashing with the chord's pitch classes to the nearest chord tone.
            pcs = {x % 12 for x in v}
            if m % 12 not in pcs and (m - 1) % 12 in pcs:
                m -= 1
            place(music, pluck(m), pos(bar, s), 0.22, 0.35)
            place(send, pluck(m), pos(bar, s), 0.16)

    # Dotted-eighth ping-pong delay on the send, circular.
    d = int(round(0.75 * BEAT * SR))
    delayed = np.zeros_like(send)
    for k, g in enumerate((0.45, 0.28, 0.16), 1):
        delayed[k % 2] += np.roll(send.sum(0) / 2, k * d) * g
    send += delayed * 0.7

    # Circular convolution reverb: a 2.4 s decaying noise tail, seamless across the loop.
    ir_n = int(2.4 * SR); it = t_(ir_n)
    ir = rng.standard_normal((2, ir_n)) * np.exp(-it / 0.55)
    ir[:, :int(0.012 * SR)] = 0
    ir = np.stack([filt(ir[c], 'lowpass', 6500) for c in range(2)])
    wet = np.stack([np.real(np.fft.ifft(np.fft.fft(send[c]) * np.fft.fft(ir[c], N))) for c in range(2)])
    wet = filt(wet, 'highpass', 250) * 0.05

    # Kick sidechain on everything musical.
    duck = np.ones(N)
    tt = t_(N)
    for tk in kicks:
        dt = (tt - tk) % LOOP
        duck -= 0.62 * np.exp(-dt / 0.11) * np.minimum(1, dt / 0.006) * (dt < 0.5)
    duck = np.clip(duck, 0.3, 1)

    mix = drums + (music + wet) * duck
    mix = filt(mix, 'highpass', 28)
    mix = np.tanh(1.25 * mix / np.max(np.abs(mix))) / np.tanh(1.25)
    return mix * 10 ** (-1.2 / 20)


def write_wav(path, x):
    x = np.clip(x, -1, 1)
    data = (x.T * 32767).astype('<i2').tobytes()
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(x.shape[0]); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data)


if __name__ == '__main__':
    out = build()
    write_wav(HERE / 'track.wav', out)
    print(f'track.wav  {LOOP:.3f}s  {BPM} BPM  {BARS} bars  peak {np.max(np.abs(out)):.3f}')
