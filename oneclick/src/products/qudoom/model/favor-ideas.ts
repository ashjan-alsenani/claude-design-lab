/**
 * The favors (توزيعات) idea library: about 250 favors, each in 4 ways to present it (≈1000 ideas).
 * Plain suggestions only: no shops, no ads, prices as a rough level (1 simple · 2 mid · 3 higher).
 */
export type FavorCat = "sweets" | "scents" | "plants" | "keepsakes" | "care" | "drinks" | "paper" | "kids" | "healthy" | "heritage";
export type FavorBase = { id: string; cat: FavorCat; ar: string; en: string; price: 1 | 2 | 3 };
export type FavorStyle = { id: string; ar: string; en: string };
export type FavorIdea = FavorBase & { style: FavorStyle; key: string };

export const favorCats: { id: FavorCat; ar: string; en: string; color: string }[] = [
  { id: "sweets", ar: "حلويات", en: "Sweets", color: "#e8a5b5" },
  { id: "scents", ar: "عطور وبخور", en: "Scents", color: "#c9b8e0" },
  { id: "plants", ar: "نباتات وبذور", en: "Plants", color: "#a8c09f" },
  { id: "keepsakes", ar: "تذكارات", en: "Keepsakes", color: "#efd28f" },
  { id: "care", ar: "عناية", en: "Self-care", color: "#a9c1dc" },
  { id: "drinks", ar: "قهوة ومشروبات", en: "Coffee & drinks", color: "#d9b38c" },
  { id: "paper", ar: "قرطاسية ومطبوعات", en: "Paper & prints", color: "#e6c7a8" },
  { id: "kids", ar: "للأطفال", en: "For kids", color: "#f2b8c6" },
  { id: "healthy", ar: "صحية", en: "Healthy", color: "#bcd3b3" },
  { id: "heritage", ar: "خليجية تراثية", en: "Gulf heritage", color: "#d8b77a" },
];

export const favorStyles: FavorStyle[] = [
  { id: "clear", ar: "بعلبة شفافة وشريطة ساتان", en: "in a clear box with a satin ribbon" },
  { id: "pouch", ar: "بكيس قماش صغير بالاسم", en: "in a small name-printed cloth pouch" },
  { id: "kraft", ar: "بعلبة كرافت مع بطاقة شكر", en: "in a kraft box with a thank-you card" },
  { id: "basket", ar: "بسلة خوص صغيرة", en: "in a tiny woven basket" },
];

// "ar|en|price" per line, grouped by category.
const raw: Record<FavorCat, string> = {
  sweets: `كوكيز باسم البيبي|Cookies with baby's name|1
كوكيز على شكل سحابة|Cloud-shaped cookies|1
كوكيز على شكل نجمة وقمر|Star and moon cookies|1
كوكيز على شكل رضّاعة|Baby-bottle cookies|1
كوكيز على شكل فيونكة|Bow-shaped cookies|1
كوكيز بصمة رجل البيبي|Baby-footprint cookies|1
كب كيك بتوبر الاسم|Cupcakes with name toppers|1
ميني كب كيك بلونين|Two-tone mini cupcakes|1
ماكرون بلون الاستقبال|Macarons in the welcome colour|2
ماكرون محشي بالزعفران|Saffron-filled macarons|2
شوكولاتة بغلاف مطبوع بالاسم|Chocolates with a printed name wrapper|1
لوح شوكولاتة صغير بصورة البيبي|Mini chocolate bar with a baby print|1
شوكولاتة على شكل قلوب|Heart-shaped chocolates|1
شوكولاتة محشية بالتمر|Date-filled chocolates|2
شوكولاتة بالفستق|Pistachio chocolates|2
حلاوة طحينية بعلبة صغيرة|Mini tahini halva|1
لقيمات بعلبة مزينة|Luqaimat in a pretty box|1
كيك بوب بالعصا|Cake pops on sticks|1
دونات ميني مزخرفة|Decorated mini doughnuts|1
مارشملو مغطى بالشوكولاتة|Chocolate-dipped marshmallows|1
حلاوة قطن ملونة|Pastel cotton candy|1
كراميل مملح بأكياس صغيرة|Salted caramels in little bags|1
حلوى جيلي على شكل دبدوب|Teddy-bear jelly sweets|1
سكاكر ملبس ملونة|Pastel sugared almonds (mlabbas)|1
ملبس بالشوكولاتة|Chocolate-coated almonds|2
ملبس بالفستق|Pistachio dragées|2
بسكويت مغطى بالشوكولاتة البيضاء|White-chocolate dipped biscuits|1
بسبوسة ميني|Mini basbousa|1
كنافة ميني بالقشطة|Mini cream kunafa|2
معمول بالتمر|Date maamoul|1
معمول بالفستق|Pistachio maamoul|2
غريبة بالهيل|Cardamom ghraibeh|1
براونيز ميني|Mini brownies|1
بلوندي بالشوكولاتة البيضاء|White-chocolate blondies|1
ترافل شوكولاتة|Chocolate truffles|2
ترافل بالزعفران|Saffron truffles|2
لوليبوب سكر باسم البيبي|Name-printed sugar lollipops|1
مكعبات سكر مزخرفة للشاي|Decorated sugar cubes for tea|1
عسل بالمكسرات بقارورة صغيرة|Honey with nuts in a mini jar|2
مربى ورد بقارورة صغيرة|Rose jam mini jar|2
فدج بالكراميل|Caramel fudge|1
كيكة صغيرة بقالب|Mini loaf cake|2
تشيز كيك بكوب صغير|Cheesecake cups|2
مهلبية بكوب صغير|Muhallabia cups|1
تمر محشي بالمكسرات|Nut-stuffed dates|1
تمر مغطى بالشوكولاتة|Chocolate-covered dates|2
حلويات بندق مكرملة|Caramelised hazelnuts|1
فشار بنكهة الكراميل|Caramel popcorn bags|1`,
  scents: `شمعة معطرة صغيرة|Mini scented candle|2
شمعة بشكل غيمة|Cloud-shaped candle|2
شمعة بعطر الفانيلا|Vanilla candle|2
شمعة بعطر اللافندر|Lavender candle|2
شمعة بعطر العود الخفيف|Soft oud candle|2
بخور بعلبة صغيرة|Bakhoor in a small box|2
مبخرة ميني مع بخور|Mini burner with bakhoor|3
دخون معمول بالبيت|Homemade dukhoon|2
عطر ميني بقارورة رول|Mini roll-on perfume|2
عطر مخلط خليجي صغير|Small Gulf mukhallat perfume|3
ماء ورد بقارورة صغيرة|Rose water mini bottle|1
معطر مفارش بالورد|Rose linen spray|2
معطر مفارش باللافندر|Lavender linen spray|2
أكياس عطرية للخزانة|Wardrobe scent sachets|1
حجر عطري معلّق|Hanging scented stone|2
ورود مجففة معطرة|Scented dried petals|1
زيت عطري صغير|Small essential oil|2
فواحة أعواد صغيرة|Mini reed diffuser|2
معطر سيارة بالاسم|Name-printed car freshener|1
صابونة معطرة بالورد|Rose scented soap|1
مسك أبيض صغير|Small white musk|2
عطر شعر ميني|Mini hair mist|2
كريم عطري لليدين|Perfumed hand cream|2
شمعة بعلبة معدن|Tin candle|2
شمعة صويا طبيعية|Natural soy candle|2`,
  plants: `بذور نبتة «تكبر معنا»|"Grow with us" seed packet|1
نبتة صبار صغيرة|Tiny succulent|2
نبتة صبار بأصيص مزين بالاسم|Succulent in a name pot|2
بذور ريحان|Basil seeds|1
بذور نعناع|Mint seeds|1
بذور زهور برية|Wildflower seeds|1
بذور دوار الشمس|Sunflower seeds kit|1
ورقة بذور قابلة للزراعة|Plantable seed paper|1
نبتة هوائية صغيرة|Small air plant|2
شتلة لافندر صغيرة|Small lavender plant|2
شتلة ورد جوري صغيرة|Small rose plant|3
نبتة حظ صغيرة|Lucky bamboo stem|2
أصيص صغير مع تربة وبذور|Mini pot with soil and seeds|1
قلم رصاص قابل للزراعة|Plantable pencil|1
بصيلة زهرة|Flower bulb|1
تيراريوم ميني|Mini terrarium|3
نبتة بيبي تيرز|Baby tears plant|2
بطاقة بذور بشكل قلب|Heart seed card|1
شتلة نعناع حساوي|Small local mint plant|1
بذور طماطم كرزية|Cherry tomato seeds|1
بذور فراولة|Strawberry seeds|1
أصيص فخار مرسوم|Hand-painted clay pot|2`,
  keepsakes: `ميدالية بالاسم والتاريخ|Keychain with name & date|2
ميدالية على شكل رضّاعة|Baby-bottle keychain|1
ميدالية خشب محفورة|Engraved wooden keychain|2
مغناطيس ثلاجة بصورة البيبي|Fridge magnet with a baby print|1
مغناطيس على شكل غيمة|Cloud fridge magnet|1
فاصل كتب مطبوع|Printed bookmark|1
فاصل كتب معدن محفور|Engraved metal bookmark|2
كوب صغير بالاسم|Small mug with the name|2
كوب قهوة عربية مطبوع|Printed Arabic-coffee cup|2
صحن صغير مرسوم|Hand-painted mini dish|2
مسبحة صغيرة|Small prayer beads|2
مصحف صغير بغلاف مخصص|Small Quran with a custom cover|3
حصن المسلم صغير|Small Hisn al-Muslim booklet|1
مرآة جيب بالاسم|Name-printed pocket mirror|1
بوكس تذكاري صغير|Small keepsake box|2
فتّاحة بالاسم|Bottle opener with the name|1
ساعة رمل صغيرة|Mini hourglass|2
كرة ثلج صغيرة|Mini snow globe|3
سوار خرز بالأحرف|Letter bead bracelet|1
دبوس صدر صغير|Small enamel pin|1
لوحة خشب صغيرة بالاسم|Small wooden name plaque|2
إطار صورة صغير|Mini photo frame|2
شمّاعة باب مزينة|Decorated door hanger|1
ملصقات بالاسم|Name stickers|1
قلادة بحرف البيبي|Initial charm necklace|3
حلق صغير للبنات|Small earrings for girls|3
مفتاح خشب على شكل بيبي|Wooden baby-shaped charm|1
بطاقة تذكارية بالبصمة|Footprint keepsake card|1
قطعة ذهب صغيرة للأقارب|Small gold charm for close family|3
عملة تذكارية|Commemorative coin|3`,
  care: `صابونة على شكل بيبي|Baby-shaped soap|1
صابونة على شكل نجمة|Star-shaped soap|1
صابونة حليب الماعز|Goat-milk soap|1
صابونة بالعسل والشوفان|Honey & oat soap|1
مرطب شفاه بالعسل|Honey lip balm|1
كريم يدين صغير|Mini hand cream|1
معقم يدين صغير بالاسم|Name-labelled hand sanitiser|1
قناع وجه ورقي|Sheet face mask|1
ملح استحمام معطر|Scented bath salts|2
كرات فوارة للاستحمام|Bath bombs|2
زيت جسم صغير|Small body oil|2
زبدة شيا صغيرة|Mini shea butter|2
فرشاة شعر صغيرة|Mini hairbrush|1
ربطة شعر ساتان|Satin scrunchie|1
مشبك شعر بفيونكة|Bow hair clip|1
مبرد أظافر مزين|Decorated nail file|1
كيس مناديل مبللة صغير|Mini wet-wipes pack|1
مرآة وفرشاة بعلبة|Mirror and brush set|2
مقص أظافر صغير|Small nail clipper|1
زيت شعر طبيعي صغير|Small natural hair oil|2
كريم قدمين صغير|Mini foot cream|1
عصابة عين للنوم|Sleep eye mask|2
منشفة وجه صغيرة مطرزة|Embroidered face towel|2
قفاز ليفة صغير|Small bath mitt|1`,
  drinks: `قهوة عربية بكيس مزين|Arabic coffee in a pretty pouch|2
قهوة بالهيل والزعفران|Cardamom & saffron coffee|2
قهوة مختصة بكيس صغير|Specialty coffee mini bag|2
شاي كرك بأكياس|Karak tea sachets|1
شاي بالورد|Rose tea|1
شاي بالبابونج|Chamomile tea|1
شاي بالنعناع|Mint tea|1
شاي أخضر بالياسمين|Jasmine green tea|1
زعفران بعلبة صغيرة|Saffron in a tiny box|3
هيل مطحون بقارورة|Ground cardamom jar|2
بهارات قهوة عربية|Arabic coffee spice mix|1
مكعبات شوكولاتة ساخنة|Hot-chocolate stirrers|1
عصير طبيعي بقارورة صغيرة|Small fresh juice bottle|1
ليموناضة بالنعناع|Mint lemonade bottle|1
ماء بملصق باسم البيبي|Water bottle with a name label|1
حليب بالزعفران صغير|Mini saffron milk|1
كوب قهوة ورقي مطبوع|Printed paper coffee cup|1
مكعبات سكر بنكهات|Flavoured sugar cubes|1
عسل سدر صغير|Small sidr honey|3
عسل سمر صغير|Small samar honey|2`,
  paper: `بطاقة شكر بخط اليد|Handwritten thank-you card|1
بطاقة بدعاء للمولود|Card with a prayer for the baby|1
بطاقة بآية قصيرة|Card with a short verse|1
بطاقة بقصيدة قصيرة|Card with a short poem|1
دفتر ملاحظات صغير|Small notebook|1
دفتر بغلاف قماش|Fabric-cover notebook|2
قلم بالاسم|Name-printed pen|1
مجموعة أقلام ملونة|Coloured pencil set|1
ملصقات بطابع البيبي|Baby-themed sticker sheet|1
تقويم صغير بصورة|Mini photo calendar|2
مخطط أسبوعي صغير|Mini weekly planner|1
كرت بوستال مرسوم|Illustrated postcard|1
بطاقة تلوين|Colouring card|1
طابع شمع على ظرف|Wax-sealed envelope note|1
مشبك ورق بأشكال|Shaped paper clips|1
دفتر حمد صغير|Small gratitude journal|1
بطاقة بذكرى أول يوم|"First day" memory card|1
كتيب أدعية صغير|Small prayer booklet|1
فاصل خشب محفور|Engraved wooden bookmark|2
صورة فوتوغرافية صغيرة مطبوعة|Small printed photo|1`,
  kids: `ألوان شمعية مع كتاب تلوين|Crayons with a colouring book|1
فقاعات صابون صغيرة|Mini bubble bottle|1
صلصال ملون صغير|Small play-dough pot|1
لغز صغير|Mini puzzle|1
ملصقات حيوانات|Animal stickers|1
ميدالية دبدوب|Teddy keychain|1
كرة مطاطية ملونة|Bouncy ball|1
سيارة صغيرة|Toy car|1
دمية قماش صغيرة|Small cloth doll|2
دبدوب صغير|Small teddy bear|2
وشم مؤقت للأطفال|Temporary kids' tattoos|1
طباشير ملون|Sidewalk chalk|1
قصة قصيرة مصورة|Short picture book|2
لعبة لوح خشبي|Wooden peg toy|2
كيس حلويات للأطفال|Kids' sweet bag|1
ساعة رمل ملونة|Coloured sand timer|1
عصا سحرية بنجمة|Star wand|1
بالون مع شريطة|Balloon with a ribbon|1
لعبة يويو|Yo-yo|1
تاج ورقي|Paper crown|1
قناع حيوان ورقي|Paper animal mask|1
مجموعة أختام|Stamp set|1`,
  healthy: `مكسرات محمصة بأكياس صغيرة|Roasted nut bags|2
لوز محمص بالعسل|Honey-roasted almonds|2
فستق حلبي بكيس صغير|Pistachio bag|2
فواكه مجففة مشكلة|Mixed dried fruit|1
مشمش مجفف|Dried apricots|1
تين مجفف|Dried figs|1
ألواح شوفان بالتمر|Oat & date bars|1
كرات طاقة بالتمر|Date energy balls|1
تمر خلاص بعلبة صغيرة|Khalas dates in a small box|1
تمر سكري بعلبة صغيرة|Sukkari dates box|2
شيبس فواكه|Fruit crisps|1
بذور يقطين محمصة|Roasted pumpkin seeds|1
جرانولا منزلية|Homemade granola|1
عسل بالأعشاب|Herbal honey|2
شوكولاتة داكنة صغيرة|Small dark chocolate|1
زبدة فول سوداني ميني|Mini peanut butter|1
مزيج المكسرات والتوت|Trail mix with berries|1
مربى بدون سكر|Sugar-free jam|2
بسكويت قمح كامل|Whole-wheat biscuits|1
حمص محمص بالبهارات|Spiced roasted chickpeas|1`,
  heritage: `مبخرة فخار صغيرة|Small clay incense burner|2
دلة صغيرة تذكارية|Mini dallah keepsake|2
فنجان قهوة عربي مزخرف|Decorated Arabic coffee cup|2
سدو صغير مطرز|Small Sadu woven piece|2
كيس سدو للحلويات|Sadu pouch of sweets|2
مكحلة صغيرة|Small kohl pot|2
حنة بأكياس صغيرة|Henna sachets|1
خاتم حنة جاهز|Ready henna stencil|1
كمة صغيرة مطرزة|Small embroidered kummah cap|3
بشت تذكاري صغير|Mini bisht keepsake|3
مندوس صغير|Mini mandoos chest|3
خنجر تذكاري ميني|Mini khanjar keepsake|3
وردة محمدي مجففة|Dried Mohammadi roses|1
ماء ورد طائفي صغير|Small Taif rose water|2
حلوى عمانية بعلبة صغيرة|Omani halwa in a small box|2
حلوى بحرينية صغيرة|Bahraini halwa mini box|2
رهش بالسمسم|Sesame rahash|1
بلاليط سكر|Sweet balaleet pack|1
قرص عقيلي|Gers ogaily cake|1
خبز رقاق محلى|Sweet regag bread|1
عرقسوس بقارورة|Licorice drink bottle|1
لبان ظفاري|Dhofari frankincense|2
مسبحة يسر|Yusr prayer beads|3
بخور مدخن بالعود|Oud-smoked bakhoor|3
نقش شمع بالخط العربي|Arabic calligraphy wax stamp|2`,
};

export const favorBases: FavorBase[] = (Object.keys(raw) as FavorCat[]).flatMap((cat) =>
  raw[cat]
    .trim()
    .split("\n")
    .map((line, i) => {
      const [ar, en, p] = line.split("|");
      return { id: `${cat}-${i + 1}`, cat, ar: ar.trim(), en: en.trim(), price: (Number(p) || 1) as 1 | 2 | 3 };
    })
);

/** Every favor in every presentation: the full list of ideas. */
export const favorIdeas: FavorIdea[] = favorBases.flatMap((b) => favorStyles.map((style) => ({ ...b, style, key: `${b.id}~${style.id}` })));
