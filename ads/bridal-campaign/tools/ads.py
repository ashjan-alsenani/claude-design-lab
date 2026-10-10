"""The 15 reels: Saudi VO script (with timing), on-screen copy, CTA, music, and the composition itself.
Times are seconds. VO timings are the planned delivery for a natural, unhurried Saudi female read; captions use
exactly the same timings, so a real recording dropped in later lines up with the burned captions.
"""
from lib import *

# ---------------------------------------------------------------- shared props (illustrative "chaos", not product UI)
def chat(text, who, left, top, t0, t1, rot=0, tone="#FFFDF9", dx=0, dy=0, w=470):
    return (f'<div class="L card" style="left:{left}px;top:{top}px;width:{w}px;padding:24px 30px 26px;background:{tone};border-radius:34px 34px 34px 10px;z-index:4"'
            f'{A(t0, t1, "drop", d=0.55, od=0.7, extra=f"data-rot={rot} data-base=rotate({rot}deg) data-outfx=scatter data-dx={dx} data-dy={dy}")} data-float="3">'
            f'<div style="font-size:24px;font-weight:600;color:var(--muted);margin-bottom:6px">{esc(who)}</div>'
            f'<div style="font-size:35px;font-weight:500;line-height:1.45">{rich(text)}</div></div>')

def notes(left, top, t0, t1, rot=-3, dx=0, dy=0, items=None):
    items = items or ["عربون القاعة؟", "موعد البروفة الأولى", "قائمة الضيوف — نسخة ٣", "مقاس الكعب!", "ورد الكوشة؟؟"]
    li = "".join(f'<div style="display:flex;gap:14px;align-items:center;font-size:32px;font-weight:500;padding:8px 0;border-bottom:1.5px solid #F1E7DA"><span style="width:12px;height:12px;border-radius:50%;background:var(--rose)"></span>{esc(x)}</div>' for x in items)
    return (f'<div class="L card" style="left:{left}px;top:{top}px;width:460px;padding:30px 34px;z-index:3"'
            f'{A(t0, t1, "drop", d=0.6, od=0.7, extra=f"data-rot={rot} data-base=rotate({rot}deg) data-outfx=scatter data-dx={dx} data-dy={dy}")} data-float="4">'
            f'<div style="display:flex;align-items:center;gap:12px;font-size:30px;font-weight:700;color:var(--gold);margin-bottom:10px">{icon("NotePencil","regular",36,"var(--gold)")}ملاحظات الزواج</div>{li}</div>')

def paper(left, top, t0, t1, rot=4, dx=0, dy=0):
    rows = [("فستان الملكة", True), ("بطاقات الدعوة", False), ("حجز الميكب", True), ("تذوّق الكيك", False), ("عطر يوم الزواج", False)]
    li = "".join(f'<div style="display:flex;gap:16px;align-items:center;font-family:Amiri;font-weight:400;font-size:38px;height:62px">'
                 f'<span style="width:30px;height:30px;border:2.5px solid #8C7466;border-radius:6px;display:grid;place-items:center">{icon("Check","regular",24,"var(--rose-d)") if d else ""}</span>'
                 f'<span style="{"text-decoration:line-through;text-decoration-color:var(--rose);color:var(--muted)" if d else ""}">{esc(x)}</span></div>' for x, d in rows)
    return (f'<div class="L" style="left:{left}px;top:{top}px;width:430px;padding:34px 36px 30px;z-index:2;background:#FFFBF2;'
            f'background-image:repeating-linear-gradient(180deg,rgba(0,0,0,0) 0 61px,rgba(177,147,99,.28) 61px 62.5px);box-shadow:0 34px 60px -36px rgba(80,50,35,.55)"'
            f'{A(t0, t1, "drop", d=0.6, od=0.7, extra=f"data-rot={rot} data-base=rotate({rot}deg) data-outfx=scatter data-dx={dx} data-dy={dy}")} data-float="3">'
            f'<div style="font-family:Amiri;font-weight:700;font-size:40px;margin-bottom:6px">لازم ما أنسى:</div>{li}</div>')

def remind(text, sub, left, top, t0, t1, rot=0, dx=0, dy=0, ic="Bell", w=520):
    return (f'<div class="L card" style="left:{left}px;top:{top}px;width:{w}px;padding:22px 26px;display:flex;gap:20px;align-items:center;background:rgba(255,253,249,.92);z-index:5"'
            f'{A(t0, t1, "drop", d=0.55, od=0.7, extra=f"data-rot={rot} data-base=rotate({rot}deg) data-outfx=scatter data-dx={dx} data-dy={dy}")} data-float="2">'
            f'<span style="width:72px;height:72px;border-radius:20px;background:var(--champ-l);display:grid;place-items:center;flex-shrink:0">{icon(ic,"regular",40,"var(--gold)")}</span>'
            f'<div><div style="font-size:33px;font-weight:600">{rich(text)}</div><div style="font-size:26px;color:var(--muted);font-weight:500;margin-top:2px">{rich(sub)}</div></div></div>')

def chip(text, ic, left, top, t0, t1=None, tone="#FFFDF9", size=40):
    return (f'<div class="L pill card" style="left:{left}px;top:{top}px;padding:20px 34px;font-size:{size}px;font-weight:600;background:{tone};z-index:6"{A(t0, t1, "scale", d=0.45)}>'
            f'{icon(ic,"light",size+8,"var(--rose-d)")}{esc(text)}</div>')

def bignum(html_, left, top, w, t0, t1=None, fx="blur"):
    return f'<div class="L" style="left:{left}px;top:{top}px;width:{w}px;text-align:center;z-index:6"{A(t0, t1, fx, d=0.8)}>{html_}</div>'

def scrim_top(t0, t1=None, h=760, op=.55):
    return f'<div class="L" style="left:0;right:0;top:0;height:{h}px;z-index:3;background:linear-gradient(180deg,rgba(40,26,20,{op}),rgba(40,26,20,0))"{A(t0, t1, "fade", d=0.6)}></div>'

PH = dict(rel="../..")
def uiback(t0, t1=None, src="dashboard-tall.png", y=60, kb="0:0:0:1.25;20:0:-60:1.18"):
    return (f'<div class="fill"{A(t0, t1, "fade", d=0.8)}><div class="fill" data-kb="{kb}" style="background:url(../../assets/screenshots/{src}) 50% {y}px/1200px auto no-repeat;filter:blur(28px) saturate(.75);opacity:.55"></div>'
            '<div class="fill" style="background:linear-gradient(180deg,rgba(255,252,247,.55),rgba(251,246,239,.85))"></div></div>')
D = "dashboard-tall.png"
# regions (CSS px of the 390-wide captures; see assets/screenshots/*-boxes.json)
R = {
    "hero": (16, 93, 358, 326), "tiles": (16, 443, 358, 220), "attention": (16, 687, 358, 160), "week": (16, 911, 358, 535),
    "appts": (16, 1465, 358, 337), "budget_dash": (16, 1822, 358, 300),
    "b_sum": (16, 263, 358, 223), "b_cat": (16, 584, 358, 420), "b_pay": (16, 2034, 358, 330),
    "cal_month": (16, 327, 358, 387), "cal_up": (16, 920, 358, 470),
    "g_stats": (16, 255, 358, 250), "g_list": (16, 860, 358, 360),
    "v_hall": (16, 449, 358, 181), "v_mua": (16, 1198, 358, 208), "v_photo": (16, 835, 358, 181),
    "closet_a": (16, 323, 358, 566), "shop": (16, 400, 358, 470), "home": (16, 340, 358, 470),
    "cl_head": (16, 283, 358, 160), "cl_rows": (16, 565, 358, 460),
    "day_sched": (16, 267, 358, 470), "day_kit": (16, 1054, 358, 420),
    "honey": (16, 203, 358, 420), "more": (16, 150, 358, 420),
    "onb_days": (16, 300, 358, 260), "bride_rows": (16, 600, 358, 380),
}

def common(ad, body, v):
    return background() + body + captions(ad["caps"](v)) + endcard(ad["end"], ad["tagline"], ad["action"])

def caps_from(vo, hide_first=True):
    return lambda v: [(t, a, b, not (hide_first and i == 0)) for i, (t, a, b) in enumerate(vo(v))]

ADS = []
def ad(**kw):
    kw.setdefault("caps", caps_from(kw["vo"]))
    ADS.append(kw)
    return kw

# ================================================================ 01 · forgetting
def vo01(v):
    first = "زواجك قرب… وتحسين إنك ناسية شيء؟" if v == "A" else "كم ملاحظة كاتبتها عن زواجك؟"
    return [(first, 0.2, 2.9), ("بين الفستان، القاعة، المواعيد والضيوف…", 3.1, 5.9), ("لا تشيلين هم.", 6.2, 7.4), ("كل تجهيزاتك صارت بمكان واحد.", 7.7, 10.2)]
def body01(v):
    h = hook("زواجك قرب…<br>وتحسين إنك *ناسية شيء؟*" if v == "A" else "كم ملاحظة<br>*كاتبتها* عن زواجك؟", -0.9, 2.95, size=96)
    chaos = (chat("لا تنسين موعد البروفة!", "أختي نورة", 560, 760, -0.9, 6.0, -3, dx=260, dy=-120)
             + notes(90, 840, -0.7, 6.0, -4, dx=-260, dy=60)
             + remind("دفعة القاعة الثانية", "تذكير · بكرة ٩:٠٠ ص", 470, 1150, 0.0, 6.05, 3, dx=280, dy=160)
             + chat("كم عربون المصورة؟ 🤍".replace("🤍", "{h}"), "ماما", 120, 1290, 0.4, 6.1, 2, tone="#F7EAE5", dx=-240, dy=200, w=440)
             + paper(560, 1010, 0.7, 6.0, 5, dx=300, dy=40)
             + remind("موعد تجربة الميكب", "الخميس · ٤:٠٠ م", 90, 640, 1.1, 6.1, -2, dx=-200, dy=-200, ic="CalendarBlank", w=480))
    words = "".join(chip(t, ic, x, y, a, 5.95) for t, ic, x, y, a in [("الفستان", "Dress", 600, 330, 3.15), ("القاعة", "Buildings", 300, 330, 3.75), ("المواعيد", "CalendarBlank", 560, 470, 4.45), ("الضيوف", "Users", 280, 470, 5.1)])
    reveal = (label("مفكّرة عروسة العُمر", "كل شيء… *بمكان واحد*", 6.4, 11.2)
              + phone(D, 540, 560, 560, 6.35, 11.2, scroll="7.4:0;10.6:330", kb="6.3:0:0:1;11.2:0:-20:1.03", dim="8.4:0:1;8.8:7:1;10.4:7:1;10.8:0:1")
              + zoom(D, R["hero"], 880, 100, 820, 8.6, 10.5, sheen=9.3))
    return h + chaos + words + reveal
ad(id="01", slug="forgetting", title="زواجك قرب… وتحسين إنك ناسية شيء؟", angle="Fear of forgetting → relief: scattered notes clear into one calm dashboard.",
   vo=vo01, body=body01, end=11.3, dur=15.0, splice=3.3, music=("morning", 0, 11),
   hooks={"A": "زواجك قرب… وتحسين إنك ناسية شيء؟", "B": "كم ملاحظة كاتبتها عن زواجك؟"},
   tagline="رتّبي رحلة زفافك {h}", action="اكتشفي مفكّرتك الآن",
   screens=["dashboard-tall.png"])

# ================================================================ 02 · countdown
def vo02(v):
    first = "كم باقي على زواجك؟" if v == "A" else "باقي لك ١٨٧ يوم… تعرفين وش تسوين أول؟"
    end1 = 1.9 if v == "A" else 2.9
    return [(first, 0.2, end1), ("حطي تاريخ زواجك…", 3.1, 4.4), ("وخلي مفكّرتك تقول لك وش عليك الحين،", 4.7, 7.1), ("ووش باقي بعدين.", 7.3, 8.6)]
def body02(v):
    if v == "A":
        h = hook("كم باقي<br>على *زواجك؟*", -0.9, 2.95, size=118, top=300)
    else:
        h = hook("باقي لك *١٨٧* يوم…<br>تعرفين وش تسوين أول؟", -0.9, 2.95, size=92, top=300)
    date = (bignum('<div class="serif" style="font-size:66px;color:var(--brown-s)">١٥ أبريل</div><div class="serif" style="font-size:150px;line-height:1;color:var(--rose-d)">٢٠٢٧</div>', 140, 900, 760, -0.9, 2.95)
            + f'<div class="L hair" style="left:240px;width:560px;top:1250px"{A(0.3, 2.95, "maskx", d=1.2)}></div>')
    onb = (phone("onb-date-empty.png", 540, 520, 560, 3.0, 5.6, kb="3:0:0:1;5.6:0:0:1.02")
           + phone("onb-date.png", 540, 520, 560, 3.9, 6.9, fx="fade", z=4)
           + zoom("onb-date.png", (16, 95, 358, 250), 860, 110, 880, 4.3, 6.9, sheen=4.9)
           + label("حطي تاريخ زواجك", None, 3.0, 6.9, top=300))
    dash = (bignum(f'<div class="serif" style="font-size:230px;line-height:1;color:var(--brown)"><span data-count="7.0,8.6,0,187">٠</span></div><div class="serif" style="font-size:64px;color:var(--brown-s);margin-top:-6px">يومًا على زفافك</div>', 90, 330, 520, 7.0, 10.8)
            + bignum(ring(0, 42, 7.4, 9.0, 300, 18, label_html='<div><div class="serif" style="font-size:96px;line-height:1"><span data-count="7.4,9.0,0,42">٠</span>٪</div><div style="font-size:30px;font-weight:600;color:var(--sage-d)">جاهزة</div></div>'), 640, 360, 320, 7.4, 10.8)
            + zoom(D, R["hero"], 880, 100, 850, 8.2, 10.8, sheen=9.0))
    return h + date + onb + dash
ad(id="02", slug="countdown", title="كم باقي على زواجك؟", angle="Countdown + readiness: the planner knows what is due now and what can wait.",
   vo=vo02, body=body02, end=10.9, dur=14.6, splice=3.0, music=("garden", 0, 12),
   hooks={"A": "كم باقي على زواجك؟", "B": "باقي لك ١٨٧ يوم… تعرفين وش تسوين أول؟"},
   tagline="كل يوم… *خطوته واضحة*", action="ابدئي رحلتك", screens=["onb-date-empty.png", "onb-date.png", "dashboard-tall.png"])

# ================================================================ 03 · this week
TASKS = ["تصميم الكوشة", "مكان ليلة الحناء", "حجز الطيران", "حجز الفنادق", "العقد والأقراط", "التدقيق اللغوي للدعوات", "حجز موعد عقد القران", "البروفة الأولى", "اعتماد الطرحة",
         "خواتم الزواج", "حذاء الزفاف", "جمع أرقام المدعوين", "تذوق قائمة الطعام", "ترتيب الزفة", "مكان الملكة", "العبايات والمناسبات", "تجهيز الدعوة الإلكترونية", "اختيار الورود",
         "الطاولات والكراسي", "المدخل وممر العروس", "شراء الأجهزة", "الساعات", "طباعة الدعوات", "حفظ صور الإلهام", "إرسال الدعوات", "البروفة الثانية", "تجربة المكياج", "حجز المصورة",
         "دفع عربون القاعة", "تأكيد الموردين", "حقيبة الطوارئ", "جدول يوم الزفاف", "شنطة السفر", "تأمين السفر", "جلسة تصوير", "توزيعات الحناء"]
def vo03(v):
    first = "مو لازم تسوين كل شيء اليوم." if v == "A" else "٢٠٦ مهمة؟ لا تشيلين هم."
    return [(first, 0.2, 2.5), ("بدل ما تتوترين من كل تجهيزات الزواج…", 2.8, 5.3), ("ركزي بس على اللي عليك هالأسبوع.", 5.6, 8.1)]
def body03(v):
    h = (f'<div class="L card" style="left:80px;right:120px;top:230px;padding:40px 30px 46px;text-align:center;background:rgba(255,252,247,.9);backdrop-filter:blur(10px);z-index:8"{A(-0.9, 2.95, "blur", d=0.8)}>'
         f'<h1 class="serif" style="font-size:{92 if v == "A" else 100}px;line-height:1.28">{rich("مو لازم تسوين<br>*كل شيء* اليوم." if v == "A" else "*٢٠٦* مهمة؟<br>لا تشيلين هم.")}</h1></div>')
    keep = {0: (130, 0), 1: (130, 1), 2: (130, 2), 3: (130, 3)}
    wall = ""
    import random
    rnd = random.Random(3)
    for i, tname in enumerate(TASKS):
        col, row = i % 3, i // 3
        x = 70 + col * 320 + rnd.randint(-20, 20); y = 560 + row * 92 + rnd.randint(-10, 10)
        if row > 11: break
        a = -0.4 + (i % 9) * 0.05
        out = 4.9 + rnd.random() * 0.5
        wall += (f'<div class="L pill" style="left:{x}px;top:{y}px;padding:14px 22px;font-size:27px;font-weight:500;background:#FFFDF9;border:1.5px solid #EADFD0;color:var(--brown-s);z-index:2"'
                 f'{A(a, out, "scale", d=0.4, od=0.6, extra=f"data-outfx=scatter data-dx={rnd.randint(-120,120)} data-dy={rnd.randint(-80,80)}")}>'
                 f'<span style="width:22px;height:22px;border-radius:50%;border:2px solid #D9C9B6"></span>{esc(tname)}</div>')
    focus = (label("تركيزك *هذا الأسبوع*", None, 5.4, 10.9, top=300)
             + zoom(D, R["week"], 820, 130, 430, 5.5, 10.9, sheen=6.6, kb="5.5:0:20:1;10.9:0:-10:1.02"))
    return h + wall + focus
ad(id="03", slug="this-week", title="مو لازم تسوين كل شيء اليوم.", angle="Overwhelm → focus: 206 tasks shrink to the 4 that matter this week.",
   vo=vo03, body=body03, end=11.0, dur=14.6, splice=3.1, music=("veil", 0, 13),
   hooks={"A": "مو لازم تسوين كل شيء اليوم.", "B": "٢٠٦ مهمة؟ لا تشيلين هم."},
   tagline="خطوة بخطوة *لين يومك* {h}", action="رتّبي يومك من اليوم", screens=["dashboard-tall.png"])

# ================================================================ 04 · budget
EXP = [("القاعة", "Buildings", "٤٬٠٠٠"), ("الفستان", "Dress", "١٬٨٠٠"), ("التصوير", "Camera", "٨٠٠"), ("الورد والديكور", "Flower", "٢٬٠٠٠"), ("الميكب", "PaintBrush", "٥٠٠")]
def vo04(v):
    first = "وين راحت ميزانية الزواج؟" if v == "A" else "كل ريال تدفعينه… تعرفين وين راح."
    return [(first, 0.2, 2.3), ("القاعة، الفستان، التصوير، الورد…", 2.6, 5.1), ("تابعي كل ريال دفعتيه،", 5.4, 6.9), ("وكل دفعة باقي موعدها.", 7.1, 8.7)]
def body04(v):
    h = hook("وين راحت<br>*ميزانية* الزواج؟" if v == "A" else "كل ريال…<br>*تعرفين* وين راح.", -0.9, 2.95, size=104, top=280)
    coins = "".join(f'<div class="L" style="left:{x}px;top:{y}px;z-index:2;opacity:.9" data-float="6">{icon("Coins","light",s,"var(--gold-l)")}</div>' for x, y, s in [(140, 840, 90), (820, 980, 70), (300, 1180, 60), (700, 760, 54)])
    coins = f'<div class="fill"{A(-0.3, 2.9, "fade")}>{coins}</div>'
    rows = ""
    for i, (n, ic, amt) in enumerate(EXP):
        a = 2.6 + i * 0.48
        rows += (f'<div class="L card" style="left:110px;right:150px;top:{560 + i*150}px;height:126px;display:flex;align-items:center;gap:26px;padding:0 34px;z-index:5"{A(a, 5.2, "rise", d=0.5, od=0.5)}>'
                 f'<span style="width:78px;height:78px;border-radius:24px;background:var(--blush-l);display:grid;place-items:center">{icon(ic,"light",46,"var(--rose-d)")}</span>'
                 f'<span style="font-size:44px;font-weight:600;flex:1">{n}</span><span class="serif" style="font-size:52px;color:var(--brown)">{amt} <span style="font-family:Plex;font-size:28px;font-weight:500;color:var(--muted)">ر.س</span></span></div>')
    ui = (label("ميزانيتك", "كل ريال *في مكانه*", 5.3, 10.6)
          + phone("budget-tall.png", 540, 640, 540, 5.25, 10.6, scroll="6.8:0;8.6:1840", dim="5.2:0:1;5.8:6:1;10.6:6:1")
          + zoom("budget-tall.png", R["b_sum"], 880, 100, 720, 5.6, 7.2, sheen=6.2)
          + zoom("budget-tall.png", R["b_pay"], 880, 100, 720, 7.1, 10.6, sheen=7.9))
    return h + coins + rows + ui
ad(id="04", slug="budget", title="وين راحت ميزانية الزواج؟", angle="Money anxiety → control: paid, committed, remaining and every upcoming instalment.",
   vo=vo04, body=body04, end=10.7, dur=14.6, splice=3.1, music=("promise", 0, 14),
   hooks={"A": "وين راحت ميزانية الزواج؟", "B": "كل ريال… تعرفين وين راح."},
   tagline="ميزانيتك *قدامك* دائمًا.", action="شوفي مفكّرتك", screens=["budget-tall.png"])

# ================================================================ 05 · payments
def vo05(v):
    return [("دفعة المصورة بعد ٣ أيام.", 0.2, 2.1), ("ما عاد تحتاجين تحفظين كل موعد براسك.", 2.4, 4.8), ("مفكّرتك تذكرك بالمواعيد والدفعات", 5.1, 7.2), ("قبل لا تفوتك.", 7.4, 8.5)]
def body05(v):
    notif = (f'<div class="L card" style="left:90px;right:130px;top:640px;padding:30px 32px;display:flex;gap:26px;align-items:center;background:rgba(255,253,249,.94);z-index:6"{A(-0.9, 2.6, "drop", d=0.6)}>'
             f'<span class="mark" style="width:96px;height:96px;border-radius:28px;flex-shrink:0">{icon("Heart","fill",50,"#FFF7F2")}</span>'
             f'<div style="flex:1"><div style="display:flex;justify-content:space-between;font-size:26px;color:var(--muted);font-weight:600"><span>مفكّرة عروسة العُمر</span><span>الآن</span></div>'
             f'<div style="font-size:38px;font-weight:700;margin-top:4px">المصورة: الدفعة الثانية</div><div style="font-size:32px;color:var(--brown-s);font-weight:500">١٬٥٠٠ ر.س · بعد ٣ أيام</div></div></div>')
    h = hook("دفعة المصورة<br>*بعد ٣ أيام.*", -0.9, 2.6, size=104, top=270)
    ui = (phone(D, 540, 560, 560, 2.4, 10.0, scroll="2.4:560;6.0:560;6.6:1440", kb="2.4:0:20:1;10:0:0:1.02", dim="2.4:0:1;3.0:6:1;9.8:6:1")
          + zoom(D, R["attention"], 880, 100, 860, 2.6, 5.0, sheen=3.3)
          + zoom("budget-tall.png", R["b_pay"], 880, 100, 640, 5.0, 7.3, sheen=5.7)
          + zoom("calendar-tall.png", R["cal_up"], 880, 100, 560, 7.2, 10.0, sheen=7.9)
          + label("تذكير قبل *كل موعد*", None, 2.6, 10.0, top=300))
    return h + notif + ui
ad(id="05", slug="payments", title="دفعة المصورة بعد ٣ أيام.", angle="Reminders: payments and appointments surface before they are missed.",
   vo=vo05, body=body05, end=10.1, dur=13.8, splice=None, music=("golden", 0, 15),
   hooks={"A": "دفعة المصورة بعد ٣ أيام."}, tagline="ولا موعد *يُنسى.*", action="ابدئي رحلة زفافك",
   screens=["dashboard-tall.png", "budget-tall.png", "calendar-tall.png"])

# ================================================================ 06 · guests
def vo06(v):
    return [("مين للحين ما رد على الدعوة؟", 0.2, 2.3), ("مين دعيتِ؟", 2.6, 3.4), ("مين أكد؟", 3.6, 4.3), ("ومين للحين ما رد؟", 4.5, 5.6), ("كلها قدامك.", 5.9, 6.9)]
def body06(v):
    h = hook("مين للحين<br>ما رد على *الدعوة؟*", -0.9, 2.5, size=100, top=300)
    env = f'<div class="L" style="left:390px;top:880px;z-index:2"{A(-0.3, 2.5, "blur")} data-float="5">{icon("EnvelopeOpen","light",300,"var(--gold-l)")}</div>'
    stats = ""
    for i, (n, lab, col, bg, a) in enumerate([(220, "مدعو", "var(--brown)", "#FFFDF9", 2.6), (125, "أكدوا", "var(--sage-d)", "#F1F5EE", 3.6), (71, "بانتظار الرد", "var(--gold)", "#FBF5EA", 4.5), (24, "اعتذروا", "var(--rose-d)", "#FBF1EF", 5.0)]):
        y = 420 + i * 245
        stats += (f'<div class="L card" style="left:150px;right:190px;top:{y}px;height:210px;display:flex;align-items:center;justify-content:space-between;padding:0 56px;background:{bg};z-index:5"{A(a, 5.9, "rise", d=0.5, od=0.5)}>'
                  f'<span style="font-size:48px;font-weight:600">{lab}</span><span class="serif" style="font-size:130px;line-height:1;color:{col}" data-count="{a},{a+0.9},0,{n}">٠</span></div>')
    ui = (label("ضيوفك", "*مرتبين* بقائمة وحدة", 5.9, 10.6)
          + phone("guests-tall.png", 540, 640, 540, 5.85, 10.6, scroll="7.4:0;9.6:520", dim="6.4:0:1;6.9:6:1;10.6:6:1")
          + zoom("guests-tall.png", R["g_stats"], 860, 110, 700, 6.5, 8.4, sheen=7.0)
          + zoom("guests-tall.png", R["g_list"], 860, 110, 700, 8.3, 10.6, sheen=8.9))
    return h + env + stats + ui
ad(id="06", slug="guests", title="مين للحين ما رد على الدعوة؟", angle="RSVP clarity: invited, confirmed, pending — the family question answered.",
   vo=vo06, body=body06, end=10.7, dur=14.2, splice=None, music=("morning", 2, 16),
   hooks={"A": "مين للحين ما رد على الدعوة؟"}, tagline="ضيوفك… *مرتبين* {h}", action="ابدئي الآن على OneClick", screens=["guests-tall.png"])

# ================================================================ 07 · vendors
def vo07(v):
    return [("قاعة؟ مصورة؟ ميكب؟ ورد؟", 0.2, 2.8), ("كل مورد، رقمه، سعره، العربون والباقي…", 3.1, 5.8), ("بمكان واحد.", 6.0, 7.0)]
def body07(v):
    items = [("قاعة؟", "Buildings", -0.3), ("مصورة؟", "Camera", 0.5), ("ميكب؟", "PaintBrush", 1.2), ("ورد؟", "Flower", 1.9)]
    grid = ""
    for i, (w, ic, a) in enumerate(items):
        x = 590 if i % 2 == 0 else 150; y = 420 + (i // 2) * 470
        grid += (f'<div class="L" style="left:{x}px;top:{y}px;width:340px;text-align:center;z-index:5"{A(a, 3.0, "scale", d=0.55, od=0.5, extra="data-outfx=scatter data-dy=-40")}>'
                 f'<div class="card" style="width:250px;height:250px;margin:0 auto;border-radius:80px;display:grid;place-items:center;background:#FFFDF9">{icon(ic,"light",140,"var(--rose-d)")}</div>'
                 f'<div class="serif" style="font-size:84px;margin-top:18px">{w}</div></div>')
    ui = (label("مورديك", "كل التفاصيل *بمكانها*", 3.0, 10.4)
          + phone("vendors-tall.png", 540, 640, 540, 3.0, 10.4, scroll="3.2:0;7.0:900", dim="3.6:0:1;4.1:6:1;10.4:6:1")
          + zoom("vendors-tall.png", R["v_hall"], 880, 100, 640, 3.7, 10.4, sheen=4.4, kb="3.7:0:0:1;10.4:0:-8:1")
          + zoom("vendors-tall.png", R["v_mua"], 880, 100, 1110, 4.6, 10.4, sheen=5.4, kb="4.6:0:0:1;10.4:0:8:1"))
    return grid + ui
ad(id="07", slug="vendors", title="قاعة؟ مصورة؟ ميكب؟ ورد؟", angle="Vendor chaos → one contact book with price, deposit and what is left to pay.",
   vo=vo07, body=body07, end=10.5, dur=14.0, splice=None, music=("promise", 2, 17),
   hooks={"A": "قاعة؟ مصورة؟ ميكب؟ ورد؟"}, tagline="كل تفاصيل زفافك *في مكانها.*", action="اكتشفي مفكّرتك الآن", screens=["vendors-tall.png"],
   caps=lambda v: [(t, a, b, i > 0) for i, (t, a, b) in enumerate(vo07(v))])

# ================================================================ 08 · forgotten details
DETAILS = [("البروفة الأخيرة", "Dress", "١ أبريل"), ("حقيبة الطوارئ", "FirstAid", "يوم الزفاف"), ("العطر", "Drop", "حقيبة الطوارئ"), ("الأوراق والمستندات", "FileText", "قبل السفر"), ("تأكيد الموردين", "CheckCircle", "الأسبوع الأخير"), ("حذاء احتياطي", "Sneaker", "حقيبة الطوارئ")]
def vo08(v):
    return [("في أشياء ما نتذكرها إلا متأخر…", 0.2, 2.6), ("في تفاصيل صغيرة…", 2.9, 4.1), ("بس يوم الزواج تصير مرّة مهمة.", 4.3, 6.3), ("عشان كذا مفكّرتك تذكرك فيها قبل يومك.", 6.6, 9.1)]
def body08(v):
    h = hook("في أشياء ما نتذكرها<br>*إلا متأخر…*", -0.9, 2.6, size=96, top=300)
    cards = ""
    for i, (n, ic, sub) in enumerate(DETAILS):
        a = 0.6 + i * 0.85; b = a + 1.25 if i < 5 else 6.4
        cards += (f'<div class="L" style="left:140px;right:180px;top:700px;height:560px;z-index:{5+i}"{A(a, b, "blur", d=0.55, od=0.4)}>'
                  f'<div class="card" style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;background:#FFFDF9">'
                  f'<span style="width:190px;height:190px;border-radius:60px;background:var(--blush-l);display:grid;place-items:center">{icon(ic,"light",120,"var(--rose-d)")}</span>'
                  f'<div class="serif" style="font-size:80px">{n}</div><div style="font-size:34px;font-weight:600;color:var(--gold)">{sub}</div>'
                  f'<div class="kicker" style="position:absolute;top:34px;right:44px;color:var(--muted)">{ar(i+1)} / ٦</div></div></div>')
    ui = (label("يوم الزفاف", "*ولا تفصيلة* تُنسى", 6.4, 11.2)
          + phone("day-tall.png", 540, 640, 540, 6.4, 11.2, scroll="7.2:0;9.0:1000", dim="6.9:0:1;7.4:6:1;11.2:6:1")
          + zoom("day-tall.png", R["day_kit"], 880, 100, 660, 7.3, 11.2, sheen=8.1))
    return h + cards + ui
ad(id="08", slug="forgotten-details", title="في أشياء ما نتذكرها إلا متأخر…", angle="The small things (emergency kit, backup shoes, documents) remembered ahead of the day.",
   vo=vo08, body=body08, end=11.3, dur=15.0, splice=None, music=("veil", 2, 18),
   hooks={"A": "في أشياء ما نتذكرها إلا متأخر…"}, tagline="ولا تفصيلة *تُنسى.*", action="رتّبي يومك من اليوم", screens=["day-tall.png"])

# ================================================================ 09 · journey timeline
STOPS = [("الملكة", "عقد القران", "Diamond"), ("الحناء", "ليلة الحناء", "FlowerLotus"), ("الزفاف", "١٥ أبريل ٢٠٢٧", "Heart"), ("الصباحية", "صباح اليوم التالي", "Sun"), ("شهر العسل", "الطيران والفنادق", "Airplane")]
def vo09(v):
    return [("مو بس يوم الزواج…", 0.2, 1.7), ("من الملكة، للحناء، ليومك،", 2.0, 4.0), ("وحتى شهر العسل…", 4.2, 5.4), ("رحلتك كلها مرتبة معك.", 5.7, 7.7)]
def body09(v):
    h = hook("مو بس *يوم الزواج…*", -0.9, None, size=92, top=250)
    line = f'<div class="L" style="left:869px;top:520px;width:3px;height:900px;background:linear-gradient(180deg,var(--gold-l),var(--gold));z-index:2"{A(0.3, 7.9, "mask", d=5.0)}></div>'
    nodes = ""
    times = [1.9, 2.8, 3.6, 4.4, 4.9]
    for i, (n, sub, ic) in enumerate(STOPS):
        y = 470 + i * 215; a = times[i]
        main = i == 2
        nodes += (f'<div class="L" style="left:100px;right:290px;top:{y+20}px;text-align:right;z-index:5"{A(a, 7.9, "rise", d=0.55)}>'
                  f'<div class="serif" style="font-size:{86 if main else 72}px;line-height:1.1;color:{"var(--rose-d)" if main else "var(--brown)"}">{n}</div>'
                  f'<div style="font-size:32px;font-weight:600;color:var(--muted);margin-top:4px">{sub}</div></div>'
                  f'<div class="L" style="left:818px;top:{y+38}px;width:104px;height:104px;border-radius:50%;display:grid;place-items:center;z-index:6;background:{"linear-gradient(150deg,#D7A9AA,#B47D80)" if main else "#FFFDF9"};box-shadow:0 0 0 2px var(--gold-l),0 18px 30px -18px rgba(80,50,35,.6)"{A(a-0.1, 7.9, "scale", d=0.5)}>'
                  f'{icon(ic, "fill" if main else "light", 54, "#FFF7F2" if main else "var(--rose-d)")}</div>')
    nodes = f'<div class="fill" style="z-index:4">{nodes}</div>'
    hz = f'<div class="fill"{A(-1, 7.9, "fade", od=0.5)}>{h}</div>'
    ui = (phone("honeymoon-tall.png", 540, 600, 540, 7.9, 11.0, dim="8.4:0:1;8.9:6:1")
          + zoom("honeymoon-tall.png", R["honey"], 880, 100, 640, 8.5, 11.0, sheen=9.2) + label("شهر العسل", "*مرتب* من الحين", 7.9, 11.0))
    return hz + line + nodes + ui
ad(id="09", slug="journey", title="مو بس يوم الزواج…", angle="Whole-journey scope: milka, henna, wedding, sabahiya and honeymoon in one plan.",
   vo=vo09, body=body09, end=11.1, dur=14.8, splice=None, music=("henna", 0, 19),
   hooks={"A": "مو بس يوم الزواج…"}, tagline="رحلتك *كاملة* {h}", action="ابدئي رحلة زفافك", screens=["honeymoon-tall.png"])

# ================================================================ 10 · progress
def vo10(v):
    return [("كل ما تخلصين خطوة…", 0.4, 2.2), ("تشوفين نفسك أقرب ليومك.", 2.5, 4.5)]
def body10(v):
    h = hook("*٤٢٪* جاهزة {s}", -0.9, 6.9, size=120, top=260)
    rg = bignum(ring(18, 42, 0.0, 4.6, 520, 26, label_html='<div><div class="serif" style="font-size:150px;line-height:1;color:var(--brown)"><span data-count="0,4.6,18,42">١٨</span>٪</div><div style="font-size:38px;font-weight:600;color:var(--sage-d)">جاهزة</div></div>'), 280, 520, 520, -0.9, 6.9, fx="scale")
    steps = ["تصميم الكوشة", "مكان ليلة الحناء", "حجز الطيران", "حجز الفنادق"]
    rows = ""
    for i, s in enumerate(steps):
        a = 0.5 + i * 1.05
        rows += (f'<div class="L card" style="left:140px;right:180px;top:{1110 + i*104}px;height:88px;display:flex;align-items:center;gap:22px;padding:0 30px;z-index:5"{A(-0.4 + i*0.1, 6.9, "rise", d=0.4)}>'
                 f'<span data-p="{a},.45" style="width:46px;height:46px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;border:2.5px solid var(--sage);background:rgba(94,124,92,calc(var(--p,0)))">'
                 f'<span style="transform:scale(calc(var(--p,0)));display:grid">{icon("Check","regular",28,"#FFFDF9")}</span></span>'
                 f'<span style="font-size:36px;font-weight:600;opacity:calc(1 - var(--p,0)*.45)" data-p="{a},.45">{s}</span></div>')
    ui = zoom(D, R["hero"], 880, 100, 560, 6.9, 9.6, sheen=7.6) + label("جاهزيتك", "*تكبر* معك", 6.9, 9.6, top=300)
    return h + rg + rows + ui
ad(id="10", slug="progress", title="٤٢٪ جاهزة", angle="Momentum: every finished step visibly moves her closer.",
   vo=vo10, body=body10, end=9.7, dur=13.2, splice=None, music=("garden", 3, 20),
   hooks={"A": "٤٢٪ جاهزة"}, tagline="شوفي جاهزيتك *تكبر.*", action="ابدئي الآن على OneClick", screens=["dashboard-tall.png"],
   caps=lambda v: [(t, a, b, True) for (t, a, b) in vo10(v)])

# ================================================================ 11 · before / after
def vo11(v):
    return [("قبل؟", 0.2, 0.9), ("ملاحظات بكل مكان.", 1.1, 2.5), ("بعد؟", 2.8, 3.4), ("كل شيء واضح…", 3.6, 4.8), ("وش خلصتي، وش باقي، ووش بعده.", 5.0, 7.4)]
def body11(v):
    # RTL: Arabic eyes land on the right first, so «قبل» sits on the right and «بعد» on the left.
    before = (f'<div class="L" style="left:540px;top:0;width:540px;height:1920px;overflow:hidden;z-index:2;background:#F4ECE2"{A(-1, 5.0, "fade", od=0.6)}>'
              + chat("وين رقم المصورة؟", "قروب البنات", 40, 560, -0.3, None, -4, w=420)
              + notes(70, 820, -0.1, None, 3, items=["عربون القاعة؟", "البروفة!", "الضيوف ٣؟", "ورد؟"])
              + remind("دفعة الديكور", "متأخرة يومين", 50, 1240, 0.3, None, -2, w=430)
              + f'<div class="L serif" style="top:300px;left:0;right:0;text-align:center;font-size:120px;color:var(--muted)"{A(-0.9, None, "blur")}>قبل</div></div>')
    after = (f'<div class="L" style="left:0;top:0;width:540px;height:1920px;overflow:hidden;z-index:2"{A(-1, 5.0, "fade", od=0.6)}>'
             + phone(D, 270, 560, 420, 2.6, None, fx="blur")
             + f'<div class="L serif" style="top:300px;left:0;right:0;text-align:center;font-size:120px;color:var(--rose-d)"{A(2.7, None, "blur")}>بعد</div></div>')
    divider = f'<div class="L" style="left:539px;top:200px;width:2px;height:1500px;background:linear-gradient(180deg,rgba(177,147,99,0),var(--gold),rgba(177,147,99,0));z-index:7"{A(-0.9, 5.0, "mask", d=1)}></div>'
    full = (label("بعد", "كل شيء *واضح*", 5.0, 10.4)
            + zoom("checklist-tall.png", R["cl_head"], 860, 110, 520, 5.1, 10.4, sheen=5.7)
            + zoom(D, R["week"], 860, 110, 900, 5.6, 10.4, sheen=6.6))
    return before + after + divider + full
ad(id="11", slug="before-after", title="قبل؟ ملاحظات بكل مكان. بعد؟ كل شيء واضح.", angle="Before/after contrast: scattered notes vs. done / left / next.",
   vo=vo11, body=body11, end=10.5, dur=14.0, splice=None, music=("veil", -2, 21),
   hooks={"A": "قبل؟ / بعد؟"}, tagline="التحضير *صار أهدأ.*", action="اكتشفي مفكّرتك الآن", screens=["dashboard-tall.png", "checklist-tall.png"],
   caps=lambda v: [(t, a, b, i not in (0, 2)) for i, (t, a, b) in enumerate(vo11(v))])

# ================================================================ 12 · wedding week (scenario)
def vo12(v):
    return [("باقي أسبوع على يومك؟", 0.2, 1.7), ("هالأسبوع مو وقت تفكرين وش نسيتي…", 2.0, 4.4), ("وقت تستمتعين.", 4.6, 5.6), ("خلي مفكّرتك ترتب الباقي.", 5.9, 7.8)]
def body12(v):
    h = hook("باقي *٧ أيام* {h}", -0.9, 5.8, size=120, top=260)
    days = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"]
    strip = f'<div class="L hair" style="left:120px;right:160px;top:{830}px"{A(-0.9, 5.8, "maskx", d=1.2)}></div>'
    for i, d in enumerate(days):
        x = 860 - i * 122; last = i == 6; a = 0.3 + i * 0.7
        fillc = "linear-gradient(150deg,#D7A9AA,#B47D80)" if last else "rgba(167,187,162,calc(var(--p,0)))"
        inner = icon("Heart", "fill", 40, "#FFF7F2") if last else f'<span style="display:grid;transform:scale(calc(var(--p,0)))">{icon("Check","regular",34,"#FFFDF9")}</span>'
        strip += (f'<div class="L" style="left:{x}px;top:770px;width:110px;text-align:center;z-index:5"{A(-0.9 + i*0.08, 5.8, "rise", d=0.5)}>'
                  f'<div data-p="{a},.5" style="width:96px;height:96px;margin:0 auto;border-radius:50%;display:grid;place-items:center;background:{fillc};box-shadow:0 0 0 2px {"var(--rose)" if last else "var(--sage)"},0 16px 30px -18px rgba(80,50,35,.5)">{inner}</div>'
                  f'<div style="font-size:26px;font-weight:600;color:{"var(--rose-d)" if last else "var(--muted)"};margin-top:14px">{d}</div></div>')
    sub = f'<div class="L" style="left:90px;right:130px;top:1000px;text-align:center;z-index:5"{A(0.6, 5.8, "rise")}><span class="serif" style="font-size:66px;color:var(--brown-s)">أسبوعك الأخير… <em>للاستمتاع</em></span></div>'
    ui = (label("أسبوعك الأخير", "كل شيء *مرتب*", 5.8, 11.0)
          + phone("day-tall.png", 540, 640, 540, 5.8, 11.0, scroll="6.0:0;8.4:0;9.0:1000", dim="6.2:0:1;6.7:6:1;11:6:1")
          + zoom("day-tall.png", R["day_sched"], 860, 110, 620, 6.3, 8.7, sheen=7.0)
          + zoom("day-tall.png", R["day_kit"], 860, 110, 660, 8.6, 11.0, sheen=9.2))
    return uiback(-1, 5.8, "day-tall.png", 0) + h + strip + sub + ui
ad(id="12", slug="wedding-week", title="باقي ٧ أيام", angle="Emotional permission: the final week is for enjoying, the planner holds the rest.",
   vo=vo12, body=body12, end=11.1, dur=14.8, splice=None, music=("golden", 2, 22),
   hooks={"A": "باقي ٧ أيام"}, tagline='<span class="latin" style="font-size:72px">Wedding Week</span> {h}', action="رتّبي يومك من اليوم",
   screens=["day-tall.png"], scenario=True)

# ================================================================ 13 · bridal shopping
def vo13(v):
    return [("فستانك، كعبك، عطرك، شنطتك وإكسسواراتك…", 0.2, 3.4), ("علمي على اللي أخذتيه،", 3.7, 5.1), ("وشوفي وش باقي لك.", 5.3, 6.7)]
def body13(v):
    h = hook("جهازك…<br>*وش باقي منه؟*", -0.9, 3.5, size=100, top=270)
    items = [("فستان الزفاف", "Dress", True), ("الكعب", "Sneaker", True), ("العطر", "Drop", False), ("الشنطة", "Handbag", True), ("المجوهرات", "Diamond", False), ("العباية", "CoatHanger", False)]
    cards = ""
    for i, (n, ic, got) in enumerate(items):
        col, row = i % 2, i // 2
        x = 560 if col == 0 else 150; y = 640 + row * 300; a = 0.3 + i * 0.45
        tick = a + 3.3 if got else None
        badge = (f'<span data-p="{tick},.45" style="position:absolute;top:22px;left:22px;width:52px;height:52px;border-radius:50%;display:grid;place-items:center;'
                 f'background:rgba(94,124,92,calc(var(--p,0)));border:2.5px solid rgba(94,124,92,calc(.25 + var(--p,0)*.75))"><span style="display:grid;transform:scale(calc(var(--p,0)))">{icon("Check","regular",30,"#FFFDF9")}</span></span>') if got else ""
        cards += (f'<div class="L card" style="left:{x}px;top:{y}px;width:370px;height:260px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;z-index:5"{A(a, 7.0, "rise", d=0.5)}>'
                  f'{badge}{icon(ic,"light",96,"var(--rose-d)")}<div class="serif" style="font-size:52px">{n}</div></div>')
    ui = (label("خزانة العروس", "*وش أخذتي* ووش باقي", 7.0, 10.6)
          + zoom("closet-tall.png", R["closet_a"], 840, 120, 540, 7.1, 10.6, sheen=7.8, kb="7.1:0:0:1;10.6:0:-30:1"))
    return h + cards + ui
ad(id="13", slug="bridal-shopping", title="جهازك… وش باقي منه؟", angle="Trousseau shopping: tick what she bought, see what is left.",
   vo=vo13, body=body13, end=10.7, dur=14.2, splice=None, music=("morning", -2, 23),
   hooks={"A": "جهازك… وش باقي منه؟"}, tagline="كل تجهيزاتك *معك.*", action="شوفي مفكّرتك", screens=["closet-tall.png"],
   caps=lambda v: [(t, a, b, True) for (t, a, b) in vo13(v)])

# ================================================================ 14 · new home
def vo14(v):
    return [("زواج… وتجهيز بيت بنفس الوقت؟", 0.2, 2.4), ("إذا مع تجهيز الزواج تجهزين بيتك بعد…", 2.7, 5.0), ("لا تشيلينهم كلهم براسك.", 5.2, 6.6), ("رتبي الاثنين مع بعض.", 6.8, 8.2)]
def body14(v):
    h = hook("زواج… وتجهيز بيت<br>*بنفس الوقت؟*", -0.9, 2.6, size=96, top=280)
    two = (f'<div class="L serif" style="left:560px;width:400px;top:560px;text-align:center;font-size:60px;z-index:6"{A(2.6, 6.6, "rise")}>الزواج</div>'
           f'<div class="L serif" style="left:120px;width:400px;top:560px;text-align:center;font-size:60px;z-index:6"{A(2.9, 6.6, "rise")}>البيت</div>'
           + zoom("checklist-tall.png", R["cl_rows"], 400, 560, 680, 2.7, 6.6, sheen=3.4, z=5)
           + zoom("home-tall.png", R["home"], 400, 120, 680, 3.0, 6.6, sheen=3.8, z=5))
    icons = "".join(f'<div class="L" style="left:{x}px;top:{y}px;z-index:2" data-float="5"{A(-0.3, 2.6, "blur")}>{icon(ic,"light",s,"var(--gold-l)")}</div>' for x, y, s, ic in [(160, 820, 150, "House"), (720, 900, 140, "Heart"), (420, 1150, 130, "Bed"), (160, 1250, 110, "CookingPot")])
    one = (label("مفكّرة وحدة", "*للاثنين* مع بعض", 6.6, 11.4)
           + phone("more-tall.png", 540, 600, 540, 6.6, 11.4, dim="7.1:0:1;7.6:6:1")
           + zoom("more-tall.png", R["more"], 860, 110, 640, 7.2, 11.4, sheen=7.9))
    return h + icons + two + one
ad(id="14", slug="new-home", title="زواج… وتجهيز بيت بنفس الوقت؟", angle="Double load: wedding + new home in one planner.",
   vo=vo14, body=body14, end=11.5, dur=15.0, splice=None, music=("promise", -3, 24),
   hooks={"A": "زواج… وتجهيز بيت بنفس الوقت؟"}, tagline="بيت جديد. *بداية جديدة.* {h}", action="ابدئي رحلة زفافك",
   screens=["checklist-tall.png", "home-tall.png", "more-tall.png"])

# ================================================================ 15 · hero
def vo15(v):
    first = "يا عروسة… شوفي وش يصير لما كل شيء يكون مرتب." if v == "A" else "عروسة ٢٠٢٧؟ هذي رحلتك… كاملة."
    return [(first, 0.2, 3.4), ("مو مجرد قائمة.", 3.7, 4.7), ("هذه رحلتك كاملة…", 5.0, 6.3), ("من أول تجهيز", 6.6, 7.6), ("إلى أجمل يوم.", 7.8, 9.0)]
def body15(v):
    open_ = (uiback(-1, 3.6)
             + f'<div class="hook" style="top:270px;z-index:6"{A(-0.9, 3.45, "blur", d=0.8)}><h1 style="font-size:{92 if v == "A" else 108}px">'
             + (rich("يا عروسة…<br>شوفي وش يصير لما<br>*كل شيء يكون مرتب.*") if v == "A" else rich("عروسة *٢٠٢٧*؟<br>هذي رحلتك…"))
             + "</h1></div>"
             + zoom(D, (16, 93, 358, 170), 800, 140, 960, -0.9, 3.5, sheen=0.6, kb="0:0:20:0.97;3.6:0:-30:1.02"))
    blurbg = uiback(3.4, 12.6, "budget-tall.png", 0, kb="3.4:0:0:1.2;12.6:0:-80:1.1")
    seq = [("العدّ التنازلي", D, R["hero"], 3.6), ("مهام هالأسبوع", D, R["week"], 4.9), ("الميزانية", "budget-tall.png", R["b_sum"], 6.2), ("المواعيد", "calendar-tall.png", R["cal_up"], 7.5),
           ("الضيوف", "guests-tall.png", R["g_stats"], 8.7), ("شهر العسل", "honeymoon-tall.png", R["honey"], 9.9), ("يوم الزفاف", "day-tall.png", R["day_sched"], 11.1)]
    cards = ""
    for i, (k, src, reg, a) in enumerate(seq):
        nxt = seq[i + 1][3] if i + 1 < len(seq) else 12.5
        cards += (f'<div class="L kicker" style="left:0;right:40px;top:420px;text-align:center;font-size:40px;z-index:8"{A(a + 0.12, nxt - 0.12, "rise", d=0.4, od=0.22)}>{ar(i+1)} · {k}</div>'
                  + zoom(src, reg, 860, 110, 560, a, nxt + 0.05, sheen=a + 0.35, z=7 + i, kb=f"{a}:0:40:0.96;{nxt + 0.4}:0:-60:1.02", od=0.3))
    finale = (uiback(12.3, 14.0, "dashboard-tall.png", 60, kb="12.3:0:0:1.2;14:0:-40:1.25")
              + f'<div class="hook" style="top:430px;z-index:9"{A(12.4, 13.9, "blur")}><p style="font-size:44px;color:var(--gold);font-weight:600">١٥ أبريل ٢٠٢٧</p><h1 style="font-size:116px;margin-top:10px">{rich("إلى *أجمل يوم* {h}")}</h1></div>')
    return open_ + blurbg + cards + finale
ad(id="15", slug="hero", title="يا عروسة… شوفي وش يصير لما كل شيء يكون مرتب.", angle="Flagship: the whole journey in one premium sweep, bride → every feature → the day.",
   vo=vo15, body=body15, end=14.0, dur=17.8, splice=3.6, music=("golden", 0, 25),
   hooks={"A": "يا عروسة… شوفي وش يصير لما كل شيء يكون مرتب.", "B": "عروسة ٢٠٢٧؟ هذي رحلتك… كاملة."},
   tagline="رحلتك كاملة… *بمكان واحد*", action="اكتشفي مفكّرتك الآن",
   screens=["dashboard-tall.png", "budget-tall.png", "calendar-tall.png", "guests-tall.png", "honeymoon-tall.png", "day-tall.png"])

def build_html(a, v="A"):
    body = a["body"](v)
    return page(common(a, body, v), title=f'{a["id"]} {a["slug"]} {v}')
