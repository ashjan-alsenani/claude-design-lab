"""Split Aleen's approved cut-out into animation layers WITHOUT altering her look.

Input : source-art/aleen-cutout-full.png  (background-removed supplied image)
Output: src/assets/aleen-rig/{skirt,torso,hands,head}.webp  (same canvas size)

- head : head + hijab with a soft elliptical mask (tilts, nods)
- torso: upper body above the waist seam + both sleeves + the backpack
         (leans, breathes, shifts posture, shrugs); the head core is removed
- hands: the clasped hands + cuffs, feathered into the sleeves (gestures)
- skirt: everything below the waist seam; wherever the torso or hands cover the
         dress, it is rebuilt from the same pleats lower on the skirt (shading
         matched), so movement never reveals a hole.
Layered back together at rest, the four layers reproduce the original image.
"""
import os
import numpy as np, cv2
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = np.array(Image.open(os.path.join(ROOT, 'source-art/aleen-cutout-full.png')).convert('RGBA'))
H, W = src.shape[:2]
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
out = os.path.join(ROOT, 'src/assets/aleen-rig')
os.makedirs(out, exist_ok=True)
r, g, b, a = [src[..., i].astype(np.float32) for i in range(4)]
lum = (r + g + b) / 3
SEAM = 515.0  # the bodice / skirt seam

# ---------- head (ellipse in source pixels) ----------
CX, CY, RX, RY = 286.0, 146.0, 111.0, 139.0
d = np.sqrt(((xx - CX) / RX) ** 2 + ((yy - CY) / RY) ** 2)
head_a = np.clip((1.10 - d) / (1.10 - 0.96), 0, 1)
body_cut = np.clip((d - 0.86) / 0.02, 0, 1)

# ---------- hands + cuffs ----------
skin = (r > 170) & (r - b > 45) & (g > 110) & (a > 0)
sleeve = (lum > 175) & (b >= r - 15) & (a > 0)
box = (xx > 250) & (xx < 458) & (yy > 600) & (yy < 760)
hands = (skin & box & (yy > 630)) | (sleeve & box & (yy > 600))
hands = cv2.morphologyEx(hands.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
hands = cv2.dilate(hands, np.ones((3, 3), np.uint8))
n, lab, stats, _ = cv2.connectedComponentsWithStats(hands)
keep = np.zeros_like(hands)
for i in np.argsort(-stats[1:, cv2.CC_STAT_AREA])[:3] + 1:
    if stats[i, cv2.CC_STAT_AREA] > 300:
        keep[lab == i] = 1
hands_a = cv2.GaussianBlur(keep.astype(np.float32), (5, 5), 0) * np.clip((yy - 600) / 45, 0, 1)
# the soft edge must not carry dark dress pixels along when the hands move
hands_a *= np.clip((lum - 70) / 60, 0, 1)
hands_hole = ((cv2.dilate(keep, np.ones((5, 5), np.uint8)) > 0) | (skin & box)) & (yy > 648)

# ---------- what belongs to the upper body below the seam: sleeves, backpack ----------
navy = (lum < 95) & (b > r + 15)
upper_below = (a > 200) & ~navy & (yy > SEAM - 10) & (yy < 800)
upper_below = cv2.morphologyEx(upper_below.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
n, lab, stats, _ = cv2.connectedComponentsWithStats(upper_below)
ub = np.zeros_like(upper_below)
for i in range(1, n):
    if stats[i, cv2.CC_STAT_AREA] > 400:
        ub[lab == i] = 1
ub = cv2.dilate(ub, np.ones((5, 5), np.uint8)).astype(bool) & (a > 0)

# torso alpha: everything above the seam (soft band), plus sleeves/backpack below it
above = np.clip((SEAM + 12 - yy) / 24, 0, 1)
ub_soft = cv2.GaussianBlur(ub.astype(np.float32), (5, 5), 0)
torso_a = np.maximum(above, ub_soft * (yy < 800)) * body_cut
# below the seam the torso carries only sleeves/backpack — never dress pixels
torso_a = np.where(yy > SEAM + 12, torso_a * np.clip((lum - 70) / 60, 0, 1), torso_a)
torso_a = np.where(yy > 648, torso_a * (1 - hands_a), torso_a)   # the hands layer takes over below the cuffs

# ---------- skirt: below the seam, with the covered dress filled in ----------
# dress outline behind the backpack / sleeves (straight flare from the seam)
left = 178 - 0.17 * (yy - SEAM)
right = 395 + 0.4 * (yy - SEAM)
inside = (xx > left) & (xx < right) & (yy > SEAM - 30)
# the hands' contact shadow goes too (CSS gives the moving hands their own soft shadow)
hands_rim = (cv2.dilate(hands_hole.astype(np.uint8), np.ones((13, 13), np.uint8)) > 0) & (lum < 120)
hole = ((ub | hands_hole | hands_rim) & inside & (yy > SEAM - 4)).astype(np.uint8)
hole = (cv2.dilate(hole, np.ones((5, 5), np.uint8)) > 0) & inside
hole8 = hole.astype(np.uint8) * 255
# The pleated dress continues straight down, so the hidden part is rebuilt from the
# same pleats lower on the skirt (shifted up), then matched to the local shading.
SHIFT = 230
rgbf = src[..., :3].astype(np.float32)
below = np.zeros_like(rgbf)
below[:-SHIFT] = rgbf[SHIFT:]
ring = (cv2.dilate(hole8, np.ones((25, 25), np.uint8)) > 0) & ~hole & navy & (a > 200)
ring_below = np.zeros_like(ring)
ring_below[:-SHIFT] = (navy & (a > 200))[SHIFT:]
use = ring & ring_below
gain = rgbf[use].mean(0) / np.maximum(below[use].mean(0), 1)
filled = below * gain
soft = cv2.GaussianBlur(hole.astype(np.float32), (0, 0), 2.0)[..., None]
skirt = src[..., :3].astype(np.float32).copy()
skirt = skirt * (1 - soft) + filled * soft
# outside the dress outline, the backpack/sleeve area is background (transparent)
skirt_a = np.where(ub & ~inside, 0, a)
skirt_a = np.where(hole & (a > 200), 255, skirt_a)
skirt_a = skirt_a * np.clip((yy - (SEAM - 22)) / 14, 0, 1)   # fades out just above the seam


def save(name, rgb, alpha):
    im = np.dstack([np.clip(rgb, 0, 255).astype(np.uint8), np.clip(alpha, 0, 255).astype(np.uint8)])
    Image.fromarray(im, 'RGBA').save(os.path.join(out, f'{name}.webp'), quality=90, method=6)


save('skirt', skirt, skirt_a)
save('torso', src[..., :3], a * torso_a)
save('head', src[..., :3], a * head_a)
save('hands', src[..., :3], a * hands_a)
old = os.path.join(out, 'body.webp')
if os.path.exists(old):
    os.remove(old)
print('canvas', W, H)
for f in ('skirt', 'torso', 'hands', 'head'):
    print(f, os.path.getsize(os.path.join(out, f + '.webp')) // 1024, 'KB')
