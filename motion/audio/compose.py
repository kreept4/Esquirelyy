"""
"Pipeline" — an original 90 BPM Afrobeats groove for the Esquirely motion piece.

Eight bars in F minor: a bouncing log-drum bass, rim clicks in the 3-3-2
pattern, claps on 2 and 4, shaker and congas, offbeat chord stabs, and a
whistle-bright hook that repeats every two bars. All of
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
SWING = 0.14 * S16                # late off-sixteenths: the afro lilt

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
    n = int(0.45 * SR); t = t_(n)
    f = 50 + 90 * np.exp(-t / 0.03)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.2) * np.minimum(1, t / 0.002)
    knock = filt(rng.standard_normal(n), 'bandpass', [1500, 4500]) * np.exp(-t / 0.005) * 0.3
    return np.tanh(1.3 * (body + knock)) * 0.95


def clap():
    n = int(0.35 * SR); t = t_(n)
    noise = filt(rng.standard_normal(n), 'bandpass', [900, 4000])
    env = np.zeros(n)
    for k, d in enumerate((0.0, 0.008, 0.017)):
        m = t >= d
        env[m] += np.exp(-(t[m] - d) / (0.005 if k < 2 else 0.12))
    return noise * env


def rim():
    n = int(0.12 * SR); t = t_(n)
    x = np.sin(2 * np.pi * 1700 * t) * np.exp(-t / 0.012) + filt(rng.standard_normal(n), 'bandpass', [2500, 6000]) * np.exp(-t / 0.004) * 0.5
    return x


def conga(m):
    n = int(0.3 * SR); t = t_(n)
    f = hz(m) * (1 + 0.3 * np.exp(-t / 0.01))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.09) * np.minimum(1, t / 0.001)


def hat(open_=False):
    n = int((0.25 if open_ else 0.05) * SR); t = t_(n)
    x = filt(rng.standard_normal(n), 'highpass', 8500, 4)
    return x * np.exp(-t / (0.08 if open_ else 0.014))


def shaker():
    n = int(0.06 * SR); t = t_(n)
    x = filt(rng.standard_normal(n), 'bandpass', [4500, 10000])
    return x * np.sin(np.pi * np.minimum(t / 0.05, 1)) ** 2


def log_drum(m, dur):
    """The amapiano log drum: a pitched thump that drops into its note and growls."""
    n = int((dur + 0.08) * SR); t = t_(n)
    f = hz(m) * (1 + 1.0 * np.exp(-t / 0.018))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + 0.35 * np.sin(2 * ph) * np.exp(-t / 0.08)
    env = np.minimum(1, t / 0.002) * np.exp(-t / 0.22) * np.clip((dur + 0.08 - t) / 0.08, 0, 1)
    return np.tanh(2.2 * x * env) * 0.8


def stab(notes, dur=0.16):
    n = int((dur + 0.12) * SR); t = t_(n)
    x = np.zeros(n)
    for m in notes:
        for d in (-0.06, 0.06):
            x += saw(hz(m + d), n, rng.random())
    x /= len(notes) * 2
    y = svf_lp(x, 700 + 2600 * np.exp(-t / 0.05), 1.0)
    return y * np.minimum(1, t / 0.002) * np.exp(-t / (dur * 0.6))


def lead(m, dur):
    """A whistle-bright lead with a little scoop into the note and some vibrato."""
    n = int((dur + 0.12) * SR); t = t_(n)
    f = hz(m) * (1 - 0.03 * np.exp(-t / 0.03)) * (1 + 0.006 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 0.2))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.06 * np.sin(3 * ph)
    env = np.minimum(1, t / 0.012) * np.clip((dur + 0.12 - t) / 0.12, 0, 1) * (0.75 + 0.25 * np.exp(-t / 0.1))
    return x * env


def pad(notes, dur):
    n = int((dur + 0.5) * SR); t = t_(n)
    x = sum(np.sin(2 * np.pi * hz(m) * t + rng.random() * 6) for m in notes) / len(notes)
    return x * np.minimum(1, t / 0.3) * np.clip((dur + 0.5 - t) / 0.5, 0, 1)


def swell(dur):
    n = int(dur * SR); t = t_(n)
    y = svf_lp(rng.standard_normal(n), 400 * (14 ** (t / dur)), 1.4)
    return y * (t / dur) ** 2.5


def cymbal(dur=2.5):
    n = int(dur * SR); t = t_(n)
    x = filt(rng.standard_normal(n), 'highpass', 6000, 2)
    return x * np.exp(-t / 0.8) * np.minimum(1, t / 0.004)


# ------------------------------------------------------------------ score
# F minor, a chord a bar: i – VI – VII – v, twice, the last bar turning back home.
CHORDS = [
    # (bar, beat, voicing, bass root)
    (0, 0, [60, 63, 65, 68], 41),   # Fm(add9)
    (1, 0, [60, 61, 65, 68], 37),   # Dbmaj7
    (2, 0, [58, 63, 65, 67], 39),   # Eb(add9)
    (3, 0, [58, 60, 63, 67], 36),   # Cm7
    (4, 0, [60, 63, 65, 68], 41),
    (5, 0, [60, 61, 65, 68], 37),
    (6, 0, [58, 63, 65, 67], 39),
    (7, 0, [60, 61, 65, 68], 37),   # Db
    (7, 2, [58, 61, 64, 67], 36),   # C7(b9)
]

# The hook, two bars long, sung the same way every time so it sticks.
# (sixteenth within the two bars, midi, length in sixteenths)
HOOK = [(0, 77, 2), (3, 80, 2), (6, 77, 1), (8, 75, 2), (10, 72, 3),
        (16, 72, 2), (19, 75, 2), (22, 77, 1), (24, 80, 3), (28, 79, 3)]


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
    downbeat lands (kick, cymbal, the chord left to ring) and decays to silence."""
    global _TOTAL, _WRAP
    _WRAP = outro == 0
    _TOTAL = N + int(round(outro * SR))
    NT = _TOTAL
    drums = np.zeros((2, NT)); music = np.zeros((2, NT)); send = np.zeros((2, NT))
    K, CL, RM, CH, OH, SH = kick(), clap(), rim(), hat(), hat(True), shaker()
    last = BARS - 1

    for bar in range(BARS):
        for s in (0, 8):                                         # kick on 1 and 3
            place(drums, K, pos(bar, s), 0.95)
        place(drums, K, pos(bar, 11), 0.35)                      # and a ghost
        for s in (4, 12):                                        # clap on 2 and 4
            if bar == last and s == 12:
                continue
            place(drums, CL, pos(bar, s), 1.1, 0.05)
            place(send, CL, pos(bar, s), 0.2)
        for s in (3, 6, 10, 14):                                 # rim: the 3-3-2 that makes it afro
            place(drums, RM, pos(bar, s), 0.4, -0.25)
        for s, m in ((7, 55), (13, 50), (15, 50)):               # congas answering
            place(drums, conga(m), pos(bar, s), 0.22, 0.3)
        for s in range(16):
            place(drums, SH, pos(bar, s), 0.09 + 0.08 * (s % 2), 0.4)
        for s in range(2, 16, 4):
            place(drums, CH, pos(bar, s), 0.14, -0.35)
        if bar % 2:
            place(drums, OH, pos(bar, 14), 0.12, 0.3)

    # Turnaround: a clap pickup on the last beat, and a swell into the downbeat.
    for i, s in enumerate((12, 13, 14, 15)):
        place(drums, CL, pos(last, s), 0.25 + 0.15 * i, 0.1 * (-1) ** i)
    place(music, swell(4 * BEAT), last * 4 * BEAT, 0.12)
    place(drums, cymbal(), 0.0, 0.07, 0.2)

    # Chord stabs on the offbeats, a soft pad under them.
    for bar in range(BARS):
        for s in (2, 6, 10, 14):
            _, _, v, _ = chord_at(bar, s // 4)
            x = stab(v)
            place(music, x, pos(bar, s), 1.0, -0.2)
            place(send, x, pos(bar, s), 0.25)
    for i, (bar, beat, v, _) in enumerate(CHORDS):
        nxt = CHORDS[i + 1] if i + 1 < len(CHORDS) else (BARS, 0, None, None)
        span = ((nxt[0] * 4 + nxt[1]) - (bar * 4 + beat)) * BEAT
        place(music, pad([m - 12 for m in v], span), (bar * 4 + beat) * BEAT, 0.09, 0.2)

    # Log drum: bouncing between root, octave and fifth.
    for bar in range(BARS):
        for s, d, up in ((0, 3, 0), (3, 2, 12), (6, 2, 0), (10, 2, 7), (12, 2, 0), (14, 2, 12)):
            _, _, _, root = chord_at(bar, s // 4)
            place(music, log_drum(root + up, S16 * d), pos(bar, s), 0.3)

    # The hook, every two bars, nudged onto the chord where it would clash.
    for bar in range(0, BARS, 2):
        for s, m, d in HOOK:
            b, ss = bar + s // 16, s % 16
            _, _, v, _ = chord_at(b, ss // 4)
            pcs = {x % 12 for x in v}
            if m % 12 not in pcs and (m - 1) % 12 in pcs and ss % 4 == 0:
                m -= 1
            x = lead(m, S16 * d * 0.95)
            place(music, x, pos(b, ss), 0.2, 0.15)
            place(send, x, pos(b, ss), 0.18)

    # The ending: the downbeat the last bar was leaning towards.
    if outro:
        tE = BARS * 4 * BEAT
        place(drums, K, tE, 0.95)
        place(drums, cymbal(3.0), tE, 0.14, 0.2)
        place(send, cymbal(3.0), tE, 0.06)
        home = CHORDS[0][2]
        ring = pad([m - 12 for m in home] + home, 2.4)
        place(music, ring, tE, 0.32, -0.1)
        place(send, ring, tE, 0.3)
        place(music, stab(home, 0.5), tE, 0.6)
        place(music, log_drum(41, 0.9), tE, 0.32)
        place(music, lead(77, 1.4), tE, 0.2, 0.15)
        place(send, lead(77, 1.4), tE, 0.25)

    # Dotted-eighth ping-pong delay on the send (circular on the loop).
    d = int(round(0.75 * BEAT * SR))
    delayed = np.zeros_like(send)
    shift = (lambda x, k: np.roll(x, k)) if _WRAP else (lambda x, k: np.concatenate([np.zeros(k), x[:-k]]))
    for k, g in enumerate((0.4, 0.22, 0.12), 1):
        delayed[k % 2] += shift(send.sum(0) / 2, k * d) * g
    send += delayed * 0.6

    # Reverb: circular on the loop, so it is seamless.
    ir_n = int(2.2 * SR); it = t_(ir_n)
    ir = rng.standard_normal((2, ir_n)) * np.exp(-it / 0.5)
    ir[:, :int(0.015 * SR)] = 0
    ir = np.stack([filt(ir[c], 'lowpass', 6000) for c in range(2)])
    if _WRAP:
        wet = np.stack([np.real(np.fft.ifft(np.fft.fft(send[c]) * np.fft.fft(ir[c], N))) for c in range(2)])
    else:
        L = NT + ir_n
        wet = np.stack([np.real(np.fft.ifft(np.fft.fft(send[c], L) * np.fft.fft(ir[c], L)))[:NT] for c in range(2)])
    wet = filt(wet, 'highpass', 220) * 0.045

    mix = drums + music + wet
    mix = filt(mix, 'highpass', 28)
    mix = filt(mix, 'lowpass', 16000)
    mix = np.tanh(1.2 * mix / np.max(np.abs(mix))) / np.tanh(1.2)
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
