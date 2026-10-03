import type { Item, ListKey, TimelineItem } from "./types";

/** Starter lists created with a new plan. Deterministic ids so browser and server agree. */
type Seed = [cat: string, en: string, ar: string, qty?: number];

const sos: Seed[] = [
  ["kit", "Safety pins", "دبابيس أمان"],
  ["kit", "Needle and thread", "إبرة وخيط"],
  ["kit", "Fashion tape", "شريط لاصق للملابس"],
  ["kit", "Stain remover pen", "قلم إزالة البقع"],
  ["kit", "Tissues", "مناديل"],
  ["kit", "Wet wipes", "مناديل مبللة"],
  ["kit", "Plasters", "لاصق جروح"],
  ["kit", "Hairpins", "دبابيس شعر"],
  ["kit", "Hair spray", "مثبت شعر"],
  ["kit", "Deodorant", "مزيل عرق"],
  ["kit", "Your perfume", "عطرك"],
  ["kit", "Lipstick and powder", "أحمر الشفاه والبودرة"],
  ["kit", "Phone charger and power bank", "شاحن وباور بانك"],
  ["kit", "Water and light snacks", "ماء ووجبات خفيفة"],
  ["kit", "Backup shoes", "حذاء احتياطي"],
  ["kit", "Small mirror", "مرآة صغيرة"],
  ["kit", "Small scissors", "مقص صغير"],
  ["kit", "Double-sided tape", "لاصق على الوجهين"],
  ["kit", "Contact lens case and solution", "علبة ومحلول العدسات"],
  ["kit", "Comfort items you personally use", "مستلزماتك الشخصية المعتادة"],
];

const packing: Seed[] = [
  ["documents", "Passports", "الجوازات"],
  ["documents", "Visas and bookings (printed)", "التأشيرات والحجوزات مطبوعة"],
  ["documents", "Travel insurance", "تأمين السفر"],
  ["documents", "Cards and some local currency", "البطاقات وبعض العملة المحلية"],
  ["clothing", "Day outfits", "ملابس النهار", 6],
  ["clothing", "Evening outfits", "ملابس السهرة", 3],
  ["clothing", "Abayas and scarves", "العبايات والشيلات", 2],
  ["clothing", "Nightwear", "ملابس النوم", 3],
  ["shoes", "Walking shoes", "حذاء مشي"],
  ["shoes", "Evening shoes", "حذاء سهرة"],
  ["beauty", "Skincare essentials", "أساسيات العناية بالبشرة"],
  ["beauty", "Makeup bag", "حقيبة المكياج"],
  ["beauty", "Sunscreen", "واقي الشمس"],
  ["electronics", "Phone chargers", "شواحن الجوال"],
  ["electronics", "Travel adapter", "محوّل كهرباء"],
  ["electronics", "Power bank", "باور بانك"],
  ["accessories", "Sunglasses", "نظارة شمسية"],
  ["accessories", "Jewellery pouch", "حافظة المجوهرات"],
  ["beach", "Swimwear and cover-up", "ملابس السباحة"],
  ["essentials", "Personal medication (as prescribed)", "أدويتك الشخصية حسب وصف الطبيب"],
  ["essentials", "Prayer essentials", "مستلزمات الصلاة"],
];

const trousseau: Seed[] = [
  ["abayas", "Occasion abayas", "عبايات مناسبات", 3],
  ["abayas", "Daily abayas", "عبايات يومية", 3],
  ["clothes", "Day dresses", "فساتين نهارية", 5],
  ["occasion", "Visit and gathering outfits", "ملابس الزيارات والعزايم", 4],
  ["nightwear", "Nightwear sets", "أطقم نوم", 6],
  ["lingerie", "Lingerie sets", "ملابس داخلية", 8],
  ["homewear", "Comfortable home outfits", "ملابس بيت مريحة", 5],
  ["shoes", "Heels", "كعب", 2],
  ["shoes", "Flats and sandals", "أحذية مسطحة وصنادل", 3],
  ["bags", "Handbags", "حقائب يد", 2],
  ["accessories", "Scarves and shaylas", "شيلات وأوشحة", 6],
  ["perfumes", "Perfumes and oud", "عطور ودهن عود", 3],
  ["makeup", "Makeup essentials", "أساسيات المكياج"],
  ["skincare", "Skincare set", "طقم العناية بالبشرة"],
  ["haircare", "Haircare set", "طقم العناية بالشعر"],
  ["prayer", "Prayer outfit", "جلال الصلاة", 2],
  ["storage", "Storage organisers", "منظمات للخزانة"],
];

const home: Seed[] = [
  ["bedroom", "Bed and mattress", "السرير والمرتبة"],
  ["bedding", "Bedding sets", "أطقم المفارش", 3],
  ["bedding", "Pillows and duvet", "المخدات واللحاف"],
  ["towels", "Bath and hand towels", "مناشف الحمام واليد", 8],
  ["bathroom", "Bathroom accessories", "إكسسوارات الحمام"],
  ["kitchen", "Kitchen tools set", "أدوات المطبخ"],
  ["cookware", "Pots and pans", "القدور والمقالي"],
  ["appliances", "Fridge", "الثلاجة"],
  ["appliances", "Washing machine", "الغسالة"],
  ["appliances", "Oven and microwave", "الفرن والمايكروويف"],
  ["appliances", "Coffee machine", "آلة القهوة"],
  ["dinnerware", "Dinner set", "طقم السفرة"],
  ["glassware", "Glasses and cups", "الكاسات والفناجين"],
  ["dinnerware", "Arabic coffee set (dallah and cups)", "طقم القهوة العربية (دلة وفناجين)"],
  ["living", "Living room seating", "جلسة الصالة"],
  ["living", "Rug and curtains", "السجاد والستائر"],
  ["dining", "Dining table", "طاولة الطعام"],
  ["laundry", "Iron and laundry baskets", "المكواة وسلال الغسيل"],
  ["cleaning", "Cleaning supplies", "أدوات التنظيف"],
  ["storage", "Wardrobe organisers", "منظمات الخزائن"],
  ["fragrance", "Bakhoor and mabkhara", "البخور والمبخرة"],
  ["personal", "Bathroom personal items", "المستلزمات الشخصية"],
];

const groom: Seed[] = [
  ["outfit", "Wedding thobe", "ثوب الزواج"],
  ["outfit", "Bisht", "البشت"],
  ["accessories", "Shoes", "الحذاء"],
  ["accessories", "Watch", "الساعة"],
  ["accessories", "Perfume and oud", "العطر ودهن العود"],
  ["grooming", "Haircut and grooming", "الحلاقة والتجهيز"],
  ["documents", "Groom's documents", "أوراق العريس"],
];

const timeline: [string, string, string, string?][] = [
  ["08:00", "Wake up and breakfast", "الاستيقاظ والفطور"],
  ["09:30", "Hair preparation begins", "بداية تجهيز الشعر", "مصففة الشعر"],
  ["11:00", "Makeup begins", "بداية المكياج", "خبيرة المكياج"],
  ["13:00", "Photographer arrives", "وصول المصورة", "المصورة"],
  ["13:30", "Getting-ready photos", "تصوير التجهيزات"],
  ["15:00", "Dress and final touches", "لبس الفستان واللمسات الأخيرة", "الأم والأخت"],
  ["16:00", "Family photos", "صور العائلة"],
  ["18:30", "Leave for the venue", "التحرك إلى القاعة"],
  ["20:00", "Guests arrive", "وصول الضيوف"],
  ["21:30", "Bride's entrance and zaffa", "دخول العروس والزفّة"],
  ["22:30", "Dinner is served", "تقديم العشاء"],
  ["23:30", "Cake and family moments", "الكيك ولحظات العائلة"],
];

const build = (list: ListKey, seeds: Seed[], lang: "en" | "ar"): Item[] =>
  seeds.map(([cat, en, ar, qty], i) => ({ id: `${list}-${i + 1}`, list, cat, name: lang === "ar" ? ar : en, status: "need", qty }));

export function seedLists(lang: "en" | "ar", opts: { home: boolean; honeymoon: boolean; groom: boolean }) {
  return [
    ...build("sos", sos, lang),
    ...build("trousseau", trousseau, lang),
    ...(opts.home ? build("home", home, lang) : []),
    ...(opts.honeymoon ? build("packing", packing, lang) : []),
    ...(opts.groom ? build("groom", groom, lang) : []),
  ];
}

export function seedTimeline(lang: "en" | "ar"): TimelineItem[] {
  return timeline.map(([time, en, ar, who], i) => ({ id: `tl-${i + 1}`, time, title: lang === "ar" ? ar : en, who: who && lang === "ar" ? who : undefined }));
}
