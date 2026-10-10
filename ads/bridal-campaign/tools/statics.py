"""Static ads: 4:5 feed (1080×1350) and 9:16 story (1080×1920) versions of each.
Same design system and real product captures as the reels; rendered as a single still (window.render at t=20)."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from ads import R, D, chat, notes, remind, STOPS

def spage(body, W, H, title):
    extra = f"html,body,.stage{{width:{W}px!important;height:{H}px!important}}"
    return (f'<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>{title}</title><style>{css("../..")}{extra}</style></head>'
            f'<body><div class="stage">{body}{overlay()}</div>{ENGINE}</body></html>')

def brand(top, W=1080, cta=None, bio=True):
    c = f'<span class="cta" style="font-size:36px;padding:22px 46px 26px">{rich(cta)}</span>' if cta else ""
    band = f'<div class="L" style="left:0;right:0;top:{top-70}px;bottom:0;z-index:11;background:linear-gradient(180deg,rgba(251,246,239,0),rgba(251,246,239,.97) 38%)"></div>'
    return band + (f'<div class="L" style="left:70px;right:70px;top:{top}px;display:flex;align-items:center;justify-content:space-between;z-index:12">'
            f'<div style="display:flex;align-items:center;gap:20px"><span class="mark" style="width:86px;height:86px;border-radius:26px">{icon("Heart","fill",44,"#FFF7F2")}</span>'
            f'<div><div class="serif" style="font-size:50px;line-height:1.1">مفكّرة عروسة العُمر</div><div class="oc" style="font-size:32px"><span style="font-family:Plex;font-size:24px;font-weight:500">على</span> OneClick'
            + (' <span style="font-family:Plex;font-size:24px;font-weight:500;color:var(--muted)">· الرابط في البايو</span>' if bio else "") + '</div></div></div>'
            f'{c}</div>')

def S01(W, H):
    k = int(H > 1500)
    return (background()
            + f'<div class="L" style="left:70px;right:70px;top:{[80, 250][k]}px;text-align:center;z-index:6"><h1 class="serif" style="font-size:{[90, 104][k]}px;line-height:1.3">زواجك له<br><em>ألف تفصيلة…</em></h1>'
            f'<p class="serif" style="font-size:{[56, 64][k]}px;color:var(--brown-s);margin-top:6px">خليها كلها بمكان واحد.</p></div>'
            + phone(D, 330, [500, 760][k], [360, 420][k], -9, None, fx="fade", z=6)
            + zoom(D, (16, 93, 358, 170), [520, 560][k], [500, 470][k], [640, 920][k], -9, None, fx="fade", z=8)
            + zoom(D, R["week"][:3] + (200,), [520, 560][k], [500, 470][k], [640, 920][k] + [270, 300][k], -9, None, fx="fade", z=8)
            + brand([1210, 1600][k], W, cta="ابدئي رحلتك"))

def S02(W, H):
    tall = H > 1500; k = int(tall)
    return (background()
            + f'<div class="L kicker" style="left:0;right:0;top:{[90, 250][k]}px;text-align:center;font-size:34px">مفكّرة عروسة العُمر</div>'
            + f'<div class="L" style="left:60px;right:60px;top:{[150, 320][k]}px;display:flex;align-items:center;justify-content:center;gap:56px">'
            f'<div style="text-align:center"><div class="serif" style="font-size:{[250, 290][k]}px;line-height:1;color:var(--rose-d)">١٨٧</div><div class="serif" style="font-size:58px;color:var(--brown)">باقي على زفافك</div></div>'
            + ring(42, 42, 0, 0.1, [270, 300][k], 18, label_html='<div><div class="serif" style="font-size:84px;line-height:1">٤٢٪</div><div style="font-size:30px;font-weight:600;color:var(--sage-d)">جاهزة</div></div>')
            + "</div>"
            + zoom(D, (16, 225, 358, 190), [800, 880][k], [140, 100][k], [640, 900][k], -9, None, fx="fade")
            + brand([1210, 1600][k], W, cta="ابدئي رحلتك"))

def S03(W, H):
    k = int(H > 1500)
    return (background()
            + f'<div class="L" style="left:70px;right:70px;top:{[90, 250][k]}px;text-align:center"><h1 class="serif" style="font-size:{[88, 100][k]}px;line-height:1.3">وش باقي عليك<br><em>هالأسبوع؟</em></h1></div>'
            + zoom(D, (16, 911, 358, [330, 420][k]), [760, 860][k], [160, 110][k], [380, 600][k], -9, None, fx="fade")
            + brand([1210, 1600][k], W, cta="رتّبي يومك من اليوم"))

def S04(W, H):
    k = int(H > 1500); top = [300, 460][k]
    before = (f'<div class="L" style="left:540px;top:0;width:540px;height:{H}px;overflow:hidden;background:#F3EADF">'
              + chat("وين رقم المصورة؟", "قروب البنات", 40, top + 70, -9, None, -4, w=420)
              + notes(60, top + 300, -9, None, 3, items=["عربون القاعة؟", "البروفة!", "الضيوف ٣؟", "ورد؟"])
              + remind("دفعة الديكور", "متأخرة يومين", 40, top + [690, 760][k], -9, None, -2, w=440)
              + f'<div class="L serif" style="top:{top - 120}px;left:0;right:0;text-align:center;font-size:80px;color:var(--muted)">قبل</div></div>')
    after = (f'<div class="L" style="left:0;top:0;width:540px;height:{H}px;overflow:hidden">'
             + phone(D, 270, top + 40, [360, 420][k], -9, None, fx="fade")
             + f'<div class="L serif" style="top:{top - 120}px;left:0;right:0;text-align:center;font-size:80px;color:var(--rose-d)">بعد</div></div>')
    head = (f'<div class="L" style="left:0;right:0;top:{[40, 170][k]}px;text-align:center;z-index:9"><h1 class="serif" style="font-size:{[64, 76][k]}px;line-height:1.3">من الفوضى… <em>إلى رحلة مرتبة.</em></h1></div>')
    div = f'<div class="L" style="left:539px;top:{top - 140}px;width:2px;height:{H - top}px;background:linear-gradient(180deg,rgba(177,147,99,0),var(--gold),rgba(177,147,99,0));z-index:7"></div>'
    foot = f'<div class="L" style="left:0;right:0;bottom:0;height:{[190, 330][k]}px;background:linear-gradient(180deg,rgba(251,246,239,0),var(--ivory) 45%);z-index:10"></div>'
    return background(False) + before + after + div + head + foot + brand([1230, 1620][k], W, bio=True)

def S05(W, H):
    k = int(H > 1500)
    return (background()
            + f'<div class="L" style="left:70px;right:70px;top:{[80, 250][k]}px;text-align:center"><h1 class="serif" style="font-size:{[82, 96][k]}px;line-height:1.3">مو لازم تتذكرين<br>كل شيء.</h1>'
            f'<p class="serif" style="font-size:{[60, 70][k]}px;color:var(--rose-d);margin-top:6px">إحنا تذكرناه لك.</p></div>'
            + zoom("checklist-tall.png", (16, 283, 358, 160), [760, 860][k], [160, 110][k], [430, 700][k], -9, None, fx="fade")
            + zoom("checklist-tall.png", (16, 565, 358, 172), [760, 860][k], [160, 110][k], [790, 1100][k], -9, None, fx="fade")
            + brand([1210, 1600][k], W, cta="اكتشفي المفكّرة"))

def S06(W, H):
    k = int(H > 1500)
    y0 = [380, 600][k]; step = [150, 190][k]
    nodes = ""
    for i, (n, sub, ic) in enumerate(STOPS):
        y = y0 + i * step; main = i == 2
        nodes += (f'<div class="L" style="left:100px;right:290px;top:{y+12}px;text-align:right;z-index:5"><div class="serif" style="font-size:{72 if main else 60}px;line-height:1.1;color:{"var(--rose-d)" if main else "var(--brown)"}">{n}</div>'
                  f'<div style="font-size:28px;font-weight:600;color:var(--muted)">{sub}</div></div>'
                  f'<div class="L" style="left:828px;top:{y+20}px;width:88px;height:88px;border-radius:50%;display:grid;place-items:center;z-index:6;background:{"linear-gradient(150deg,#D7A9AA,#B47D80)" if main else "#FFFDF9"};box-shadow:0 0 0 2px var(--gold-l),0 18px 30px -18px rgba(80,50,35,.6)">'
                  f'{icon(ic, "fill" if main else "light", 46, "#FFF7F2" if main else "var(--rose-d)")}</div>')
    line = f'<div class="L" style="left:870px;top:{y0+40}px;width:3px;height:{4*step}px;background:linear-gradient(180deg,var(--gold-l),var(--gold));z-index:2"></div>'
    return (background()
            + f'<div class="L" style="left:70px;right:70px;top:{[90, 250][k]}px;text-align:center"><h1 class="serif" style="font-size:{[76, 90][k]}px;line-height:1.3">من الملكة إلى شهر العسل…<br><em>كل رحلتك معك.</em></h1></div>'
            + line + nodes + brand([1210, 1600][k], W, cta="ابدئي رحلة زفافك"))

def S07(W, H):
    k = int(H > 1500)
    return (background()
            + f'<div class="L" style="left:70px;right:70px;top:{[80, 250][k]}px;text-align:center"><h1 class="serif" style="font-size:{[78, 92][k]}px;line-height:1.3">استمتعي بالتجهيز…<br><em>بدون ما تضيع منك الميزانية.</em></h1></div>'
            + zoom("budget-tall.png", R["b_sum"], [800, 880][k], [140, 100][k], [350, 640][k], -9, None, fx="fade")
            + zoom("budget-tall.png", (16, 2034, 358, 140), [800, 880][k], [140, 100][k], [860, 1210][k], -9, None, fx="fade")
            + brand([1210, 1600][k], W, cta="شوفي مفكّرتك"))

STATICS = [("01", "hero", S01, "زواجك له ألف تفصيلة… خليها كلها بمكان واحد."), ("02", "countdown", S02, "١٨٧ باقي على زفافك · ٤٢٪ جاهزة"),
           ("03", "this-week", S03, "وش باقي عليك هالأسبوع؟"), ("04", "before-after", S04, "من الفوضى… إلى رحلة مرتبة."),
           ("05", "checklist", S05, "مو لازم تتذكرين كل شيء. إحنا تذكرناه لك."), ("06", "full-journey", S06, "من الملكة إلى شهر العسل… كل رحلتك معك."),
           ("07", "budget", S07, "استمتعي بالتجهيز… بدون ما تضيع منك الميزانية.")]

if __name__ == "__main__":
    for sid, slug, fn, head in STATICS:
        d = ROOT / "static" / f"{sid}-{slug}"; d.mkdir(parents=True, exist_ok=True)
        (d / "feed-4x5.html").write_text(spage(fn(1080, 1350), 1080, 1350, f"{sid} {slug} feed"))
        (d / "story-9x16.html").write_text(spage(fn(1080, 1920), 1080, 1920, f"{sid} {slug} story"))
    print("statics", len(STATICS))
