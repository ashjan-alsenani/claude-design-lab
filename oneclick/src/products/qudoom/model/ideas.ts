/**
 * Ready ideas for «حكاية قدوم»: gifts for the baby, favors (توزيعات) and gifts for the mother.
 * Plain suggestions only: no store links, no ads, no prices in a currency (just a rough level).
 */
export type IdeaCat = "baby" | "favor" | "mother";
export type IdeaIcon =
  | "shirt" | "bed" | "bath" | "book" | "camera" | "stroller" | "blanket" | "toy" | "music" | "frame" | "bottle" | "moon"
  | "cookie" | "candle" | "plant" | "drop" | "candy" | "coffee" | "flower" | "soap" | "bag" | "star" | "heart" | "sparkle" | "gift" | "spa" | "cup" | "pen";
export type Idea = { id: string; cat: IdeaCat; icon: IdeaIcon; color: string; price: 1 | 2 | 3; ar: string; en: string; arNote: string; enNote: string };

const I = (id: string, cat: IdeaCat, icon: IdeaIcon, color: string, price: 1 | 2 | 3, ar: string, en: string, arNote: string, enNote: string): Idea => ({ id, cat, icon, color, price, ar, en, arNote, enNote });

export const ideas: Idea[] = [
  // ---------- gifts for the baby ----------
  I("b-outfits", "baby", "shirt", "#7cc4ff", 1, "طقم ملابس أول شهر", "First-month outfit set", "قطن ناعم، مقاس ٠–٣ شهور", "Soft cotton, 0–3 months"),
  I("b-sleepsuit", "baby", "moon", "#b8a6ff", 1, "بيجامات نوم قطنية", "Cotton sleepsuits", "٣ قطع بأزرار أمامية", "A set of 3 with front poppers"),
  I("b-swaddle", "baby", "blanket", "#ff9fb8", 1, "لفّافات موسلين", "Muslin swaddles", "تنفع لف وغطاء ومريلة", "Wrap, cover and burp cloth in one"),
  I("b-blanket", "baby", "blanket", "#ffc76b", 2, "بطانية بالاسم", "Name-embroidered blanket", "تطريز اسم البيبي", "Baby's name embroidered"),
  I("b-bath", "baby", "bath", "#7ed9c3", 1, "طقم استحمام", "Bath set", "منشفة بقبعة وليفة ناعمة", "Hooded towel and soft sponge"),
  I("b-bathtub", "baby", "bath", "#7cc4ff", 2, "حوض استحمام للبيبي", "Baby bathtub", "مع مسند للرضيع", "With a newborn support"),
  I("b-carrier", "baby", "heart", "#ff9fb8", 2, "حمّالة أطفال", "Baby carrier", "مريحة للأم والبيبي", "Comfortable for mum and baby"),
  I("b-bouncer", "baby", "bed", "#b8a6ff", 3, "كرسي هزاز للبيبي", "Baby bouncer", "يهدّي البيبي ويريح يدينك", "Soothes baby, frees your hands"),
  I("b-stroller", "baby", "stroller", "#7ed9c3", 3, "عربة أطفال", "Stroller", "خفيفة وتنطوي بسهولة", "Light and easy to fold"),
  I("b-carseat", "baby", "heart", "#ffc76b", 3, "كرسي سيارة", "Car seat", "مناسب للمواليد", "Suitable from birth"),
  I("b-album", "baby", "book", "#ff9fb8", 1, "ألبوم السنة الأولى", "First-year album", "صفحات لكل شهر", "A page for every month"),
  I("b-frame", "baby", "frame", "#ffc76b", 1, "برواز البصمات", "Hand & footprint frame", "بصمة اليد والرجل كذكرى", "A keepsake of tiny prints"),
  I("b-mobile", "baby", "star", "#b8a6ff", 2, "معلّقة فوق السرير", "Crib mobile", "نجوم وغيوم بألوان هادية", "Stars and clouds in calm colours"),
  I("b-books", "baby", "book", "#7cc4ff", 1, "كتب قماش ملونة", "Soft cloth books", "آمنة للعض والمسك", "Safe to chew and hold"),
  I("b-toys", "baby", "toy", "#ff9fb8", 1, "خشخيشات وألعاب حسّية", "Rattles & sensory toys", "ألوان وأصوات خفيفة", "Gentle colours and sounds"),
  I("b-music", "baby", "music", "#7ed9c3", 2, "جهاز أصوات هادئة", "Soothing sound machine", "أصوات طبيعة وضوء خافت", "Nature sounds and a soft light"),
  I("b-bottles", "baby", "bottle", "#7cc4ff", 2, "طقم رضّاعات", "Bottle set", "مع فرشاة تنظيف", "With a cleaning brush"),
  I("b-photoshoot", "baby", "camera", "#ffc76b", 3, "جلسة تصوير للمولود", "Newborn photo session", "قسيمة من مصوّرة", "A voucher from a photographer"),
  I("b-gold", "baby", "sparkle", "#ffc76b", 3, "قطعة ذهب صغيرة", "A small gold keepsake", "سوار أو تعليقة بالاسم", "Bracelet or name pendant"),

  // ---------- favors (توزيعات) ----------
  I("f-cookies", "favor", "cookie", "#e0a24a", 1, "كوكيز باسم البيبي", "Cookies with baby's name", "مزخرفة بألوان الاستقبال", "Iced in the welcome colours"),
  I("f-chocolate", "favor", "candy", "#c98b6b", 1, "شوكولاتة بغلاف خاص", "Wrapped chocolates", "ملصق «أهلًا سلمى»", "With a «Welcome» label"),
  I("f-dates", "favor", "gift", "#b07a4f", 1, "تمر محشي بعلب صغيرة", "Stuffed dates in mini boxes", "بالمكسرات أو اللوز", "With nuts or almonds"),
  I("f-candle", "favor", "candle", "#ff9fb8", 2, "شمعة معطرة صغيرة", "Mini scented candle", "بعطر خفيف وبطاقة شكر", "Light scent with a thank-you tag"),
  I("f-seeds", "favor", "plant", "#2fa77c", 1, "بذور نبتة «تكبر معنا»", "Seed packet «Grow with us»", "فكرة لطيفة وبسيطة", "Sweet and simple"),
  I("f-plant", "favor", "plant", "#7ed9c3", 2, "نبتة صبار صغيرة", "Tiny succulent", "بأصيص مزيّن", "In a decorated pot"),
  I("f-rosewater", "favor", "drop", "#ff9fb8", 1, "ماء ورد بقارورة صغيرة", "Rose water mini bottle", "ريحة البيت الخليجي", "A classic Gulf scent"),
  I("f-bakhoor", "favor", "sparkle", "#b8a6ff", 2, "بخور بعلبة صغيرة", "Bakhoor in a small box", "مع مبخرة مصغّرة", "With a mini burner"),
  I("f-soap", "favor", "soap", "#7cc4ff", 1, "صابونة معطرة على شكل بيبي", "Baby-shaped scented soap", "بلون الاستقبال", "In the welcome colour"),
  I("f-honey", "favor", "drop", "#ffc76b", 2, "عسل بقارورة صغيرة", "Mini honey jar", "مع ملعقة خشب", "With a little wooden spoon"),
  I("f-coffee", "favor", "coffee", "#8a6447", 2, "قهوة عربية بكيس مزيّن", "Arabic coffee in a pretty pouch", "هيل وزعفران", "With cardamom and saffron"),
  I("f-cupcake", "favor", "cookie", "#ff9fb8", 1, "كب كيك بتوبر الاسم", "Cupcakes with name toppers", "للاستقبال في البيت", "For the home welcome"),
  I("f-macaron", "favor", "candy", "#b8a6ff", 2, "ماكرون بلونين", "Two-colour macarons", "علبة فيها حبتين", "Two in a little box"),
  I("f-keychain", "favor", "heart", "#7ed9c3", 2, "ميدالية بالاسم والتاريخ", "Keychain with name & date", "ذكرى تبقى", "A keepsake that lasts"),
  I("f-bookmark", "favor", "pen", "#7cc4ff", 1, "فاصل كتب مطبوع", "Printed bookmark", "عليه دعاء أو آية قصيرة", "With a short prayer or verse"),
  I("f-cup", "favor", "cup", "#ffc76b", 2, "كوب صغير بالاسم", "Small cup with the name", "للاستقبال الكبير", "For a bigger welcome"),
  I("f-flower", "favor", "flower", "#ff9fb8", 2, "وردة مغلفة", "Wrapped single flower", "لمستقبلات المستشفى", "For hospital visitors"),

  // ---------- gifts for the mother ----------
  I("m-robe", "mother", "spa", "#ff9fb8", 2, "روب مريح للمستشفى", "Comfy hospital robe", "قطني بأزرار أمامية", "Cotton with front buttons"),
  I("m-pillow", "mother", "moon", "#b8a6ff", 2, "مخدة رضاعة", "Nursing pillow", "تريح الظهر واليدين", "Easier on back and arms"),
  I("m-spa", "mother", "spa", "#7ed9c3", 3, "قسيمة سبا أو مساج", "Spa or massage voucher", "لما تكون جاهزة", "For when she's ready"),
  I("m-meals", "mother", "heart", "#ffc76b", 2, "وجبات جاهزة لأسبوع", "A week of ready meals", "أكبر راحة بأول الأيام", "The biggest help in the first days"),
  I("m-bottle", "mother", "cup", "#7cc4ff", 1, "قارورة ماء كبيرة", "Big water bottle", "تذكّرها تشرب ماء", "A reminder to keep drinking"),
  I("m-journal", "mother", "pen", "#ff9fb8", 1, "دفتر يوميات الأمومة", "Motherhood journal", "تكتب فيه أول اللحظات", "For the first moments"),
  I("m-jewelry", "mother", "sparkle", "#ffc76b", 3, "تعليقة بحرف البيبي", "Necklace with baby's initial", "ذكرى ناعمة", "A delicate keepsake"),
  I("m-care", "mother", "drop", "#7ed9c3", 2, "طقم عناية بعد الولادة", "Postpartum care kit", "كريمات وزيوت لطيفة", "Gentle creams and oils"),
  I("m-flowers", "mother", "flower", "#ff9fb8", 2, "باقة ورد", "A bouquet", "بألوان ناعمة", "In soft colours"),
];
