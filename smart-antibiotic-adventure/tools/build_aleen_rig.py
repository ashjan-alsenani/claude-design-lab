"""Split Aleen's approved cut-out into animation layers WITHOUT altering her look.

Input : source-art/aleen-cutout-full.png  (background-removed supplied image)
Output: src/assets/aleen-rig/{body,head,hands}.webp  (same canvas size)

- head : the head + hijab with a soft elliptical mask (rotates a few degrees)
- hands: the clasped hands + sleeve cuffs, feathered into the sleeves (lifts for gestures)
- body : everything else; the hard head core is removed and the area behind the
         hands is filled from the surrounding navy dress (OpenCV inpainting) so a
         lifted hand never reveals a hole.
Layered back together at rest, the three layers reproduce the original image.
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

# ---------- head (ellipse in source pixels) ----------
CX, CY, RX, RY = 286.0, 146.0, 111.0, 139.0
d = np.sqrt(((xx - CX) / RX) ** 2 + ((yy - CY) / RY) ** 2)
head_a = np.clip((1.10 - d) / (1.10 - 0.96), 0, 1)      # opaque core to 0.96, fades out by 1.10
body_cut = np.clip((d - 0.86) / 0.02, 0, 1)             # body loses the core inside 0.86

# ---------- hands + cuffs ----------
r, g, b, a = [src[..., i].astype(np.float32) for i in range(4)]
lum = (r + g + b) / 3
skin = (r > 170) & (r - b > 45) & (g > 110) & (a > 0)
sleeve = (lum > 175) & (b >= r - 15) & (a > 0)
box = (xx > 250) & (xx < 458) & (yy > 600) & (yy < 760)
hands = (skin & box & (yy > 630)) | (sleeve & box & (yy > 600))
hands = cv2.morphologyEx(hands.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
hands = cv2.dilate(hands, np.ones((3, 3), np.uint8))
# keep the largest blobs only (both hands + cuffs)
n, lab, stats, _ = cv2.connectedComponentsWithStats(hands)
keep = np.zeros_like(hands)
for i in np.argsort(-stats[1:, cv2.CC_STAT_AREA])[:3] + 1:
    if stats[i, cv2.CC_STAT_AREA] > 300:
        keep[lab == i] = 1
fade = np.clip((yy - 600) / 45, 0, 1)                   # sleeves fade in from above the cuffs
hands_a = cv2.GaussianBlur(keep.astype(np.float32), (5, 5), 0) * fade

# ---------- body: inpaint behind the hands ----------
# the whole hand silhouette (incl. soft edges, which sit over the navy dress) below the sleeve fade
hole = ((cv2.dilate((keep > 0).astype(np.uint8), np.ones((5, 5), np.uint8)) > 0) & (yy > 648)).astype(np.uint8) * 255
bgr = cv2.cvtColor(src[..., :3], cv2.COLOR_RGB2BGR)
filled = cv2.cvtColor(cv2.inpaint(bgr, hole, 9, cv2.INPAINT_TELEA), cv2.COLOR_BGR2RGB).astype(np.float32)
# pull the fill toward the real dress navy around the hole (avoids light smudges)
ring = (cv2.dilate(hole, np.ones((15, 15), np.uint8)) > 0) & (hole == 0) & (lum < 90) & (a > 200)
navy = np.median(src[..., :3][ring], axis=0).astype(np.float32)
filled = filled * 0.3 + navy * 0.7
filled = cv2.GaussianBlur(filled, (0, 0), 1.2).astype(np.uint8)
body = src.copy()
body[..., :3] = np.where(hole[..., None] > 0, filled, src[..., :3])
body[..., 3] = (src[..., 3].astype(np.float32) * body_cut).astype(np.uint8)
# keep the dress silhouette: inpainted pixels only where the original was opaque
body[..., 3] = np.where(hole > 0, src[..., 3], body[..., 3])


def save(name, rgb, alpha):
    im = np.dstack([rgb, np.clip(alpha, 0, 255).astype(np.uint8)])
    Image.fromarray(im, 'RGBA').save(os.path.join(out, f'{name}.webp'), quality=90, method=6)


save('body', body[..., :3], body[..., 3])
save('head', src[..., :3], src[..., 3].astype(np.float32) * head_a)
save('hands', src[..., :3], src[..., 3].astype(np.float32) * hands_a)
print('canvas', W, H)
for f in ('body', 'head', 'hands'):
    print(f, os.path.getsize(os.path.join(out, f + '.webp')) // 1024, 'KB')
