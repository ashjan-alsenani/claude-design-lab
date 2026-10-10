"""Design system + timeline engine for the «مفكّرة عروسة العُمر» campaign.

Every ad is a self-contained HTML page (1080×1920) whose look at time t is fully decided by
window.render(t). tools/render.cjs steps t at 30 fps and screenshots each frame; ffmpeg encodes.
Nothing here depends on wall-clock time, so a frame is identical every time it is rendered.
"""
import json, pathlib, html as _html

ROOT = pathlib.Path(__file__).resolve().parent.parent
ICONS = json.loads((ROOT / "tools" / "icons.json").read_text())
SHOT_W = 390  # CSS width of every product capture (captured at 3x = 1170 px)

AR_DIGITS = str.maketrans("0123456789,%", "٠١٢٣٤٥٦٧٨٩٬٪")
def ar(s):
    return str(s).translate(AR_DIGITS)

def icon(name, weight="light", size=40, color="currentColor", style=""):
    svg = ICONS[f"{name}-{weight}"]
    return f'<span class="ic" style="width:{size}px;height:{size}px;color:{color};{style}">{svg}</span>'

HEART = lambda size=34, color="var(--rose-d)": icon("Heart", "fill", size, color, "vertical-align:-0.12em;margin-inline:6px")
SPARK = lambda size=34, color="var(--gold)": icon("Sparkle", "fill", size, color, "vertical-align:-0.1em;margin-inline:6px")

def esc(s):
    return _html.escape(s, quote=False)

def rich(s):
    """Caption/headline markup: {h} = small heart, {s} = sparkle, *word* = accent colour."""
    out = s.replace("{h}", HEART()).replace("{s}", SPARK())  # authored copy only: markup such as <br> is intentional
    parts = out.split("*")
    return "".join(f'<em>{p}</em>' if i % 2 else p for i, p in enumerate(parts))

# ---------------------------------------------------------------- base CSS
def css(rel):
    f = f"{rel}/assets/fonts"
    return f"""
@font-face{{font-family:Amiri;src:url({f}/amiri-arabic-700-normal.woff2) format('woff2');font-weight:700;unicode-range:U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF,U+200C-200F}}
@font-face{{font-family:Amiri;src:url({f}/amiri-arabic-400-normal.woff2) format('woff2');font-weight:400;unicode-range:U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF,U+200C-200F}}
@font-face{{font-family:Amiri;src:url({f}/amiri-latin-700-normal.woff2) format('woff2');font-weight:700}}
""" + "".join(f"""
@font-face{{font-family:Plex;src:url({f}/ibm-plex-sans-arabic-arabic-{w}-normal.woff2) format('woff2');font-weight:{w};unicode-range:U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF,U+200C-200F}}
@font-face{{font-family:Plex;src:url({f}/ibm-plex-sans-arabic-latin-{w}-normal.woff2) format('woff2');font-weight:{w}}}""" for w in (400, 500, 600, 700)) + f"""
@font-face{{font-family:Corm;src:url({f}/cormorant-garamond-latin-600-normal.woff2) format('woff2');font-weight:600}}
@font-face{{font-family:Corm;src:url({f}/cormorant-garamond-latin-500-italic.woff2) format('woff2');font-weight:500;font-style:italic}}
:root{{
  --ivory:#FBF6EF; --warm:#FFFCF7; --champ:#E8DAC3; --champ-l:#F3EADB; --beige:#EFE4D6;
  --blush:#EFD9D2; --blush-l:#F7EAE5; --rose:#C9979A; --rose-d:#9A5F63; --gold:#B19363; --gold-l:#D9C49C;
  --sage:#A7BBA2; --sage-d:#5E7C5C; --brown:#3A2A23; --brown-s:#6E5A4F; --muted:#97857A;
}}
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{width:1080px;height:1920px;overflow:hidden;background:var(--ivory)}}
body{{font-family:Plex,sans-serif;color:var(--brown);direction:rtl;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}}
.stage{{position:relative;width:1080px;height:1920px;overflow:hidden;background:var(--ivory)}}
.L{{position:absolute}} .fill{{position:absolute;inset:0}}
.ic{{display:inline-block;line-height:0}} .ic svg{{width:100%;height:100%}}
em{{font-style:normal;color:var(--rose-d)}}
.serif{{font-family:Amiri,serif;font-weight:700}}
.latin{{font-family:Corm,serif}}
/* light + paper */
.bg{{position:absolute;inset:0;background:
  radial-gradient(60% 38% at 82% 10%, rgba(239,217,210,.9), rgba(239,217,210,0) 70%),
  radial-gradient(55% 35% at 10% 92%, rgba(232,218,195,.85), rgba(232,218,195,0) 70%),
  linear-gradient(180deg,#FFFCF7 0%,#FBF4EC 55%,#F6EDE2 100%)}}
.glow{{position:absolute;border-radius:50%;filter:blur(60px);opacity:.55}}
.grain{{position:absolute;inset:0;opacity:.07;mix-blend-mode:multiply;pointer-events:none;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .35  0 0 0 0 .27  0 0 0 0 .22  0 0 0 .9 0'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>")}}
.vignette{{position:absolute;inset:0;background:radial-gradient(120% 80% at 50% 45%,rgba(0,0,0,0) 60%,rgba(80,55,40,.10) 100%)}}
/* typography */
.hook{{position:absolute;left:90px;right:130px;top:250px;text-align:center}}
.hook h1{{font-family:Amiri,serif;font-weight:700;font-size:100px;line-height:1.28;color:var(--brown);letter-spacing:0}}
.hook p{{font-family:Plex;font-weight:500;font-size:40px;color:var(--brown-s);margin-top:18px}}
.kicker{{font-family:Plex;font-weight:600;font-size:30px;letter-spacing:.5px;color:var(--gold)}}
.label{{position:absolute;left:90px;right:130px;top:250px;text-align:center}}
.label .k{{display:inline-flex;align-items:center;gap:14px;font-family:Plex;font-weight:600;font-size:32px;color:var(--gold);}}
.label .k::before,.label .k::after{{content:"";width:46px;height:1.5px;background:var(--gold-l)}}
.label h2{{font-family:Amiri;font-weight:700;font-size:74px;line-height:1.3;margin-top:10px}}
/* captions: bottom safe zone, never under the right-side IG controls */
.capwrap{{position:absolute;left:90px;right:150px;bottom:420px;display:flex;justify-content:center;z-index:15}}
.cap{{display:inline-block;max-width:840px;text-align:center;font-family:Plex;font-weight:600;font-size:46px;line-height:1.45;
  color:#FFF9F2;background:rgba(58,42,35,.66);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  padding:16px 36px 20px;border-radius:30px;box-shadow:0 18px 40px -22px rgba(58,42,35,.55)}}
.cap em{{color:#F3D3CF}}
.cap.light{{color:var(--brown);background:rgba(255,252,247,.82);border:1.5px solid rgba(177,147,99,.35)}}
.cap.light em{{color:var(--rose-d)}}
/* phone */
.phone{{position:absolute;border-radius:74px;background:linear-gradient(145deg,#4a3a33,#211813 60%,#3b2e28);padding:15px;
  box-shadow:0 60px 110px -50px rgba(70,45,30,.65),0 24px 50px -30px rgba(70,45,30,.45),inset 0 0 0 1.5px rgba(255,235,210,.18)}}
.phone .scr{{position:relative;width:100%;height:100%;border-radius:59px;overflow:hidden;background:#FFFCF8}}
.phone .scr img{{position:absolute;left:0;top:0;width:100%;display:block}}
.phone .isl{{position:absolute;top:30px;left:50%;width:128px;height:36px;margin-left:-64px;border-radius:20px;background:#1a1310;z-index:5}}
.phone .glass{{position:absolute;inset:0;border-radius:59px;background:linear-gradient(115deg,rgba(255,255,255,.16) 0%,rgba(255,255,255,0) 32%);pointer-events:none;z-index:4}}
/* zoom card: a magnified crop of a real capture */
.zoom{{position:absolute;border-radius:38px;overflow:hidden;background-repeat:no-repeat;background-color:#FFFCF8;
  box-shadow:0 50px 90px -40px rgba(80,50,35,.55),0 0 0 1.5px rgba(177,147,99,.35)}}
.zoom .sheen,.sheen{{position:absolute;inset:0;overflow:hidden;pointer-events:none}}
.sheen i{{position:absolute;top:-20%;bottom:-20%;width:34%;background:linear-gradient(100deg,rgba(255,255,255,0),rgba(255,250,240,.65),rgba(255,255,255,0));transform:translateX(-140%) skewX(-12deg)}}
/* paper props */
.card{{background:#FFFDF9;border-radius:30px;box-shadow:0 36px 70px -40px rgba(80,50,35,.5),0 0 0 1.5px rgba(232,218,195,.9)}}
.pill{{display:inline-flex;align-items:center;gap:14px;border-radius:999px}}
.hair{{height:1.5px;background:linear-gradient(90deg,rgba(177,147,99,0),rgba(177,147,99,.7),rgba(177,147,99,0))}}
/* end card */
.end{{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 140px 260px 90px}}
.mark{{width:118px;height:118px;border-radius:36px;display:grid;place-items:center;background:linear-gradient(150deg,#D7A9AA,#B47D80);box-shadow:0 22px 44px -22px rgba(154,95,99,.8),inset 0 0 0 1.5px rgba(255,240,235,.4)}}
.pname{{font-family:Amiri;font-weight:700;font-size:112px;line-height:1.2;color:var(--brown)}}
.oc{{font-family:Corm;font-weight:600;font-size:52px;color:var(--brown-s);letter-spacing:1px}}
.cta{{display:inline-flex;align-items:center;gap:18px;padding:30px 64px 34px;border-radius:999px;font-family:Plex;font-weight:600;font-size:46px;color:#FFF9F2;
  background:linear-gradient(180deg,#A8696D,#8E5559);box-shadow:0 24px 44px -24px rgba(142,85,89,.9),inset 0 1.5px 0 rgba(255,235,230,.35)}}
.bio{{display:inline-flex;align-items:center;gap:12px;font-family:Plex;font-weight:500;font-size:34px;color:var(--brown-s)}}
"""

ENGINE = r"""
<script>
(function(){
const C=x=>Math.max(0,Math.min(1,x));
const eo=x=>1-Math.pow(1-C(x),3), eio=x=>{x=C(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}, es=x=>{x=C(x);return x*x*(3-2*x)};
const Q=s=>[...document.querySelectorAll(s)];
const AR=n=>String(n).replace(/[0-9]/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const fmt=(n,sep)=>{const s=Math.round(n).toString();return AR(sep?s.replace(/\B(?=(\d{3})+(?!\d))/g,'٬'):s)};
const keys=s=>s.split(';').map(k=>k.split(':').map(Number));
const atKeys=(ks,t,ease)=>{if(t<=ks[0][0])return ks[0].slice(1);for(let i=1;i<ks.length;i++){if(t<=ks[i][0]){const a=ks[i-1],b=ks[i],p=(ease||eio)((t-a[0])/(b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*p)}}return ks[ks.length-1].slice(1)};
window.render=function(t){
  Q('[data-in]').forEach(el=>{
    const a=+el.dataset.in,b=el.dataset.out?+el.dataset.out:1e9,fx=el.dataset.fx||'rise',d=+(el.dataset.d||.7),od=+(el.dataset.od||.5);
    const p=eo((t-a)/d),q=es((t-b)/od),o=C((t-a)/(d*.7))*(1-q);
    let tr='',fl='',cp='';
    if(fx==='rise')tr=`translateY(${(1-p)*46-q*18}px)`;
    if(fx==='blur'){tr=`scale(${1.035-.035*p})`;fl=`blur(${(1-p)*16+q*10}px)`}
    if(fx==='scale')tr=`scale(${.92+.08*p})`;
    if(fx==='drop')tr=`translateY(${(1-p)*-60}px) rotate(${(1-p)*(+el.dataset.rot||0)}deg)`;
    if(fx==='mask'){cp=`inset(${(1-p)*100}% 0 0 0 round 0)`;}
    if(fx==='maskx'){cp=`inset(0 0 0 ${(1-p)*100}%)`;}
    if(fx==='fade')tr='';
    if(el.dataset.outfx==='scatter'&&q>0){const dx=+el.dataset.dx||0,dy=+el.dataset.dy||0;tr+=` translate(${dx*q}px,${dy*q}px) rotate(${(+el.dataset.rot||0)*q*2}deg)`;fl=`blur(${q*14}px)`}
    el.style.opacity=o; el.style.transform=tr+(el.dataset.base?' '+el.dataset.base:''); el.style.filter=fl; if(cp)el.style.clipPath=cp;
  });
  Q('[data-kb]').forEach(el=>{const v=atKeys(keys(el.dataset.kb),t);el.style.transform=`translate(${v[0]}px,${v[1]}px) scale(${v[2]})`});
  Q('[data-scroll]').forEach(el=>{const v=atKeys(keys(el.dataset.scroll),t);el.style.transform=`translateY(${-v[0]}px)`});
  Q('[data-dim]').forEach(el=>{const v=atKeys(keys(el.dataset.dim),t,es);el.style.filter=`blur(${v[0]}px) saturate(${1-v[0]/40})`;el.style.opacity=v[1]===undefined?1:v[1]});
  Q('[data-count]').forEach(el=>{const [a,b,f,to]=el.dataset.count.split(',').map(Number);el.textContent=fmt(f+(to-f)*eo((t-a)/(b-a)),el.dataset.sep)+(el.dataset.suf||'')});
  Q('[data-ring]').forEach(el=>{const [a,b,f,to]=el.dataset.ring.split(',').map(Number);const v=f+(to-f)*eio((t-a)/(b-a));const c=el.querySelector('.arc');const L=+c.dataset.len;c.style.strokeDashoffset=L*(1-v/100)});
  Q('[data-bar]').forEach(el=>{const [a,b,f,to]=el.dataset.bar.split(',').map(Number);el.style.width=(f+(to-f)*eio((t-a)/(b-a)))+'%'});
  Q('[data-p]').forEach(el=>{const [a,d]=el.dataset.p.split(',').map(Number);el.style.setProperty('--p',eo((t-a)/(d||.45)))});
  Q('.sheen[data-at]').forEach(el=>{const a=+el.dataset.at;const k=C((t-a)/1.3);el.firstElementChild.style.transform=`translateX(${-140+k*420}%) skewX(-12deg)`});
  Q('[data-float]').forEach((el,i)=>{const a=+el.dataset.float;el.style.translate=`${Math.sin(t*.7+i*1.7)*a}px ${Math.cos(t*.55+i)*a*1.3}px`});
  Q('.glow').forEach((el,i)=>{el.style.translate=`${Math.sin(t*.25+i*2)*40}px ${Math.cos(t*.2+i)*30}px`});
};
render(0);
})();
</script>"""

# ---------------------------------------------------------------- components
def A(t0, t1=None, fx="rise", d=None, od=None, extra=""):
    s = f' data-in="{t0}"' + (f' data-out="{t1}"' if t1 is not None else "") + f' data-fx="{fx}"'
    if d: s += f' data-d="{d}"'
    if od: s += f' data-od="{od}"'
    return s + (" " + extra if extra else "")

def background(glows=True):
    g = ""
    if glows:
        g = ('<span class="glow" style="width:620px;height:620px;right:-160px;top:-120px;background:#F2D9D3"></span>'
             '<span class="glow" style="width:560px;height:560px;left:-180px;bottom:120px;background:#EADBC2"></span>')
    return f'<div class="bg"></div>{g}'

def overlay():
    return '<div class="vignette"></div><div class="grain"></div>'

def hook(text, t0=-0.3, t1=None, sub=None, top=250, size=100, fx="blur", width=None):
    w = f"left:{(1080-width)//2 - 20}px;right:{(1080-width)//2 + 20}px;" if width else ""
    return (f'<div class="hook" style="top:{top}px;{w}"{A(t0, t1, fx, d=0.8)}><h1 style="font-size:{size}px">{rich(text)}</h1>'
            + (f"<p>{rich(sub)}</p>" if sub else "") + "</div>")

def label(kicker, title, t0, t1=None, top=250):
    return f'<div class="label" style="top:{top}px"{A(t0, t1, "rise")}><span class="k">{rich(kicker)}</span>' + (f"<h2>{rich(title)}</h2>" if title else "") + "</div>"

def captions(segs):
    """segs: [(text, t0, t1, show, style)] -> burned caption layers (show=False keeps it out of the frame)."""
    out = ""
    for s in segs:
        text, a, b = s[0], s[1], s[2]
        if len(s) > 3 and not s[3]:
            continue
        cls = "cap light" if len(s) > 4 and s[4] == "light" else "cap"
        out += f'<div class="capwrap"{A(a, b, "rise", d=0.35, od=0.25)}><span class="{cls}">{rich(text)}</span></div>'
    return out

def phone(src, cx, top, w, t0, t1=None, scroll=None, kb=None, dim=None, fx="blur", z=3, rel="../.."):
    """A realistic phone with a REAL capture inside. scroll = 't:css_y;t:css_y' (CSS px of the 390-wide capture)."""
    k = w / SHOT_W
    sh = 844 * k
    sc = ""
    if scroll:
        pairs = [kv.split(":") for kv in scroll.split(";")]
        sc = ' data-scroll="' + ";".join(f"{float(a)}:{float(b) * k:.1f}" for a, b in pairs) + '"'
    kbattr = f' data-kb="{kb}"' if kb else ""
    dimattr = f' data-dim="{dim}"' if dim else ""
    W = w + 30
    return (f'<div class="L" style="left:{cx - W/2:.0f}px;top:{top}px;width:{W}px;z-index:{z}"{A(t0, t1, fx, d=0.9)}><div{kbattr}><div{dimattr}>'
            f'<div class="phone" style="width:{W}px;height:{sh + 30:.0f}px"><div class="scr"><img src="{rel}/assets/screenshots/{src}"{sc}><span class="glass"></span></div><span class="isl"></span></div>'
            f"</div></div></div>")

def zoom(src, region, w, left, top, t0, t1=None, sheen=None, fx="blur", z=6, rel="../..", radius=38, kb=None, od=None):
    """Magnified crop of a real capture. region = (x, y, w, h) in CSS px of the 390-wide capture."""
    x, y, rw, rh = region
    k = w / rw
    sh = f'<div class="sheen" data-at="{sheen}"><i></i></div>' if sheen is not None else ""
    kbattr = f' data-kb="{kb}"' if kb else ""
    return (f'<div class="L" style="left:{left}px;top:{top}px;width:{w}px;z-index:{z}"{A(t0, t1, fx, d=0.8, od=od)}><div{kbattr}>'
            f'<div class="zoom" style="width:{w}px;height:{rh*k:.0f}px;border-radius:{radius}px;background-image:url({rel}/assets/screenshots/{src});'
            f'background-size:{SHOT_W*k:.1f}px auto;background-position:{-x*k:.1f}px {-y*k:.1f}px">{sh}</div></div></div>')

def photo(src, t0, t1=None, kb="0:0:0:1.08;20:-30:-40:1.0", fx="fade", rel="../..", pos="50% 30%", extra=""):
    return (f'<div class="fill"{A(t0, t1, fx, d=1.0)}><div class="fill" data-kb="{kb}" style="background:url({rel}/assets/photos/{src}) {pos}/cover no-repeat"></div>{extra}</div>')

def ring(val_from, val_to, t0, t1, size=300, stroke=16, color="var(--sage-d)", track="rgba(167,187,162,.25)", label_html=""):
    r = (size - stroke) / 2
    L = 2 * 3.14159265 * r
    return (f'<div style="position:relative;width:{size}px;height:{size}px" data-ring="{t0},{t1},{val_from},{val_to}">'
            f'<svg width="{size}" height="{size}" viewBox="0 0 {size} {size}" style="transform:rotate(-90deg)">'
            f'<circle cx="{size/2}" cy="{size/2}" r="{r}" fill="none" stroke="{track}" stroke-width="{stroke}"/>'
            f'<circle class="arc" data-len="{L:.1f}" cx="{size/2}" cy="{size/2}" r="{r}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-dasharray="{L:.1f}" stroke-dashoffset="{L:.1f}"/></svg>'
            f'<div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center">{label_html}</div></div>')

def endcard(t0, tagline, action, rel="../..", bio=True):
    mark = icon("Heart", "fill", 60, "#FFF7F2")
    return (f'<div class="fill" style="z-index:20"{A(t0, None, "fade", d=0.7)}><div class="bg"></div>'
            '<span class="glow" style="width:700px;height:700px;right:-200px;top:-160px;background:#F2D9D3;opacity:.6"></span>'
            '<span class="glow" style="width:600px;height:600px;left:-200px;bottom:200px;background:#EADBC2;opacity:.6"></span>'
            f'<div class="end">'
            f'<div class="mark"{A(t0+0.15, None, "scale", d=0.8)}>{mark}</div>'
            f'<div class="pname" style="margin-top:46px"{A(t0+0.3, None, "blur", d=0.9)}>مفكّرة عروسة العُمر</div>'
            f'<div style="display:flex;align-items:center;gap:20px;margin-top:10px"{A(t0+0.5, None, "rise")}><span class="hair" style="width:90px"></span><span class="oc"><span style="font-family:Plex;font-weight:500;font-size:36px">على</span>&nbsp; OneClick</span><span class="hair" style="width:90px"></span></div>'
            f'<div class="serif" style="font-size:62px;color:var(--rose-d);margin-top:58px;line-height:1.35"{A(t0+0.7, None, "rise")}>{rich(tagline)}</div>'
            f'<div style="margin-top:64px"{A(t0+0.95, None, "scale", d=0.6)}><span class="cta">{rich(action)}</span></div>'
            + (f'<div style="margin-top:34px"{A(t0+1.15, None, "rise")}><span class="bio">{icon("ArrowUp", "regular", 30, "var(--rose-d)")}الرابط في البايو</span></div>' if bio else "")
            + "</div></div>")

def page(body, rel="../..", title="ad"):
    return (f'<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>{esc(title)}</title><style>{css(rel)}</style></head>'
            f'<body><div class="stage">{body}{overlay()}</div>{ENGINE}</body></html>')
