import { favorBases, favorCats, type FavorCat } from "./favor-ideas";
import { ideas as baseIdeas } from "./ideas";
import { moreBlocks, moreFavorBlocks } from "./more-ideas";
import { refreshed } from "./refresh-ideas";

/**
 * Every ready idea in «حكاية قدوم», each one distinct (no repeats with a different wrapping).
 * Plain suggestions: no shops, no ads, no medical advice. One tap adds it to the right place.
 */
export type IdeaKind = "favor" | "gift" | "mother" | "decor" | "sign" | "hosp" | "photo" | "aqiqah" | "hospital" | "keepsake" | "thanks";
export type AnyIdea = { id: string; kind: IdeaKind; cat?: FavorCat; ar: string; en: string; arNote?: string; enNote?: string; price?: 1 | 2 | 3 };

export const ideaKinds: { kind: IdeaKind; ar: string; en: string; color: string }[] = [
  { kind: "favor", ar: "توزيعات", en: "Favors", color: "#e8a5b5" },
  { kind: "gift", ar: "هدايا للبيبي", en: "Gifts for baby", color: "#a9c1dc" },
  { kind: "mother", ar: "هدايا للأم", en: "Gifts for mum", color: "#c9b8e0" },
  { kind: "decor", ar: "ديكور الاستقبال", en: "Welcome decor", color: "#efd28f" },
  { kind: "sign", ar: "لوحة الاسم", en: "Name sign", color: "#d9b38c" },
  { kind: "hosp", ar: "ضيافة", en: "Hospitality", color: "#bcd3b3" },
  { kind: "photo", ar: "أفكار تصوير", en: "Photo ideas", color: "#a9c1dc" },
  { kind: "hospital", ar: "استقبال المستشفى", en: "Hospital welcome", color: "#f2b8c6" },
  { kind: "aqiqah", ar: "العقيقة", en: "Aqiqah", color: "#c9d6b8" },
  { kind: "keepsake", ar: "ذكريات تبقى", en: "Keepsakes", color: "#e6c7a8" },
  { kind: "thanks", ar: "رسائل شكر", en: "Thank-you notes", color: "#e8a5b5" },
];

const L = (kind: IdeaKind, block: string): AnyIdea[] =>
  block
    .trim()
    .split("\n")
    .map((line, i) => {
      const [ar, en, p] = line.split("|").map((x) => x.trim());
      return { id: `${kind}-${i + 1}`, kind, ar, en, ...(p ? { price: Number(p) as 1 | 2 | 3 } : {}) };
    });

// Rarer favors on top of the 256 classic ones.
const rareFavors = (cat: FavorCat, block: string): AnyIdea[] =>
  block
    .trim()
    .split("\n")
    .map((line, i) => {
      const [ar, en, p] = line.split("|").map((x) => x.trim());
      return { id: `favor-rare-${cat}-${i + 1}`, kind: "favor" as const, cat, ar, en, price: (Number(p) || 1) as 1 | 2 | 3 };
    });

const extraFavors: AnyIdea[] = [
  ...rareFavors("sweets", `
كوكيز بطباعة صورة أول أشعة|Cookies printed with the first scan image|2
شوكولاتة بختم شمع باسم البيبي|Chocolate with a wax seal of the baby's name|2
لقيمات بدبس التمر الملوّن|Luqaimat with tinted date syrup|1
مكعبات راحة الحلقوم بالورد|Rose Turkish-delight cubes|1
ميرانغ على شكل غيوم|Cloud-shaped meringues|1
حلوى قطن بنكهة الهيل|Cardamom cotton candy|1
كعك بالتمر على شكل هلال|Crescent date cookies|1
شوكولاتة على شكل حروف الاسم|Chocolate letters spelling the name|2
كيكة بالكوب مع ملعقة خشب|Cake-in-a-cup with a wooden spoon|2
فطائر محلّاة ميني بالعسل|Mini honey pastries|1
تشوكلت بار بغلاف خريطة الولادة|Chocolate bar wrapped in a "birth map"|1
كوكيز منقوش بحرف البيبي الأول|Embossed initial cookies|1
ماكرون مطبوع عليه وجه بيبي|Macarons with a printed baby face|2
عسل بقوارير زجاج على شكل نحلة|Bee-shaped honey vials|2
حلاوة بالزعفران بعلبة دائرية|Saffron halwa in a round tin|2
مكسرات مغطاة بالسكر الوردي أو الأزرق|Pink or blue sugar-coated nuts|1
بسكويت بطابع البصمة الحقيقية للبيبي|Biscuits stamped with the real baby footprint|2
فدج بالحليب والهيل على شكل قلب|Cardamom milk fudge hearts|1
أصابع شوكولاتة ملفوفة بشريط باسم|Chocolate fingers with a name band|1
حلوى «أول سن» بعلبة صغيرة|"First tooth" sweet box|1`),
  ...rareFavors("scents", `
شمعة بعطر «رائحة البيبي» (بودرة)|"Baby smell" powder-scented candle|2
بخور بخلطة خاصة باسم المولود|Custom bakhoor blend named after the baby|3
شمعة داخلها بذور زهور|Candle with flower seeds inside|2
عطر ميني بخلطة «أول حضن»|"First hug" mini perfume blend|3
كيس عطري بقماش موسلين البيبي|Scent sachet in baby muslin|1
مبخرة سيراميك بشكل غيمة|Cloud-shaped ceramic burner|3
أعواد بخور يابانية خفيفة|Light Japanese incense sticks|2
عطر وسادة بالبابونج|Chamomile pillow mist|2
شمع ذائب للتعطير (واكس ملت)|Scented wax melts|1
قارورة عطر بفلين محفور بالتاريخ|Perfume vial with a date-engraved cork|2`),
  ...rareFavors("plants", `
بذور «شجرة العمر» تكبر مع البيبي|"Tree of life" seeds to grow with the baby|1
مكعب خشب ينبت منه نبات|Wooden cube that sprouts a plant|2
بيضة تنبت بذور|Seed-growing egg|1
بذور في علبة كبريت مطبوعة|Seeds in a printed matchbox|1
بطاقة بذور على شكل بصمة|Footprint-shaped seed card|1
أصيص صغير بوجه مبتسم|Smiling-face mini pot|1
كرة طين بالبذور (بذور كرات)|Clay seed bomb|1
شتلة زعتر في كوب مطبوع|Thyme seedling in a printed cup|1
مزرعة ميني في قارورة|Mini garden in a jar|2
بذور ياسمين مع تعليمات مرسومة|Jasmine seeds with illustrated steps|1`),
  ...rareFavors("keepsakes", `
صورة بولارويد مع ختم التاريخ|Polaroid with a date stamp|1
بطاقة «تنبؤ» يكتب فيها الضيف أمنية للبيبي|"Wish card" guests fill for the baby|1
قطعة بازل من لوحة كبيرة للبيبي|A puzzle piece of the baby's big board|1
طابع بريد مخصص باسم المولود|Custom postage-style stamp|1
ميدالية من ريزن فيها ورود مجففة|Resin keychain with dried flowers|2
حجر مرسوم عليه حرف البيبي|Painted stone with the initial|1
مرآة صغيرة بإطار مطرز|Mini mirror with an embroidered frame|2
فاصل كتاب من ورود حقيقية مجففة|Pressed-flower bookmark|1
شريط ساتان مطبوع بالتاريخ والوزن|Satin ribbon printed with date and weight|1
ورقة دعاء مرولة بخيط ذهبي|Rolled prayer scroll tied with gold thread|1`),
  ...rareFavors("care", `
مرطب شفاه بنكهة حليب الماعز|Goat-milk lip balm|1
صابون بقالب بصمة يد البيبي|Soap moulded from the baby's handprint|2
زيت الشعر بالحناء والسدر|Henna and sidr hair oil|2
ملح استحمام بلون الاستقبال|Bath salt in the welcome colour|1
كريم يد بعطر المسك والحليب|Musk-milk hand cream|1
قناع شعر بالحليب والعسل|Milk & honey hair mask|2
ليفة طبيعية من القرع|Natural loofah|1
مشط خشب محفور بالاسم|Name-engraved wooden comb|2`),
  ...rareFavors("drinks", `
قهوة مختومة بتاريخ الولادة|Coffee sealed with the birth date|2
خلطة كرك جاهزة بقارورة|Ready karak mix in a jar|1
شاي بالورد المحمدي المجفف|Mohammadi rose tea|1
عصير رمان بقوارير صغيرة|Mini pomegranate juice bottles|1
خلطة حليب ذهبي (كركم وهيل)|Golden milk mix|1
فلتر قهوة مقطّر مع ظرف قهوة|Pour-over coffee filter sachet|2
مكعبات ثلج قهوة مجمدة للتحضير|Frozen coffee cubes kit|2
زعفران مع قارورة ماء ورد|Saffron with a rose-water vial|3`),
  ...rareFavors("paper", `
بطاقة «أمنية لعمر ١٨» تُفتح لاحقًا|"Open at 18" wish card|1
خريطة النجوم ليلة الولادة مطبوعة|Printed star map of the birth night|2
تقويم صغير يبدأ بشهر الولادة|Mini calendar starting with the birth month|1
بطاقات ألعاب ورقية بالأسماء|Name-printed card game|2
ورق تغليف مطبوع بالحروف|Gift paper printed with initials|1
قصة قصيرة مطبوعة عن قدوم البيبي|Printed short story about the baby's arrival|2
كرت مقاس البيبي (طول ووزن) للذكرى|Size card with length and weight|1`),
  ...rareFavors("kids", `
لعبة ورق لتلبيس البيبي|Paper dress-up baby doll|1
أقنعة حيوانات من اللباد|Felt animal masks|1
صفارة خشب على شكل طائر|Wooden bird whistle|1
بالون مع رسالة بداخله|Balloon with a message inside|1
مجموعة رسم بالماء السحري|Magic water-colouring book|1
كيس مفاجآت بالأخ الكبير/الأخت الكبيرة|"Big sibling" surprise pouch|2
ميدالية «صرت أخ/أخت كبير»|"I'm a big sibling" badge|1
ورق قص ولصق لبطاقة ترحيب|Cut-and-paste welcome card kit|1`),
  ...rareFavors("healthy", `
كرات تمر بالكاكاو والجوز|Cocoa-walnut date balls|1
مكسرات منقوعة ومحمصة|Activated roasted nuts|2
خبز أسمر صغير بالتمر|Mini date brown bread|1
خلطة شوفان ليلية بقارورة|Overnight oats jar|1
تفاح مجفف بالقرفة|Cinnamon dried apples|1
عصير أخضر بقارورة صغيرة|Small green juice|1`),
  ...rareFavors("heritage", `
مكحلة فضية مصغرة|Mini silver kohl pot|3
صرة قماش فيها لبان وهيل|Cloth bundle of frankincense and cardamom|1
فنجان قهوة بنقش سدو|Sadu-pattern coffee cup|2
مدخن صغير من الفخار العماني|Small Omani clay burner|2
حلوى عمانية بالزعفران بعلبة خوص|Saffron halwa in a palm-leaf box|2
عقد ورد من الياسمين الطبيعي|Fresh jasmine garland|1
حلوى رنجينة بالتمر|Date ranginak|1
مسباح من نوى التمر|Date-seed prayer beads|2
خوصة سعف بالاسم|Palm-frond weave with the name|1
قارورة دهن عود صغيرة|Small oud oil vial|3`),
  ...rareFavors("sweets", `
بقلاوة ميني بالفستق بعلبة ذهبية|Mini pistachio baklava in a gold box|2
حلوى «سلطانة» بالزعفران|Saffron sultana sweets|2
كيك بوب على شكل رأس دبدوب|Teddy-head cake pops|1
بسكويت ساندويتش بكريمة وردية|Pink-cream sandwich biscuits|1
حلاوة بالسمسم والعسل|Sesame-honey brittle|1
تمر مغلف بورق ذهب صالح للأكل|Dates wrapped in edible gold leaf|3
شوكولاتة بالكراميل والملح البحري|Sea-salt caramel chocolate|2
ماربل كيك بشرائح صغيرة|Marble cake slices|1
كوكيز بالشوفان والتمر|Oat & date cookies|1
حلوى مارون جلاسيه|Candied chestnuts|3
جيلي بالرمان بأكواب|Pomegranate jelly cups|1
فطائر تفاح ميني|Mini apple pies|1
كوكيز بطعم الزعفران والفستق|Saffron-pistachio cookies|2
حلوى غزل بنات بعلبة شفافة|Fairy floss in a clear tin|1
ترافل التمر بجوز الهند|Coconut date truffles|1
كعك المعمول بشكل قلوب|Heart-shaped maamoul|1
مادلين بالليمون|Lemon madeleines|1
كوكيز بلوحة ألوان قابلة للتلوين|Paint-your-own cookie|2
مصاصات شوكولاتة على شكل نجمة|Star chocolate lollipops|1
خبز الزنجبيل على شكل عربة بيبي|Pram-shaped gingerbread|1`),
  ...rareFavors("scents", `
بخور معمول بالورد الطائفي|Taif-rose bakhoor|3
زيت عطري للمخدة باللافندر والبابونج|Lavender-chamomile pillow oil|2
قارورة عطر زجاج على شكل قطرة|Drop-shaped perfume bottle|2
شمعة من شمع العسل الطبيعي|Pure beeswax candle|2
أكياس عطرية بالأرز والعطر|Rice-and-scent sachets|1
عطر مسك الطهارة صغير|Small white musk (tahara)|1
معطر ملابس بأعواد الصندل|Sandalwood wardrobe sticks|2
شمعة في كوب شاي استكانة|Candle in an istikan tea glass|2`),
  ...rareFavors("plants", `
نبتة نعناع في كوب قهوة عربي|Mint in an Arabic coffee cup|1
بذور ريحان في كيس قماش|Basil seeds in a cloth bag|1
شتلة زيتون صغيرة|Small olive sapling|3
بذور سدر محلية|Local sidr seeds|1
أصيص فخار مطبوع بالبصمة|Clay pot with a footprint print|2
بذور لافندر في قارورة|Lavender seeds in a vial|1
شتلة ياسمين عربي|Arabian jasmine plant|2
بطاقة بذور بآية «كمثل حبة»|Seed card with the "like a grain" verse|1`),
  ...rareFavors("keepsakes", `
قطعة خزف مرسومة بخط اليد|Hand-painted ceramic tile|2
مغناطيس من الخشب بشكل بيبي|Wooden baby magnet|1
ساعة جيب صغيرة محفورة|Engraved mini pocket watch|3
حامل مفاتيح جلد بالاسم|Leather name key holder|2
صندوق مجوهرات ميني مخمل|Mini velvet jewellery box|2
شريط قياس بالاسم للذكرى|Keepsake name tape measure|1
بطاقة «اكتب نصيحة للأم»|"Write advice for mum" card|1
ميدالية برج ميلاد البيبي|Baby's star-sign charm|2
قلادة بحبة لؤلؤ صغيرة|Single-pearl necklace|3
حافظة صور جلد صغيرة|Small leather photo wallet|2`),
  ...rareFavors("care", `
بلسم شعر طبيعي بالأرغان|Argan hair balm|2
ملح استحمام بالورد المجفف|Dried-rose bath salt|1
كريم ليلي بالحليب والعسل|Milk & honey night cream|2
مقص وأدوات أظافر بحقيبة صغيرة|Mini manicure kit|2
فرشاة جسم خشب|Wooden body brush|1
مرطب يد بالزعفران|Saffron hand balm|2`),
  ...rareFavors("drinks", `
قهوة عربية مع فنجانين بعلبة|Arabic coffee with two cups in a box|3
مشروب الهيل والزعفران الجاهز|Ready cardamom-saffron drink mix|1
أعشاب تهدئة للنوم|Calming bedtime herbs|1
عصير جزر وبرتقال بقارورة|Carrot-orange juice bottle|1
شاي بالقرفة والبرتقال|Cinnamon-orange tea|1
خلطة قهوة تركية بالهيل|Cardamom Turkish coffee|1`),
  ...rareFavors("paper", `
دفتر وصفات الأم مطبوع|Printed "mum's recipes" booklet|2
بطاقة «اختاروا اسم لعبة البيبي»|"Name the baby's toy" card|1
ملصقات بصمة البيبي للشكر|Footprint thank-you stickers|1
بطاقات معاني الأسماء العربية|Arabic name-meaning cards|1
كتيب قصص قبل النوم|Bedtime stories booklet|2
ظرف فيه بذور ورسالة|Envelope with seeds and a note|1`),
  ...rareFavors("kids", `
فرشاة أسنان أطفال باسم البيبي|Kids' toothbrush with the baby's name|1
كتاب ملصقات «أخوي الصغير»|"My little sibling" sticker book|1
دمية إصبع حيوانات|Animal finger puppets|1
مكعبات خشب بالأحرف|Wooden letter blocks|2
لعبة ذاكرة بالصور|Picture memory game|2
أقلام شمع على شكل أحجار|Rock-shaped crayons|1`),
  ...rareFavors("healthy", `
خلطة بذور الشيا والعسل|Chia & honey mix|1
تمر عجوة بعلبة صغيرة|Ajwa dates mini box|2
فول سوداني بالعسل|Honey peanuts|1
شيبس شمندر مقرمش|Beetroot crisps|1
ألواح بروتين منزلية|Homemade protein bars|1
زبيب ذهبي ومشمش|Golden raisins and apricots|1`),
  ...rareFavors("heritage", `
خنجر شوكولاتة بغلاف فضي|Silver-wrapped chocolate khanjar|2
لبان مر بعلبة خشب|Myrrh in a wooden box|2
فنجان «خمسة» للحماية بالخرز|Blue-bead coffee cup charm|1
وعاء فخار صغير بالبخور|Clay bowl with bakhoor|2
تمر بالسمسم على الطريقة البحرينية|Bahraini sesame dates|1
حلوى «المهلبية الكويتية»|Kuwaiti muhallabia|1
قرص تمر إماراتي|Emirati date cake|1
خبز «الخمير» محلّى|Sweet khameer bread|1`),
];

const listed: AnyIdea[] = [
  ...favorBases.map((b) => ({ id: `favor-${b.id}`, kind: "favor" as const, cat: b.cat, ar: b.ar, en: b.en, price: b.price })),
  ...extraFavors,
  ...baseIdeas.filter((x) => x.cat !== "favor").map((x) => ({ id: `base-${x.id}`, kind: x.cat === "mother" ? ("mother" as const) : ("gift" as const), ar: x.ar, en: x.en, arNote: x.arNote, enNote: x.enNote, price: x.price })),
  ...L("gift", `
موبايل سرير من اللباد بغيوم|Felt cloud crib mobile|2
كتاب قماش بأسماء أفراد العائلة|Cloth book with family names|2
ساعة حائط باسم البيبي|Name wall clock|2
لوحة نمو (مسطرة طول) خشب|Wooden growth-chart ruler|2
صندوق ذكريات السنة الأولى|First-year memory box|2
بطانية بطاقات شهرية للتصوير|Monthly milestone blanket|2
بطاقات المراحل الشهرية|Milestone cards set|1
مجموعة ملابس «أول عيد»|"First Eid" outfit|2
لحاف مطرز بالسدو|Sadu-embroidered quilt|3
مصحف صغير مخصص بالاسم|Personalised small Quran|3
سجادة صلاة صغيرة باسم الطفل|Child's name prayer mat|2
دمية بالحجاب أو الغترة|Doll in hijab or ghutra|2
عضاضة سيليكون على شكل تمرة|Date-shaped silicone teether|1
ألعاب تطوّر حسي خشبية|Wooden sensory toys|2
مرآة أمان لعب على البطن|Tummy-time mirror|2
حصيرة لعب ناعمة|Soft play mat|3
جهاز مراقبة بيبي|Baby monitor|3
سلة تغيير متنقلة|Portable changing caddy|2
حقيبة أغراض البيبي|Diaper bag|3
كيس نوم مناسب للعمر|Age-appropriate sleep sack|2
أحذية قماش لأول خطوات|Soft first-step shoes|1
قبعة شمس وحماية|Sun hat|1
طقم مناشف بقبعة بآذان|Hooded towels with ears|1
وسادة لعب مع ألعاب معلقة|Activity gym|3
كتاب «قصتي» يملأه الأهل|"My story" book for parents to fill|2
بصمات يد وقدم بالجبس|Plaster hand & foot cast kit|2
تعليقة ذهب «ما شاء الله»|Gold "Masha'Allah" charm|3
اشتراك صور شهري مع مصورة|Monthly photo-session package|3
مصباح ليلي هادئ|Gentle night light|2
حامل لهاية بالاسم|Name pacifier clip|1
كرسي طعام لاحقًا|High chair for later|3
مقعد استحمام|Bath seat|2
جهاز تعقيم رضاعات|Bottle steriliser|3
مدفأة رضاعات|Bottle warmer|2
ملابس مقاسات أكبر (٦–١٢ شهر)|Bigger sizes (6–12 months)|1
صندوق ألعاب بالاسم|Name toy chest|2`),
  ...L("mother", `
بيجامة رضاعة مريحة|Nursing pyjamas|2
حمالة رضاعة|Nursing bra|2
وسادة ظهر للسرير|Bed back pillow|2
اشتراك وجبات صحية لأسبوعين|Two weeks of healthy meals|3
ساعة ذكية لتتبع النوم|Sleep-tracking watch|3
سماعات عازلة للراحة|Noise-cancelling headphones|3
كتاب خفيف عن الأمومة|A light motherhood read|1
مدلّكة كهربائية للظهر|Back massager|3
قارورة شاي أعشاب بفلتر|Tea flask with infuser|1
روب بالاسم مطرز|Embroidered name robe|2
مساعدة منزلية لعدة أيام|A few days of home help|3
جلسة تصوير للأم والبيبي|Mum & baby photo session|3
أساور الأم بأحرف الأطفال|Mum bracelet with children's initials|3
عطر جديد بمناسبة الأمومة|A new "motherhood" perfume|3
كوب حراري يحافظ على القهوة|Thermal mug that keeps coffee warm|1
جدول رضاعات مطبوع جميل|Pretty printed feeding log|1
دفتر ذكريات الحمل|Pregnancy memory journal|2
شالة نوم ناعمة|Soft sleep shawl|2
جوارب دافئة|Cosy socks|1
مخدة حمل وولادة|Pregnancy pillow|2`),
  ...L("decor", `
قوس بالونات بألوان الاستقبال|Balloon arch in the welcome colours
خلفية تصوير بالغيوم والنجوم|Clouds-and-stars photo backdrop
ستارة ورد طبيعي|Fresh-flower curtain
طاولة حلويات بطبقات|Tiered sweets table
شجرة أمنيات يعلق الضيوف فيها بطاقات|Wish tree for guests' cards
حروف اسم البيبي بالخشب الكبير|Big wooden name letters
ممر بالونات شفافة فيها ورود|Clear balloons with petals inside
سلة ترحيب عند الباب|Welcome basket at the door
مخدات مطرزة بالاسم في المجلس|Name cushions in the majlis
إضاءة خيوط ناعمة|Soft fairy lights
سحب قطنية معلقة من السقف|Cotton clouds hanging from the ceiling
طاولة بصمات للضيوف|Guest fingerprint tree table
لوحة «أهلًا بالدنيا» على حامل|"Welcome to the world" easel sign
تنسيق ورد بأوعية رضاعات زجاج|Flowers in glass bottles
مفارش طاولات بنقشة السدو|Sadu table runners
صندوق بريد للأمنيات|Wishes post box
ركن تصوير بكرسي هزاز صغير|Photo nook with a tiny rocking chair
ستاند ماء ورد وبخور للضيوف|Rose-water and bakhoor station
أكواب قهوة مطبوعة بالاسم|Name-printed coffee cups
تنسيق شموع LED آمنة|Safe LED candle arrangement
كوشة ناعمة بالقماش الشيفون|Soft chiffon backdrop
طاولة ذكريات بصور الحمل|Pregnancy photo memory table
جدار نجوم ذهبية ورقية|Gold paper-star wall
بالونات هيليوم بأوزان مكتوب عليها|Helium balloons with written weights
سجادة مدخل مطبوعة بالاسم|Name doormat
شريط ترحيب على الدرج|Welcome ribbon on the stairs
مزهريات صغيرة على كل طاولة|Small vases on every table
لافتة «بيت جديد عليه بيبي»|"New baby in this house" banner
ركن الأطفال بألعاب وكتب|Kids' corner with toys and books
ستاند تمر وقهوة بتنسيق خليجي|Gulf-style dates & coffee stand`),
  ...L("sign", `
لوحة أكريليك شفافة بخط ذهبي|Clear acrylic sign with gold lettering
لوحة خشب منقوشة يدويًا|Hand-carved wooden sign
اسم بالورد الطبيعي|Name in fresh flowers
اسم نيون بإضاءة دافئة|Warm neon name light
لوحة بخط عربي (ثلث أو ديواني)|Arabic calligraphy sign (Thuluth or Diwani)
اسم بالبالونات الفويل|Foil balloon letters
لوحة سدو مطرزة بالاسم|Sadu-embroidered name panel
اسم على إطار دائري بالورد|Round floral hoop with the name
لوحة بمعنى الاسم وتاريخ الولادة|Sign with the name's meaning and birth date
لوحة مرايا محفورة|Engraved mirror sign
اسم بحروف قماش محشوة|Stuffed fabric letters
لوحة طباشير مرسومة يدويًا|Hand-drawn chalkboard sign
لوحة على حامل خشب مع غيوم|Easel sign with clouds
اسم مطرز على طوق تطريز|Embroidery-hoop name
لوحة بالخط الكوفي الحديث|Modern Kufic sign
اسم بالشمع على مرآة كبيرة|Name on a large mirror
لوحة بطباعة الصوت (موجة صوت أول بكاء)|Sound-wave print of the first cry
لوحة ببصمة القدم واليد|Hand and footprint sign
حروف خشب معلقة بشريطة|Hanging wooden letters on a ribbon
لوحة باب غرفة البيبي|Nursery door name plate`),
  ...L("hosp", `
قهوة عربية بالزعفران|Saffron Arabic coffee
شاي كرك بالحليب|Karak tea
حليب بالزعفران والهيل|Saffron-cardamom milk
تمر محشي بمكسرات وتوب شوكولاتة|Stuffed dates with chocolate
لقيمات بدبس التمر|Luqaimat with date syrup
عصيدة صغيرة بأكواب|Mini aseeda cups
خبز رقاق بالعسل والجبن|Regag bread with honey and cheese
ساندويتشات ميني|Mini sandwiches
سلطة فواكه بأكواب|Fruit salad cups
بلاليط بالبيض|Balaleet with egg
فطائر جبن ومحمرة|Cheese and muhammara pastries
كب كيك بتوبر|Topper cupcakes
كيك الهيل والزعفران|Cardamom-saffron cake
عصير ليمون بالنعناع|Mint lemonade
ماء بالخيار والنعناع|Cucumber-mint water
مكسرات محمصة بأطباق صغيرة|Roasted nuts in small dishes
كنافة ميني|Mini kunafa
بسبوسة بالقشطة|Basbousa with cream
محلبية بالورد|Rose muhallabia
خبيصة|Khabeesa
هريس صغير بالأكواب|Mini harees cups
مضروبة دجاج|Madhrooba
شوربة عدس صغيرة|Small lentil soup cups
معجنات زعتر|Zaatar pastries
بطاطس بالكوب|Potato cups
عصائر طازجة متنوعة|Assorted fresh juices
شاي أخضر بالنعناع|Mint green tea
مشروب الزنجبيل بالعسل|Ginger-honey drink
قهوة مقطرة باردة|Cold brew coffee
ستاند آيس كريم صغير|Mini ice-cream stand`),
  ...L("photo", `
صورة البيبي بين يدين الأب والأم|Baby held by both parents' hands
صورة الإخوة الكبار يحضنون البيبي|Big siblings hugging the baby
صورة قدمين صغيرة مع خاتم الأم|Tiny feet with mum's ring
صورة شهرية بنفس الكرسي|Monthly photo in the same chair
صورة مع دبدوب يكبر جنبه كل شهر|Same teddy each month to show growth
صورة لوحة الاسم مع الورد|Name sign with flowers
صورة الجد والجدة مع البيبي|Grandparents with the baby
صورة البيبي ملفوف بالسدو|Baby wrapped in Sadu
صورة أول أذان في أذن البيبي|The first adhan moment
صورة يد البيبي على يد الأب|Baby's hand on dad's hand
صورة من فوق والبيبي نايم بين الورد|Top-down shot among petals
صورة مع ملابس المستشفى الأولى|First hospital outfit
صورة «قبل وبعد» للبطن والبيبي|Bump-and-baby before/after
صورة بالأبيض والأسود لتفاصيل صغيرة|Black-and-white close details
صورة للأم مع أول رضعة (لها فقط)|First feed photo (private, for her)
صورة الحروف الأولى من اسم البيبي|Initial letters with the baby
صورة البيت يوم الوصول|The house on arrival day
صورة لكل الضيوف ببطاقات الأمنيات|Guests holding wish cards
فيديو قصير ١ ثانية كل يوم|One-second-a-day video
صورة شهرية جنب نفس الوردة|Monthly photo next to the same plant`),
  ...L("hospital", `
باقة ورد صغيرة عند سرير الأم|Small bouquet by mum's bed
توزيعات للممرضات مع بطاقة شكر|Thank-you treats for the nurses
لافتة باب الغرفة باسم البيبي|Name sign on the room door
بطانية ناعمة للزوار|Soft blanket for visitors
ستاند قهوة وتمر صغير في الغرفة|Mini coffee & dates stand in the room
صندوق شوكولاتة للزوار|Chocolate box for visitors
معطر غرفة خفيف|Light room scent
إضاءة ليلية ناعمة|Soft night light
لوح «ممنوع الإزعاج نحن نرتاح»|"Resting, please knock softly" sign
قائمة أرقام مهمة مطبوعة|Printed list of key numbers
شاحن طويل للجوال|Long phone charger
مخدة من البيت|A pillow from home
روب ونعال مريحة|Comfy robe and slippers
سماعة وقائمة أدعية وأذكار|Earphones with a calm adhkar playlist
بطاقات شكر جاهزة للزوار|Ready thank-you cards for visitors`),
  ...L("aqiqah", `
توزيع لحم العقيقة بأكياس مطبوعة|Aqiqah meat in printed bags
دعوة بسيطة بتاريخ العقيقة|Simple aqiqah invitation
ركن صدقة باسم المولود|Charity corner in the baby's name
بطاقة دعاء للمولود مع التوزيعات|Prayer card with the favors
تنسيق سفرة بأطباق خليجية|Gulf-style table setting
قدور مندي أو مضبي|Mandi or madhbi pots
ركن تمر وقهوة للضيوف|Dates & coffee corner
توزيعات عقيقة صغيرة للأطفال|Small aqiqah favors for kids
بطاقة بمعنى الاسم وسبب اختياره|Card with the name's meaning
كتيب أذكار صغير هدية|Small adhkar booklet as a gift
طباعة آية «ربِّ هب لي من لدنك ذرية طيبة»|Print of a verse on good offspring
قائمة توزيع للأهل والجيران|Distribution list for family and neighbours
أطباق تقديم مرسومة يدويًا|Hand-painted serving plates
ركن غسل اليدين بماء الورد|Rose-water handwashing corner
مصلّى صغير للضيوف|Small prayer corner for guests`),
  ...L("keepsake", `
خصلة الشعر الأولى في علبة|First lock of hair in a box
سوار المستشفى في إطار|Hospital bracelet in a frame
أول ملابس في صندوق ذكريات|First outfit in a memory box
رسالة من الأم تُقرأ عند ١٨ سنة|A letter from mum to open at 18
رسالة من الأب بنفس اليوم|A letter from dad on the same day
تسجيل صوتي لأول ضحكة|Voice recording of the first laugh
ألبوم صور شهري|Monthly photo album
كتاب أمنيات الضيوف|Guestbook of wishes
خريطة النجوم ليلة الولادة|Star map of the birth night
جريدة يوم الولادة|Newspaper from the birth day
بصمة اليد بالحبر على كرت|Ink handprint card
عدّاد أول سنة مع المراحل|First-year milestone tracker
كبسولة زمن تُفتح بعد ١٠ سنوات|Time capsule for 10 years later
أول صورة أشعة في إطار|First scan in a frame
مسبحة الأم في يوم الولادة|Mum's prayer beads from the birth day`),
  ...L("thanks", `
شكرًا لمحبتكم وهديتكم الحلوة، فرحتنا اكتملت بوجودكم|Thank you for your love and lovely gift. You completed our joy
الله يجزاكم خير على الهدية، وصلت وفرّحتنا كثير|May God reward you for the gift. It arrived and made us so happy
شكرًا من القلب، هديتكم بتكون من أحلى ذكريات {gift}|Heartfelt thanks, your gift will be one of the sweetest memories
وصلتنا هديتكم وكانت لمسة ما ننساها، الله لا يحرمنا منكم|Your gift was a touch we won't forget. May we never be without you
{name} شكرًا على {gift}، الله يسعدك مثل ما أسعدتينا|{name}, thank you for {gift}. May you be as happy as you made us
بيبينا يقول شكرًا على الهدية الحلوة|Our baby says thank you for the lovely gift
ممتنين لكم ولمحبتكم، الله يديم الود بيننا|Grateful for your love. May our bond last
شكرًا على حضوركم وهديتكم، نوّرتوا فرحتنا|Thank you for coming and for your gift. You lit up our joy
هديتكم وصلت وفيها ذوق ومحبة، شكرًا لكم|Your gift arrived full of taste and love. Thank you
الله يرزقكم من حيث لا تحتسبون، شكرًا على الهدية|May you be blessed beyond measure. Thank you for the gift`),
  // v6: five hundred more.
  ...(Object.entries(moreFavorBlocks) as [FavorCat, string][]).flatMap(([cat, block]) => rareFavors(cat, block)),
  ...(Object.entries(moreBlocks) as [IdeaKind, string][]).flatMap(([kind, block]) => L(kind, block)),
];

/** Unique ids by position (each idea text is unique too; a unit test checks both). */
export const allIdeas: AnyIdea[] = listed.map((x, i) => {
  const r = refreshed[x.en];
  return { ...x, ...(r ? { ar: r[0], en: r[1] } : {}), id: `${x.kind}-${i}` };
});

export const ideasOf = (kind: IdeaKind) => allIdeas.filter((x) => x.kind === kind);
export { favorCats };
