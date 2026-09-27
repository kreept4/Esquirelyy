"""
"Pipeline" — an original 90 BPM neo-soul groove for the Esquirely motion piece.

Eight bars in F minor: electric piano chords, a round sub bass, a laid-back
kick and snare with swung hats and a shaker, and a soft marimba line. All of
it synthesised from numpy, so there is no licence to track: the track is ours.

The loop build writes onto a circular buffer exactly one loop long, so every
tail wraps round to the start and the loop point is inaudible. The linear
build (build(outro=seconds)) plays the eight bars once and then lands the
downbeat the last bar turns towards, letting the Fm9 ring out to silence.

    python3 compose.py            -> track.wav (48 kHz, 16-bit stereo, one loop)
"""
import numpy as np
from scipy.signal import butter, sosfilt
import wave, pathlib

SR = 48000
BPM = 90
BEAT = 60 / BPM
BARS = 8
LOOP = BARS * 4 * BEAT            # 21.333 s
N = int(round(LOOP * SR))
S16 = BEAT / 4                    # one sixteenth
SWING = 0.2 * S16                 # late off-sixteenths: the lazy feel the tempo wants

rng = np.random.default_rng(7)
HERE = pathlib.Path(__file__).parent


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def t_(n):
    return np.arange(n) / SR


# The loop build writes onto a circular buffer exactly one loop long. The
# linear build writes onto a plain buffer with room for the ending, and nothing wraps.
_TOTAL, _WRAP = N, True


def place(buf, x, at, gain=1.0, pan=0.0):
    """Add mono x into stereo buf at time `at` (s); on the loop, wrap past the end."""
    i0 = int(round(((at % LOOP) if _WRAP else at) * SR))
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    idx = i0 + np.arange(len(x))
    if _WRAP:
        idx %= N
    else:
        keep = (idx >= 0) & (idx < _TOTAL)
        idx, x = idx[keep], x[keep]
    np.add.at(buf[0], idx, x * gain * l * np.sqrt(2))
    np.add.at(buf[1], idx, x * gain * r * np.sqrt(2))


def filt(x, kind, f, order=2):
    sos = butter(order, f, btype=kind, fs=SR, output='sos')
    return sosfilt(sos, x)


def saw(f, n, phase=0.0):
    p = (phase + np.cumsum(np.full(n, f) / SR)) % 1.0
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
    n = int(0.5 * SR); t = t_(n)
    f = 48 + 70 * np.exp(-t / 0.04)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.26) * np.minimum(1, t / 0.002)
    knock = filt(rng.standard_normal(n), 'bandpass', [1500, 4000]) * np.exp(-t / 0.006) * 0.25
    return np.tanh(1.2 * (body + knock)) * 0.95


def snare():
    n = int(0.4 * SR); t = t_(n)
    body = np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.06) * 0.6
    wire = filt(rng.standard_normal(n), 'bandpass', [1400, 7000]) * np.exp(-t / 0.13)
    return (body + wire * 0.8) * np.minimum(1, t / 0.001)


def hat(open_=False):
    n = int((0.3 if open_ else 0.06) * SR); t = t_(n)
    x = filt(rng.standard_normal(n), 'highpass', 8000, 4)
    return x * np.exp(-t / (0.1 if open_ else 0.016)) * np.minimum(1, t / 0.0008)


def shaker():
    n = int(0.07 * SR); t = t_(n)
    x = filt(rng.standard_normal(n), 'bandpass', [5000, 11000])
    return x * np.sin(np.pi * np.minimum(t / 0.06, 1)) ** 2


def rhodes(m, dur, vel=1.0):
    """FM electric piano: a tine that barks when struck and mellows as it rings."""
    n = int((dur + 0.4) * SR); t = t_(n)
    f = hz(m)
    index = vel * (1.6 * np.exp(-t / 0.09) + 0.35)
    x = np.sin(2 * np.pi * f * t + index * np.sin(2 * np.pi * f * t))
    x += 0.12 * vel * np.sin(2 * np.pi * 7.1 * f * t) * np.exp(-t / 0.03)   # the tine's bell
    env = np.minimum(1, t / 0.003) * np.exp(-t / 1.8) * np.clip((dur + 0.4 - t) / 0.4, 0, 1)
    return x * env * (1 + 0.1 * np.sin(2 * np.pi * 4.2 * t))                 # a little tremolo


def chord(notes, dur, vel=1.0, strum=0.012):
    n = int((dur + 0.4 + strum * len(notes)) * SR)
    out = np.zeros(n)
    for i, m in enumerate(notes):
        x = rhodes(m, dur, vel * (0.85 + 0.15 * rng.random()))
        k = int(i * strum * SR)
        out[k:k + len(x)] += x
    return out / len(notes) ** 0.7


def bass_note(m, dur):
    n = int((dur + 0.06) * SR); t = t_(n)
    f = hz(m)
    x = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t) * np.exp(-t / 0.15)
    env = np.minimum(1, t / 0.006) * np.clip((dur + 0.06 - t) / 0.06, 0, 1)
    return np.tanh(1.3 * x * env)


def marimba(m):
    n = int(0.7 * SR); t = t_(n)
    f = hz(m)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.35) + 0.3 * np.sin(2 * np.pi * 3.93 * f * t) * np.exp(-t / 0.05)
    return x * np.minimum(1, t / 0.002)


def pad(notes, dur):
    n = int((dur + 0.5) * SR); t = t_(n)
    x = sum(np.sin(2 * np.pi * hz(m) * t + rng.random() * 6) for m in notes) / len(notes)
    env = np.minimum(1, t / 0.4) * np.clip((dur + 0.5 - t) / 0.5, 0, 1)
    return x * env


def swell(dur):
    """Filtered-noise rise into the downbeat, softer than a riser."""
    n = int(dur * SR); t = t_(n)
    y = svf_lp(rng.standard_normal(n), 400 * (12 ** (t / dur)), 1.4)
    return y * (t / dur) ** 2.5


def cymbal(dur=2.5):
    n = int(dur * SR); t = t_(n)
    x = filt(rng.standard_normal(n), 'highpass', 6000, 2)
    return x * np.exp(-t / 0.8) * np.minimum(1, t / 0.004)


# ------------------------------------------------------------------ score
# F minor, two bars on the tonic, and a last bar that leans back to it.
CHORDS = [
    # (bar, beat, voicing, bass root)
    (0, 0, [56, 60, 63, 65, 67], 41),   # Fm9
    (1, 0, [56, 60, 63, 65, 67], 41),
    (2, 0, [53, 56, 60, 61, 63], 37),   # Dbmaj9
    (3, 0, [53, 56, 60, 61, 63], 37),
    (4, 0, [56, 60, 61, 65], 46),       # Bbm9 (rootless)
    (5, 0, [56, 60, 61, 65], 46),
    (6, 0, [55, 58, 60, 63, 67], 36),   # Cm7 add9
    (7, 0, [56, 60, 61, 65], 37),       # Dbmaj7
    (7, 2, [55, 58, 61, 64], 36),       # C7(b9)
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


def build(outro=0.0):
    """outro = 0: the seamless loop. outro > 0: the loop played once, then the
    downbeat lands (kick, cymbal, the Fm9 left to ring) and decays to silence."""
    global _TOTAL, _WRAP
    _WRAP = outro == 0
    _TOTAL = N + int(round(outro * SR))
    NT = _TOTAL
    drums = np.zeros((2, NT)); music = np.zeros((2, NT)); send = np.zeros((2, NT))
    K, SN, CH, OH, SH = kick(), snare(), hat(), hat(True), shaker()
    last = BARS - 1

    for bar in range(BARS):
        # kick on 1 and 3, a ghost on the "and" of 3; the last bar drops out on 4
        for s, g in ((0, 0.95), (8, 0.8), (10, 0.35)):
            place(drums, K, pos(bar, s), g)
        for s in (4, 12):
            if bar == last and s == 12:
                continue
            place(drums, SN, pos(bar, s), 1.1, 0.05)
            place(send, SN, pos(bar, s), 0.3)
        for s in range(0, 16, 2):
            place(drums, CH, pos(bar, s), 0.22 + 0.06 * (s % 4 == 0), -0.3)
        for s in range(1, 16, 2):
            place(drums, CH, pos(bar, s), 0.09 + 0.03 * rng.random(), -0.3)
        if bar % 2:
            place(drums, OH, pos(bar, 14), 0.16, 0.3)
        for s in range(16):
            place(drums, SH, pos(bar, s), 0.045 + 0.03 * (s % 4 == 2), 0.45)

    # Turnaround: a snare pickup on the last beat, and a soft swell into the downbeat.
    for i, s in enumerate((12, 13, 14, 15)):
        place(drums, SN, pos(last, s), 0.35 + 0.2 * i, 0.08 * (-1) ** i)
    place(music, swell(4 * BEAT), last * 4 * BEAT, 0.1)
    place(drums, cymbal(), 0.0, 0.06, 0.2)
    place(send, cymbal(), 0.0, 0.03)

    # Electric piano: a held chord on 1, answered on the "and" of 3.
    for i, (bar, beat, v, _) in enumerate(CHORDS):
        nxt = CHORDS[i + 1] if i + 1 < len(CHORDS) else (BARS, 0, None, None)
        span = ((nxt[0] * 4 + nxt[1]) - (bar * 4 + beat)) * BEAT
        t0 = (bar * 4 + beat) * BEAT
        x = chord(v, min(span, 2.2 * BEAT), 1.0)
        place(music, x, t0, 0.55, -0.15)
        place(send, x, t0, 0.3)
        if span >= 4 * BEAT:
            y = chord(v, 1.2 * BEAT, 0.7)
            place(music, y, pos(bar, 10), 0.4, 0.15)
            place(send, y, pos(bar, 10), 0.2)
        p = pad([m - 12 for m in v[1:4]], span)
        place(music, p, t0, 0.08, 0.0)

    # Bass: root on 1, a push into 3, the octave on the way back.
    for bar in range(BARS):
        for s, d, up in ((0, 5, 0), (7, 1, 0), (8, 3, 0), (11, 2, 12), (14, 2, 0)):
            _, _, _, root = chord_at(bar, s // 4)
            place(music, bass_note(root + up, S16 * d * 0.9), pos(bar, s), 0.21)

    # Marimba: a short figure, answered each bar, nudged onto chord tones.
    hook = [(0, 72), (3, 75), (6, 77), (10, 80), (12, 79)]
    answer = [(0, 77), (4, 75), (7, 72), (10, 70)]
    for bar in range(BARS):
        for s, m in (hook if bar % 2 == 0 else answer):
            _, _, v, _ = chord_at(bar, s // 4)
            pcs = {x % 12 for x in v}
            if m % 12 not in pcs and (m - 1) % 12 in pcs:
                m -= 1
            place(music, marimba(m), pos(bar, s), 0.21, 0.35)
            place(send, marimba(m), pos(bar, s), 0.12)

    # The ending: the downbeat the last bar was leaning towards.
    if outro:
        tE = BARS * 4 * BEAT
        place(drums, K, tE, 0.95)
        place(drums, cymbal(3.0), tE, 0.14, 0.2)
        place(send, cymbal(3.0), tE, 0.06)
        fm9 = CHORDS[0][2]
        ring = chord(fm9, 2.6, 1.0, strum=0.02)
        place(music, ring, tE, 0.6, -0.1)
        place(send, ring, tE, 0.45)
        place(music, pad([m - 12 for m in fm9[1:4]], 2.4), tE, 0.1)
        place(music, bass_note(41, 1.6), tE, 0.24)
        for dt, m in ((0.0, 77), (BEAT * 0.75, 84)):
            place(music, marimba(m), tE + dt, 0.18, 0.35)
            place(send, marimba(m), tE + dt, 0.16)

    # Dotted-eighth ping-pong delay on the send (circular on the loop).
    d = int(round(0.75 * BEAT * SR))
    delayed = np.zeros_like(send)
    shift = (lambda x, k: np.roll(x, k)) if _WRAP else (lambda x, k: np.concatenate([np.zeros(k), x[:-k]]))
    for k, g in enumerate((0.4, 0.22, 0.12), 1):
        delayed[k % 2] += shift(send.sum(0) / 2, k * d) * g
    send += delayed * 0.6

    # Reverb: a 2.6 s decaying noise tail; circular on the loop, so it is seamless.
    ir_n = int(2.6 * SR); it = t_(ir_n)
    ir = rng.standard_normal((2, ir_n)) * np.exp(-it / 0.6)
    ir[:, :int(0.015 * SR)] = 0
    ir = np.stack([filt(ir[c], 'lowpass', 5500) for c in range(2)])
    if _WRAP:
        wet = np.stack([np.real(np.fft.ifft(np.fft.fft(send[c]) * np.fft.fft(ir[c], N))) for c in range(2)])
    else:
        L = NT + ir_n
        wet = np.stack([np.real(np.fft.ifft(np.fft.fft(send[c], L) * np.fft.fft(ir[c], L)))[:NT] for c in range(2)])
    wet = filt(wet, 'highpass', 220) * 0.045

    mix = drums + music + wet
    mix = filt(mix, 'highpass', 28)
    mix = filt(mix, 'lowpass', 15000)
    mix = np.tanh(1.15 * mix / np.max(np.abs(mix))) / np.tanh(1.15)
    if outro:
        f = int(0.5 * SR)
        mix[:, -f:] *= np.cos(np.linspace(0, np.pi / 2, f)) ** 2
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
