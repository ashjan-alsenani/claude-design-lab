#!/usr/bin/env python3
"""
compose.py - original underscore for an Arabic children's educational film
("using antibiotics correctly").  Writes music.mid.

Key: D major   Tempo: 96 BPM (4/4, 1 bar = 2.5 s)   Length: 66 bars = 165 s
All material (progressions, arpeggio figures, celesta/glock lines) was written
for this piece.  Deterministic: fixed random seed for the humanisation.
"""
import random
import mido

OUT = "music.mid"
BPM = 96
TPB = 480                     # ticks per beat
random.seed(20261002)

# ---------------------------------------------------------------- channels
# name: (channel, program, bank, pan, reverb send, chorus send)
CH = {
    "pad":   (0, 49, 0, 64, 70, 30),   # Slow Strings
    "warm":  (1, 89, 0, 64, 60, 40),   # Warm Pad
    "piano": (2, 0, 0, 52, 55, 0),     # Grand piano (arpeggio)
    "ep":    (3, 4, 0, 76, 55, 25),    # Rhodes EP (chords)
    "bass":  (4, 32, 0, 64, 25, 0),    # Acoustic bass
    "pizz":  (5, 45, 0, 84, 55, 0),    # Pizzicato section
    "cel":   (6, 8, 0, 44, 75, 10),    # Celesta
    "glock": (7, 9, 0, 88, 80, 0),     # Glockenspiel
    "drums": (9, 40, 0, 64, 35, 0),    # Brush kit (ch10 = percussion bank)
}

# ---------------------------------------------------------------- harmony
NOTE = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6,
        "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}
QUAL = {
    "":     [0, 4, 7],
    "add9": [0, 4, 7, 14],
    "maj7": [0, 4, 7, 11],
    "6":    [0, 4, 7, 9],
    "m":    [0, 3, 7],
    "m7":   [0, 3, 7, 10],
    "m9":   [0, 3, 7, 10, 14],
    "7":    [0, 4, 7, 10],
    "sus4": [0, 5, 7],
    "7sus4": [0, 5, 7, 10],
    "sus2": [0, 2, 7],
}


def chord(sym):
    """'Bm7' or 'D/F#' -> (root_pc, intervals, bass_pc)."""
    bass = None
    if "/" in sym:
        sym, b = sym.split("/")
        bass = NOTE[b]
    r = sym[:2] if len(sym) > 1 and sym[1] == "#" else sym[:1]
    q = sym[len(r):]
    root = NOTE[r]
    return root, QUAL[q], (root if bass is None else bass)


# ---------------------------------------------------------------- sections
# (name, start_bar, chords per bar ; a bar entry may be "X|Y" = 2 beats each)
SECTIONS = [
    ("intro", 0, ["Dadd9", "Gmaj7/D", "Asus4|A"]),
    ("A1", 3, ["D", "A/C#", "Bm7", "Gmaj7", "D/F#", "G", "Em7", "A7sus4|A"]),
    ("A2", 11, ["D", "A/C#", "Bm7", "Gmaj7", "D/F#", "G", "Em7", "A7sus4|A"]),
    ("B", 19, ["Bm7", "Gmaj7", "D", "A", "Bm7", "Gadd9", "Em7", "Asus4|A"]),
    ("A3", 27, ["D", "A/C#", "Bm7", "Gmaj7", "D/F#", "G", "Em7", "A7sus4|A"]),
    ("C", 35, ["Gmaj7", "A6", "F#m7", "Bm7", "Em9", "F#m7", "Gmaj7", "Asus4|A"]),
    ("A4", 43, ["D", "A/C#", "Bm7", "Gmaj7", "Asus4|A"]),
    ("lift", 48, ["G", "A", "F#m7", "Bm", "G", "A", "D/F#", "Bm7", "Em7", "Asus4|A"]),
    ("outro", 58, ["Gmaj7", "D/F#", "Em7", "Asus4|A"]),
    ("end", 62, ["Dadd9", "Dadd9", "Dadd9", "Dadd9"]),
]
TOTAL_BARS = 66

# per-section arrangement switches
ARR = {
    #        pad  warm piano  ep   bass  pizz  cel  glock drums
    "intro": dict(pad=1, warm=1, piano="intro", ep=0, bass=0, pizz=0, cel=0, glock=1, drums=0),
    "A1":    dict(pad=1, warm=1, piano="arp", ep=0, bass="long", pizz=0, cel=0, glock=0, drums="shaker"),
    "A2":    dict(pad=1, warm=1, piano="arp", ep=0, bass="walk", pizz="a", cel="A2", glock=0, drums="light"),
    "B":     dict(pad=1, warm=1, piano="sparse", ep="half", bass="long", pizz=0, cel=0, glock="B", drums=0),
    "A3":    dict(pad=1, warm=1, piano="arp", ep=0, bass="walk", pizz="b", cel=0, glock="A3", drums="shaker"),
    "C":     dict(pad=1, warm=1, piano="arp2", ep="offbeat", bass="walk", pizz="a", cel="C", glock=0, drums="light"),
    "A4":    dict(pad=1, warm=1, piano="sparse", ep=0, bass="long", pizz=0, cel=0, glock="A4", drums=0),
    "lift":  dict(pad=1, warm=1, piano="arp", ep="half", bass="walk", pizz="b", cel="lift", glock="lift", drums="light"),
    "outro": dict(pad=1, warm=1, piano="sparse", ep=0, bass="long", pizz=0, cel="outro", glock=0, drums=0),
    "end":   dict(pad=1, warm=1, piano="final", ep=0, bass="final", pizz=0, cel="final", glock=0, drums=0),
}

# ---------------------------------------------------------------- melodies
# (beat offset inside section, midi pitch, duration in beats, velocity)
MEL = {
    "A2": [(2, 78, .5, 50), (2.5, 81, .5, 52), (3, 86, 1.5, 56), (5, 85, 1, 52), (6, 81, 2, 48),
           (14, 83, .5, 50), (14.5, 86, .5, 52), (15, 90, 1.5, 56), (17, 88, 1, 52), (18, 86, 2, 48),
           (24, 83, 1, 48), (25, 79, 1, 46), (26, 81, 2, 48), (29, 88, 1, 50), (30, 85, 2, 46)],
    "C": [(0, 83, 1, 48), (1, 86, 1, 50), (2, 90, 2, 54), (4, 88, 1.5, 52), (5.5, 85, .5, 48), (6, 81, 2, 46),
          (9, 85, 1, 48), (10, 88, 2, 50), (12, 86, 3, 48),
          (16, 83, .5, 48), (16.5, 86, .5, 50), (17, 90, 1.5, 54), (19, 88, 1, 50), (20, 85, 2, 48),
          (24, 83, 1, 48), (25, 86, 1, 50), (26, 90, 1, 52), (27, 93, 1, 54), (28, 88, 3, 48)],
    "lift": [(0, 86, 1, 52), (1, 88, 1, 54), (2, 91, 2, 58), (4, 90, 1.5, 56), (5.5, 88, .5, 52), (6, 85, 2, 50),
             (8, 85, 1, 52), (9, 88, 1, 54), (10, 90, 2, 58), (12, 86, 3, 54), (15, 85, .5, 50), (15.5, 83, .5, 50),
             (16, 86, 1, 54), (17, 88, 1, 56), (18, 91, 1, 58), (19, 93, 1, 60), (20, 90, 2, 58), (22, 88, 2, 54),
             (24, 86, 1, 54), (25, 90, 1, 56), (26, 93, 2, 58), (28, 90, 3, 54), (31, 88, 1, 50),
             (32, 86, 2, 50), (34, 83, 2, 48), (36, 86, 2, 48), (38, 85, 2, 46)],
    "outro": [(2, 79, 1, 44), (3, 83, 1, 44), (4, 81, 2, 42), (10, 78, 1, 40), (11, 81, 1, 40), (12, 83, 2, 40),
              (14, 85, 2, 38)],
    "final": [(0, 86, 4, 40), (1.5, 90, 4, 34)],
}
GLOCK = {   # sparse sparkles
    "intro": [(8, 90, 1, 38), (9, 93, 2, 34)],
    "B": [(6, 90, 1, 40), (7, 88, 1, 38), (22, 86, 1, 40), (23, 85, 1, 38), (30, 88, 2, 38)],
    "A3": [(0, 90, 1, 42), (1.5, 93, .5, 40), (2, 90, 2, 38), (8, 85, 1, 40), (10, 83, 2, 38),
           (16, 90, 1, 42), (17.5, 93, .5, 40), (18, 95, 2, 38), (24, 91, 1, 40), (26, 88, 2, 38), (30, 85, 2, 36)],
    "A4": [(3, 90, 1, 38), (11, 88, 1, 36), (18, 93, 2, 36)],
    "lift": [(2, 91, 2, 34), (10, 90, 2, 34), (18, 91, 1, 34), (19, 93, 1, 34), (26, 93, 2, 34), (36, 86, 2, 30)],
}

# ---------------------------------------------------------------- dynamics
# expression (CC11) breakpoints in bars: overall intensity curve 0..127
# smooth ramps between sections - no sudden jumps.
INTENSITY = [(0, 40), (3, 92), (11, 98), (19, 88), (27, 98), (35, 97), (43, 92),
             (48, 94), (50, 98), (58, 97), (60, 94), (62, 92), (66, 80)]


def intensity(bar):
    for (b0, v0), (b1, v1) in zip(INTENSITY, INTENSITY[1:]):
        if b0 <= bar <= b1:
            return v0 + (v1 - v0) * (bar - b0) / (b1 - b0)
    return INTENSITY[-1][1]


# ---------------------------------------------------------------- event list
events = []   # (tick, order, channel, msg)


def t(beats):
    return int(round(beats * TPB))


def note(ch, start_beat, dur_beats, pitch, vel, human=True):
    jitter = random.uniform(-0.02, 0.02) if human else 0.0
    vel = int(max(1, min(127, vel + (random.randint(-4, 4) if human else 0))))
    s = max(0, t(start_beat + jitter))
    e = max(s + 10, t(start_beat + dur_beats) - 5)
    events.append((s, 1, ch, mido.Message("note_on", channel=ch, note=pitch, velocity=vel)))
    events.append((e, 0, ch, mido.Message("note_off", channel=ch, note=pitch, velocity=0)))


def cc(ch, beat, ctrl, val):
    events.append((t(beat), 0, ch, mido.Message("control_change", channel=ch, control=ctrl,
                                                 value=int(max(0, min(127, val))))))


def voicing(root, ivs, low, high):
    """Close voicing of chord tones (incl. extensions) placed in [low, high]."""
    out = []
    for iv in ivs:
        p = root + iv
        while p < low:
            p += 12
        while p > high:
            p -= 12
        out.append(p)
    return sorted(set(out))


def bar_chords(entry):
    """Return list of (beat_offset_in_bar, length_beats, chord_tuple)."""
    if "|" in entry:
        a, b = entry.split("|")
        return [(0, 2, chord(a)), (2, 2, chord(b))]
    return [(0, 4, chord(entry))]


# ---------------------------------------------------------------- write parts
for idx, (name, sbar, bars) in enumerate(SECTIONS):
    arr = ARR[name]
    sbeat = sbar * 4
    for bi, entry in enumerate(bars):
        bar = sbar + bi
        b0 = bar * 4
        for off, ln, (root, ivs, bass_pc) in bar_chords(entry):
            st = b0 + off
            final = name == "end"
            if final and bi > 0:
                continue
            fl = 12 if final else ln   # final chord held 3 bars, then decays

            # pad: slow strings, mid voicing, legato
            if arr["pad"]:
                for p in voicing(root, ivs, 57, 71):
                    note(CH["pad"][0], st, fl + (0 if final else 0.05), p, 58, human=False)
            # warm pad: lower, very soft glue
            if arr["warm"]:
                for p in voicing(root, ivs[:3], 50, 64):
                    note(CH["warm"][0], st, fl, p, 44, human=False)

            # bass
            bpc = 38 + ((bass_pc - 2) % 12)            # range A1..G#2
            if bpc > 44:
                bpc -= 12
            if arr["bass"] == "long":
                note(CH["bass"][0], st, ln - 0.1, bpc, 66)
            elif arr["bass"] == "walk":
                note(CH["bass"][0], st, 1.4, bpc, 70)
                if ln == 4:
                    fifth = bpc + 7 if bpc + 7 <= 47 else bpc - 5
                    note(CH["bass"][0], st + 2.5, 0.9, fifth, 58)
                    note(CH["bass"][0], st + 3.5, 0.45, bpc + 12, 50)
                else:
                    note(CH["bass"][0], st + 1.5, 0.45, bpc, 54)
            elif arr["bass"] == "final":
                note(CH["bass"][0], st, 12, bpc, 60, human=False)

            # piano
            pmode = arr["piano"]
            if pmode in ("arp", "arp2", "intro"):
                ct = voicing(root, [0, 7, 12, 4 + 12, 14 if 14 in ivs or 2 in ivs else 7 + 12], 62, 81)
                ct = sorted(ct)
                if pmode == "arp":
                    pat = [0, 2, 3, 1, 4 % len(ct), 2, 3, 1]
                    vels = [54, 42, 46, 40, 50, 42, 46, 40]
                elif pmode == "arp2":
                    pat = [0, 1, 2, 3, 2, 1, 3, 2]
                    vels = [52, 40, 44, 40, 48, 40, 44, 40]
                else:   # intro: gentle quarter notes rising
                    pat = [0, None, 1, None, 2, None, 3, None]
                    vels = [36, 0, 40, 0, 44, 0, 48, 0]
                for k in range(int(ln * 2)):
                    i = pat[k % 8]
                    if i is None:
                        continue
                    p = ct[min(i, len(ct) - 1)]
                    dur = 0.9 if pmode == "intro" else 0.6
                    note(CH["piano"][0], st + k * 0.5, dur, p, vels[k % 8])
            elif pmode == "sparse":
                # one soft broken chord per chord change
                ct = sorted(voicing(root, ivs, 62, 78))
                for k, p in enumerate(ct[:3]):
                    note(CH["piano"][0], st + k * 0.5 + (1 if ln == 4 else 0), ln - k * 0.5, p, 44 - k * 3)
            elif pmode == "final" and bi == 0:
                ct = sorted(voicing(root, ivs, 62, 79))
                note(CH["piano"][0], st, 12, 38, 46, human=False)
                note(CH["piano"][0], st, 12, 50, 44, human=False)
                for k, p in enumerate(ct):
                    note(CH["piano"][0], st + 0.25 * k, 12 - 0.25 * k, p, 46 - 2 * k, human=False)

            # EP chords
            if arr["ep"] == "half":
                for h in range(0, ln, 2):
                    for p in voicing(root, ivs, 60, 72):
                        note(CH["ep"][0], st + h, 1.9, p, 46)
            elif arr["ep"] == "offbeat":
                for h in (0.5, 1.5, 2.5, 3.5):
                    if h >= ln:
                        continue
                    for p in voicing(root, ivs, 60, 72):
                        note(CH["ep"][0], st + h, 0.35, p, 38)

            # pizzicato
            pz = arr["pizz"]
            if pz:
                ct = sorted(voicing(root, [0, 7, 12, 4], 50, 69))
                rhythm = [(0, 0), (1.5, 1), (2.5, 2), (3, 3)] if pz == "a" else \
                         [(0, 0), (0.5, 2), (2, 1), (3, 3), (3.5, 2)]
                for rb, i in rhythm:
                    if rb >= ln:
                        continue
                    note(CH["pizz"][0], st + rb, 0.4, ct[min(i, len(ct) - 1)], 56 if rb == 0 else 48)

            # drums (brush kit) - very light
            dr = arr["drums"]
            if dr:
                for k in range(int(ln * 2)):
                    bt = st + k * 0.5
                    v = 40 if k % 2 == 0 else 30
                    note(9, bt, 0.25, 70, v)          # maracas/shaker-type
                    if dr == "light":
                        if k % 4 == 0 and (off + k * 0.5) % 4 == 0:
                            note(9, bt, 0.3, 36, 42)  # soft kick on 1
                        if (off + k * 0.5) % 4 in (1, 3):
                            note(9, bt, 0.3, 38, 34)  # brush snare on 2 & 4
                    if dr == "shaker" and (off + k * 0.5) % 4 == 2:
                        note(9, bt, 0.3, 36, 32)

    # melodies / sparkles for this section
    key = arr["cel"]
    if key:
        for ob, p, d, v in MEL[key]:
            note(CH["cel"][0], sbeat + ob, d, p, v)
    g = arr["glock"]
    if g:
        for ob, p, d, v in GLOCK[g if isinstance(g, str) else name]:
            note(CH["glock"][0], sbeat + ob, d, p, v)

# ---------------------------------------------------------------- controllers
end_beat = TOTAL_BARS * 4
for name, (ch, prog, bank, pan, rev, cho) in CH.items():
    if bank:
        events.append((0, -2, ch, mido.Message("control_change", channel=ch, control=0, value=bank)))
    events.append((0, -1, ch, mido.Message("program_change", channel=ch, program=prog)))
    cc(ch, 0, 7, {"pad": 92, "warm": 74, "piano": 100, "ep": 82, "bass": 96, "pizz": 80,
                  "cel": 84, "glock": 64, "drums": 70}[name])
    cc(ch, 0, 10, pan)
    cc(ch, 0, 91, rev)
    cc(ch, 0, 93, cho)
    # smooth expression curve (every 1/2 beat)
    for k in range(0, end_beat * 2 + 1):
        beat = k / 2
        val = intensity(beat / 4)
        if name == "pad":
            val = val * 0.95
        if name in ("pad", "warm") and beat < 12:
            val = 30 + (val - 30) * (beat / 12)      # intro swell of pads
        cc(ch, beat, 11, val)
# sustain pedal for the final piano chord
cc(CH["piano"][0], 62 * 4 - 0.1, 64, 127)

# ---------------------------------------------------------------- save
mid = mido.MidiFile(ticks_per_beat=TPB)
tr = mido.MidiTrack()
mid.tracks.append(tr)
tr.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(BPM), time=0))
tr.append(mido.MetaMessage("time_signature", numerator=4, denominator=4, time=0))
tr.append(mido.MetaMessage("key_signature", key="D", time=0))
tr.append(mido.MetaMessage("track_name", name="Antibiotics underscore (D major, 96 BPM)", time=0))
events.sort(key=lambda e: (e[0], e[1]))
last = 0
for tick, _, _, msg in events:
    tr.append(msg.copy(time=tick - last))
    last = tick
# release everything at the very end
tail = t(end_beat) - last
tr.append(mido.Message("control_change", channel=CH["piano"][0], control=64, value=0, time=max(0, tail)))
tr.append(mido.MetaMessage("end_of_track", time=0))
mid.save(OUT)
print(f"wrote {OUT}: {mid.length:.2f} s, {sum(1 for e in events if e[3].type == 'note_on')} notes")
