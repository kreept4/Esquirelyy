"""
Measure the beat grid of track.wav with numpy, so the animation is cut to what
the audio actually does rather than to what the score says it should do.

  1. onset strength   spectral flux of a log-magnitude STFT, half-wave rectified
  2. tempo            autocorrelation of the onset curve, 90–160 BPM window,
                      refined to sub-hop precision by parabolic interpolation
  3. phase            the offset whose comb of beat times collects the most onset
  4. downbeat         of the four beat phases, the one with the most low-band
                      (kick + bass) energy AND the biggest harmonic change,
                      since chords move on the one

Writes beats.json and ../beats.js (window.BEATS) for the page.

    python3 analyze.py
"""
import json, wave, pathlib
import numpy as np

HERE = pathlib.Path(__file__).parent


def load(path):
    with wave.open(str(path)) as w:
        sr, ch, n = w.getframerate(), w.getnchannels(), w.getnframes()
        x = np.frombuffer(w.readframes(n), '<i2').astype(np.float64) / 32768
    return x.reshape(-1, ch).mean(1), sr


def stft_mag(x, n_fft=2048, hop=256):
    win = np.hanning(n_fft)
    pad = np.concatenate([x[-n_fft:], x, x[:n_fft]])        # circular: it's a loop
    frames = np.lib.stride_tricks.sliding_window_view(pad, n_fft)[::hop]
    return np.abs(np.fft.rfft(frames * win, axis=1)), hop, n_fft


def main():
    x, sr = load(HERE / 'track.wav')
    dur = len(x) / sr
    S, hop, n_fft = stft_mag(x)
    freqs = np.fft.rfftfreq(n_fft, 1 / sr)
    L = np.log1p(100 * S)
    flux = np.maximum(0, np.diff(L, axis=0)).sum(1)
    flux = (flux - flux.mean()) / (flux.std() + 1e-9)
    fps = sr / hop
    # frame k of flux sits at time (k + 1) * hop - n_fft (the circular pad), centred
    t_of = lambda k: ((k + 1) * hop - n_fft + n_fft / 2) / sr

    # 2. tempo
    ac = np.correlate(flux, flux, 'full')[len(flux) - 1:]
    lo, hi = int(fps * 60 / 160), int(fps * 60 / 90)
    k = lo + int(np.argmax(ac[lo:hi]))
    a, b, c = ac[k - 1], ac[k], ac[k + 1]
    k_ref = k + 0.5 * (a - c) / (a - 2 * b + c)
    period = k_ref / fps
    bpm_raw = 60 / period
    # The loop is an exact number of beats: snap to the period that tiles it.
    n_beats = round(dur / period)
    period = dur / n_beats
    bpm = 60 / period

    # 3. phase — score each candidate offset (1 ms resolution) by onset collected.
    # Broadband flux is dominated by the offbeat open hats and bass in house
    # music, so phase is locked on the kick band (< 150 Hz) instead.
    low_flux = np.maximum(0, np.diff(L[:, freqs < 150], axis=0)).sum(1)
    low_flux = (low_flux - low_flux.mean()) / (low_flux.std() + 1e-9)

    def at(t):
        idx = ((t * sr + n_fft / 2) / hop - 1)
        return np.interp(idx % len(low_flux), np.arange(len(low_flux)), low_flux)

    offs = np.arange(0, period, 0.001)
    score = [at(o + period * np.arange(n_beats)).sum() for o in offs]
    coarse = float(offs[int(np.argmax(score))])

    # 3b. refine against the waveform itself: STFT frames smear an attack by up
    # to half a window. Take the kick band's Hilbert envelope (a rectified 46 Hz
    # sine ripples every 11 ms, the analytic envelope does not) and find where
    # it first crosses 30 % of its local peak, around each coarse beat.
    from scipy.signal import butter, sosfiltfilt, hilbert
    lowsig = sosfiltfilt(butter(4, 150, 'lowpass', fs=sr, output='sos'), x)
    env = np.abs(hilbert(lowsig))
    corr = []
    for bt in coarse + period * np.arange(n_beats):
        i = int(round(bt * sr)); a, b = int(0.06 * sr), int(0.08 * sr)
        seg = env[(np.arange(i - a, i + b)) % len(x)]
        pk = int(np.argmax(seg))
        before = np.nonzero(seg[:pk] < 0.3 * seg[pk])[0]
        on = (before[-1] + 1) if len(before) else pk
        corr.append((on - a) / sr)
    offset = (coarse + float(np.median(corr))) % period
    beats = offset + period * np.arange(n_beats)

    # 4. downbeat. The kick is identical on every beat, so it cannot say where
    # the bar starts. Two things can: the clap lands on 2 and 4, and the
    # harmony changes on 1.
    mid = (freqs > 900) & (freqs < 3200)
    mid_flux = np.maximum(0, np.diff(L[:, mid], axis=0)).sum(1)

    def fr(t):
        return int(round((t * sr + n_fft / 2) / hop - 1)) % len(mid_flux)

    clap = np.array([mid_flux[fr(t) - 1:fr(t) + 4].mean() for t in beats])
    per_phase = np.array([clap[p::4].mean() for p in range(4)])
    backbeat = [per_phase[(p + 1) % 4] + per_phase[(p + 3) % 4] - per_phase[p] - per_phase[(p + 2) % 4] for p in range(4)]

    # beat-synchronous pitch profile of the HARMONIC part only. Drums put energy
    # into every pitch class every beat, so first split them off the standard
    # way (median-filter along time keeps sustained partials, drops transients),
    # then fold the bass register (35–260 Hz) into 12 pitch classes: the bass
    # states the root, and the root is what changes on the one.
    from scipy.ndimage import median_filter
    H = median_filter(S, size=(31, 1), mode='wrap')
    pc_bins = (freqs > 35) & (freqs < 260)
    pcs = np.round(12 * np.log2(freqs[pc_bins] / 440)).astype(int) % 12
    def chroma(t0, t1):
        a, b = fr(t0), fr(t1)
        rows = H[a:b] if b > a else np.vstack([H[a:], H[:b]])
        v = np.bincount(pcs, rows[:, pc_bins].sum(0), 12)
        return v / (np.linalg.norm(v) + 1e-9)
    # a bar either side: long enough that the bassline's own movement averages out
    novelty = np.array([1 - chroma(t - 4 * period, t) @ chroma(t, t + 4 * period) for t in beats])
    nov_phase = np.array([novelty[p::4].mean() for p in range(4)])

    phase_score = [backbeat[p] / (np.ptp(backbeat) + 1e-9) + nov_phase[p] / (np.ptp(nov_phase) + 1e-9) for p in range(4)]
    down = int(np.argmax(phase_score))
    first_downbeat = float(beats[down])

    out = {
        'bpm_measured': round(bpm_raw, 3),
        'bpm': round(bpm, 4),
        'phase_offset_coarse': round(coarse, 4),
        'attack_correction_ms': round(1000 * float(np.median(corr)), 2),
        'beat': period,
        'offset': first_downbeat % (4 * period),
        'beats': int(n_beats),
        'bars': int(n_beats // 4),
        'duration': dur,
        'downbeat_phase_scores': [round(s, 3) for s in phase_score],
    }
    (HERE / 'beats.json').write_text(json.dumps(out, indent=2))
    (HERE.parent / 'beats.js').write_text('window.BEATS = ' + json.dumps(out) + ';\n')
    print(json.dumps(out, indent=2))


if __name__ == '__main__':
    main()
