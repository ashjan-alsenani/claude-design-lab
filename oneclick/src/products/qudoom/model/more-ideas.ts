import type { FavorCat } from "./favor-ideas";
import type { IdeaKind } from "./all-ideas";

/**
 * Five hundred more ideas (v6): 200 favors (20 per category) and 300 across the other kinds.
 * One line each: «عربي|English|price (1 budget · 2 middle · 3 special)». all-ideas parses them and a
 * unit test makes sure no text repeats anywhere in the library.
 */
export const moreFavorBlocks: Record<FavorCat, string> = {
  sweets: `
ماكرون بلون ثيم الاستقبال في علبة دائرية|Theme-coloured macarons in a round tin|2
مارشملو مغطى شوكولاتة على عصا خشب|Chocolate-dipped marshmallow on a wooden stick|1
لوليبوب سكر شفاف فيه ورد مجفف|Clear sugar lollipop with dried petals|1
كيك بوب على شكل رضّاعة صغيرة|Cake pop shaped like a tiny baby bottle|2
بسكوت زبدة على شكل خطوة قدم|Butter cookie shaped like a footprint|1
براونيز مربعة بختم حرف البيبي|Brownie squares stamped with the baby's initial|2
حلاوة طحينية بالفستق في قالب صغير|Pistachio halva in a mini mould|1
سكاكر قطن ملونة في كوب شفاف|Cotton candy in a clear cup|1
تشيز كيك صغير في برطمان زجاج|Mini cheesecake in a glass jar|2
كعك بالتمر بنقشة خليجية|Date-filled ka'ak with a Gulf pattern|1
شوكولاتة بيضاء بالزعفران والهيل|White chocolate with saffron and cardamom|2
مكعبات راحة الحلقوم بماء الورد|Rosewater Turkish delight cubes|1
بسبوسة صغيرة بالقشطة في كوب|Mini basbousa with cream in a cup|1
دونات صغيرة بالسكر البودرة|Mini sugar-dusted doughnuts|1
لوح شوكولاتة بغلاف عليه رسم البيبي|Chocolate bar wrapped with a drawing of the baby|2
حلاوة غزل البنات بنكهة الفراولة|Strawberry floss halva|1
كرات جوز الهند بالحليب المكثف|Coconut and condensed-milk balls|1
تارت فواكه صغير بكريمة الفانيلا|Mini fruit tart with vanilla cream|2
كوكيز بقطع الشوكولاتة في كيس ورقي مختوم|Chocolate-chip cookies in a sealed paper bag|1
علبة شوكولاتة فاخرة بثلاث قطع وبطاقة|Three-piece luxury chocolate box with a card|3`,
  scents: `
معطر سيارة بشكل غيمة بعطر البودرة|Cloud-shaped car freshener in baby-powder scent|1
عود معطر صغير في علبة مخمل|Small scented oud stick in a velvet box|3
كيس لافندر مجفف للدولاب|Dried lavender sachet for the wardrobe|1
شمعة صويا بعطر المسك الأبيض|White-musk soy candle|2
بخاخ معطر وسائد بالبرغموت|Bergamot pillow mist|2
أحجار معطرة بشكل نجمة|Star-shaped scented stones|1
فواحة أعواد صغيرة بعطر القطن|Mini cotton-scent reed diffuser|2
دهن عود مخفف في زجاجة رول|Diluted oud oil in a roll-on bottle|3
بخور معمول بالعود والزعفران|Oud-and-saffron mabthooth incense|2
شمعة بشكل دبدوب بعطر الفانيلا|Teddy-shaped vanilla candle|2
مسك صلب في علبة معدن صغيرة|Solid musk in a small metal tin|2
معطر مفارش برائحة الياسمين|Jasmine linen spray|1
عطر جيب صغير بعلبة باسم البيبي|Pocket perfume in a baby-name box|3
بطاقة معطرة تُعلَّق في الدولاب|Scented hanging card for the wardrobe|1
مبخرة سيراميك صغيرة مع جمرات|Small ceramic incense burner with charcoal|2
شمعة شاي بعطر البرتقال والقرفة|Orange-and-cinnamon tealight|1
صابونة عطرية بشكل وردة في علبة|Rose-shaped scented soap in a box|1
كرات معطرة للسيارة بالعنبر|Amber scent beads for the car|1
زيت عطري بالنعناع في قطّارة|Peppermint essential oil in a dropper|2
طقم صغير: عطر ومسك وبخور|Mini set: perfume, musk and incense|3`,
  plants: `
نبتة صبار صغيرة في كوب بوجه مبتسم|Mini cactus in a smiley-face cup|1
بذور دوار الشمس في ظرف مزخرف|Sunflower seeds in a decorated envelope|1
نبتة نعناع في أصيص فخار صغير|Mint plant in a small clay pot|1
قلم رصاص يُزرع بعد ما يخلص|Plantable pencil that grows after use|2
بصلة توليب في كيس جوت|Tulip bulb in a jute bag|2
نبتة بامبو الحظ مع شريطة|Lucky bamboo with a ribbon|2
مكعب طين فيه بذور ريحان|Clay cube with basil seeds|1
تيرراريوم صغير في كرة زجاج|Mini terrarium in a glass globe|3
بذور فراولة مع تربة في علبة|Strawberry seeds with soil in a tin|1
نبتة هوائية على حامل خشب|Air plant on a wooden stand|2
ورد مجفف في قارورة صغيرة|Dried flowers in a tiny bottle|1
شتلة ليمون صغيرة باسم البيبي|Small lemon sapling named for the baby|3
ورقة بذور على شكل قلب|Heart-shaped seed paper|1
نبتة إبرة الراعي في أصيص ملون|Geranium in a coloured pot|2
أصيص يُرسم عليه مع ألوان وبذور|Paint-your-own pot with seeds|2
بذور زعتر بطاقة «يكبر معنا»|Thyme seeds on a "grows with us" card|1
مجموعة أعشاب مطبخ صغيرة ثلاثية|Trio of mini kitchen herbs|2
نبتة صبار مزهرة في علبة هدية|Flowering cactus in a gift box|2
ورد جوري طبيعي بغلاف ورقي|Fresh damask rose in paper wrap|1
شتلة ياسمين صغيرة مع بطاقة دعاء|Small jasmine plant with a prayer card|2`,
  keepsakes: `
مغناطيس ثلاجة بصورة البيبي الأولى|Fridge magnet with the baby's first photo|1
فاصل كتاب معدني محفور بالاسم|Engraved metal bookmark with the name|2
قلادة صغيرة بحرف البيبي|Small necklace with the baby's initial|3
ميدالية جلد بختم التاريخ|Leather keychain stamped with the date|2
كرة ثلج صغيرة فيها اسم البيبي|Mini snow globe with the baby's name|3
إطار صغير بطبعة قدم البيبي|Small frame with the baby's footprint|2
حجر مرسوم عليه بيبي وغيمة|Painted pebble with a baby and a cloud|1
حلق مفاتيح بشكل حرف خشب|Wooden initial-letter key ring|1
بطاقة معدنية للمحفظة بدعاء|Wallet-sized metal prayer card|2
مرآة جيب بنقش الاسم|Pocket mirror engraved with the name|2
دبوس بروش صغير بشكل نجمة|Small star brooch pin|2
سوار خرز بأحرف الاسم|Letter-bead bracelet with the name|1
لوحة أكريليك صغيرة للمكتب|Small acrylic desk plaque|2
ساعة رمل صغيرة مع تاريخ الميلاد|Mini hourglass with the birth date|3
علبة مجوهرات صغيرة مبطنة|Small padded jewellery box|3
قطعة بازل خشب عليها الاسم|Wooden puzzle piece with the name|1
مسباحة صغيرة بشرابة بلون الثيم|Small prayer beads with a theme-coloured tassel|2
شريطة ساتان مطبوع عليها التاريخ|Satin ribbon printed with the date|1
ختم شمع على بطاقة كرتون فاخرة|Wax seal on a premium card|1
قطعة سيراميك صغيرة مرسومة باليد|Small hand-painted ceramic piece|3`,
  care: `
مرطب شفايف بنكهة الفانيلا|Vanilla lip balm|1
ماسك ورقي للوجه بالصبار|Aloe sheet face mask|1
كريم يدين برائحة الورد في أنبوب صغير|Rose hand cream in a mini tube|1
مقص أظافر صغير بعلبة جلد|Small nail clippers in a leather case|2
مشط خشبي صغير محفور بالاسم|Engraved small wooden comb|2
ملح استحمام باللافندر في زجاجة|Lavender bath salts in a bottle|2
مزيل مكياج قطني قابل للغسيل|Washable cotton make-up remover pads|1
ربطة شعر حرير بلون الثيم|Silk hair scrunchie in the theme colour|1
جل معقم يدين بعطر لطيف|Gently scented hand sanitiser|1
زيت أظافر بفيتامين هـ|Vitamin E cuticle oil|1
صابون حليب الماعز الطبيعي|Natural goat-milk soap|1
فرشاة شعر صغيرة للشنطة|Small handbag hairbrush|2
قناع نوم ساتان|Satin sleep mask|2
مقشر شفايف بالسكر والعسل|Sugar-and-honey lip scrub|1
بخاخ ماء ورد للوجه|Rosewater face mist|2
منشفة وجه قطن مطرزة بالحرف|Cotton face towel embroidered with the initial|2
كيس شاي أعشاب للاسترخاء|Relaxing herbal tea sachet|1
مبرد أظافر زجاجي في علبة|Glass nail file in a case|1
كريم قدمين بالنعناع|Peppermint foot cream|1
طقم عناية صغير في حقيبة مطرزة|Mini care set in an embroidered pouch|3`,
  drinks: `
زجاجة ماء صغيرة بملصق الاسم|Small water bottle with a name label|1
كيس قهوة مختصة مطحونة|Bag of ground specialty coffee|2
أعواد سكر بالزعفران|Saffron sugar sticks|1
كوب قهوة عربي مطبوع عليه التاريخ|Arabic coffee cup printed with the date|2
شاي كرك جاهز في علبة صغيرة|Ready karak tea mix in a small tin|1
عصير ليمون بالنعناع في قارورة|Mint lemonade in a little bottle|1
كبسولات قهوة في علبة مزينة|Coffee capsules in a decorated box|2
حليب بالزعفران مجفف للتحضير|Instant saffron milk mix|1
شاي أخضر بالياسمين في ظرف|Jasmine green tea in an envelope|1
كاكاو ساخن مع مارشملو في كوب|Hot-cocoa mix with marshmallows in a cup|1
ماء ورد للشرب في زجاجة صغيرة|Drinking rosewater in a small bottle|1
زنجبيل وعسل للتحضير|Ginger-and-honey drink mix|1
مزيج هيل وزعفران للقهوة|Cardamom and saffron coffee blend|2
كوب حراري صغير بلون الثيم|Small thermal cup in the theme colour|3
شاي مثلج بالخوخ في عبوة|Peach iced tea in a bottle|1
قهوة باردة جاهزة بعلبة صغيرة|Small can of cold brew|2
حبوب قهوة مغطاة شوكولاتة|Chocolate-covered coffee beans|2
أعشاب مهدئة للأم (بابونج ويانسون)|Calming herbs for mum (chamomile and anise)|1
سيروب فانيلا للقهوة في زجاجة|Vanilla coffee syrup in a bottle|2
فنجان وصحن صغير مع قهوة|Small cup and saucer with coffee|3`,
  paper: `
مفكرة جيب بغلاف قماش|Pocket notebook with a fabric cover|2
ملصقات بشكل غيوم ونجوم|Cloud and star stickers|1
بطاقة تلوين للأطفال باسم البيبي|Colouring card with the baby's name|1
تقويم مكتبي صغير يبدأ بشهر الولادة|Mini desk calendar starting the birth month|2
فاصل كتاب ورقي بشرابة|Paper bookmark with a tassel|1
بطاقة بريدية بصورة الاستقبال|Postcard with the welcome photo|1
دفتر وصفات صغير للأم|Small recipe notebook for mum|2
أقلام ملونة بعلبة ورقية مطبوعة|Coloured pencils in a printed paper box|1
بطاقة دعاء مطبوعة بخط جميل|Prayer card in beautiful calligraphy|1
ملصق اسم البيبي للسيارة|Baby-name car sticker|1
مذكرات لاصقة بشكل قلب|Heart-shaped sticky notes|1
بطاقة «احفظوا التاريخ» مع مغناطيس|Save-the-date card with a magnet|2
بطاقة «توقعات الضيوف» عن شكل البيبي|"Guess the baby's looks" guest card|1
ورق رسائل مع ظروف بلون الثيم|Letter paper and envelopes in the theme colour|2
بطاقة أمنيات يكتبها الضيف ويرجعها|Wish card guests fill in and return|1
روزنامة أسبوعية قابلة للتعليق|Hanging weekly planner|2
دفتر تلوين صغير بالرسومات الكيوت|Small colouring book of cute drawings|1
كروت لعب بذاكرة بصور العائلة|Family-photo memory card game|3
بطاقة شكر بخط اليد بحبر ذهبي|Hand-lettered thank-you card in gold ink|2
ختم مطاطي صغير بحرف البيبي|Small rubber stamp with the baby's initial|2`,
  kids: `
كرة مطاطية صغيرة بالنجوم|Small star bouncy ball|1
قناع قماش للعب بشكل قطة|Cat-face fabric play mask|1
دفتر ملصقات مع ورقة ملصقات|Sticker book with a sticker sheet|1
صفارة على شكل طير|Bird-shaped whistle|1
لعبة متاهة كرات صغيرة|Mini ball maze game|1
عجينة صلصال في علب صغيرة|Play dough in mini tubs|1
طائرة ورقية صغيرة للتركيب|Mini build-your-own kite|2
فانوس صغير مضيء|Small light-up lantern|2
مكعبات تركيب صغيرة|Small building blocks set|2
نظارة شمسية ملونة للأطفال|Colourful kids' sunglasses|1
لعبة يويو خشب|Wooden yo-yo|1
حبل نط ملون|Coloured skipping rope|1
قصة قصيرة مصورة للأطفال|Short picture book for kids|2
تاج ورقي للتلوين|Paper crown to colour|1
أساور مضيئة|Glow bracelets|1
ميدالية دمية صوف صغيرة|Small knitted doll keychain|2
بطاقات ألغاز وأحاجي|Riddle and puzzle cards|1
ألوان شمع على شكل قوس قزح|Rainbow crayons|1
كيس مفاجآت بألعاب صغيرة|Surprise bag of small toys|2
دبدوب صغير بتيشيرت فيه الاسم|Mini teddy in a name T-shirt|3`,
  healthy: `
عبوة تمر محشي بالجوز|Walnut-stuffed dates|2
خلطة شوفان وتوت للفطور|Oat and berry breakfast mix|1
لوز محمص بالعسل في كيس صغير|Honey-roasted almonds in a small bag|1
شيبس تفاح مجفف|Dried apple crisps|1
كرات طاقة بالتمر والكاكاو|Date and cocoa energy balls|1
عسل سدر في برطمان صغير|Sidr honey in a small jar|3
فستق حلبي محمص في علبة|Roasted pistachios in a tin|2
مشمش مجفف في كيس كرافت|Dried apricots in a kraft bag|1
رقائق جوز الهند المحمصة|Toasted coconut chips|1
خبز محمص صغير بالزعتر|Mini za'atar crisp bread|1
زبدة فول سوداني في برطمان صغير|Peanut butter in a small jar|1
تين مجفف بالسمسم|Dried figs with sesame|1
بار بروتين بالشوفان|Oat protein bar|1
ذرة منفوخة بالكراميل الخفيف|Lightly caramelised puffed corn|1
توت بري مجفف بكيس شفاف|Dried cranberries in a clear bag|1
كاجو بالكركم والملح|Turmeric-salt cashews|2
عصير طبيعي بارد مضغوط|Cold-pressed fresh juice|2
مربى تين منزلي صغير|Small jar of homemade fig jam|2
شوكولاتة داكنة بدون سكر|Sugar-free dark chocolate|2
سلة فواكه صغيرة مغلفة|Small wrapped fruit basket|3`,
  heritage: `
دلة صغيرة نحاسية للزينة|Small brass decorative dallah|3
صحن تمر صغير بنقشة السدو|Small Sadu-pattern date dish|2
ساعة رملية بنقش خليجي|Hourglass with a Gulf pattern|3
كيس قماش مطرز بخيوط الزري|Pouch embroidered with zari thread|2
مبخرة خشب منقوشة صغيرة|Small carved wooden incense burner|2
تمر خلاص في علبة سدو|Khalas dates in a Sadu box|2
حنة جاهزة في كيس مزين|Henna powder in a decorated bag|1
لقيمات صغيرة في كوب مع دبس|Mini luqaimat in a cup with date syrup|1
سفرة خوص صغيرة للزينة|Small palm-weave decorative mat|2
ورق بخور ملفوف بخيط ذهبي|Incense paper rolled with gold thread|1
مسباح كهرمان صغير|Small amber prayer beads|3
علبة حلوى عمانية صغيرة|Small tub of Omani halwa|2
فانوس رمضاني صغير للزينة|Small decorative Ramadan lantern|2
كحل عربي في مكحلة صغيرة|Traditional kohl in a small kohl pot|2
خاتم فضة صغير بنقش تراثي|Small silver ring with a heritage motif|3
مروحة خوص يدوية|Hand-woven palm fan|1
صندوق مندوس صغير للزينة|Small decorative mandoos chest|3
قهوة شقراء خليجية بعلبة صغيرة|Light Gulf coffee in a small tin|2
بطاقة بخط عربي فيها بيت شعر|Card with an Arabic calligraphy verse|1
عقد خرز تراثي صغير|Small traditional bead necklace|2`,
};

export const moreBlocks: Partial<Record<IdeaKind, string>> = {
  gift: `
كرسي هزاز صغير للبيبي|Small baby rocker|3
حامل ألعاب للنشاط فوق البيبي|Baby activity gym|3
جهاز ضوضاء بيضاء للنوم|White-noise sleep machine|2
فرشاة ومشط ناعمين للبيبي|Soft baby brush and comb|1
مقياس حرارة للحمام بشكل بطة|Duck bath thermometer|1
منظم أغراض يُعلَّق على السرير|Crib-side organiser|2
حقيبة تغيير متنقلة|Portable changing clutch|2
كتاب صور بالأبيض والأسود للمواليد|Black-and-white newborn picture book|1
مرآة آمنة لوقت البطن|Safe tummy-time mirror|2
بطانية لف (قماط) قطن|Cotton swaddle blanket|1
حذاء أول خطوات جلد طري|Soft-leather first shoes|2
طقم ملاعق سيليكون للأكل|Silicone weaning spoon set|1
كرسي طعام قابل للطي|Folding high chair|3
لعبة عضاضة على شكل حلقة|Ring-shaped teether|1
حامل مصاصة مع مشبك|Dummy clip holder|1
مظلة عربة شمسية|Pram sun canopy|2
مروحة صغيرة لعربة البيبي|Clip-on pram fan|2
سلة غسيل قماش للبيبي|Fabric baby laundry basket|1
ألبوم صور أول سنة|First-year photo album|2
طقم فوط رضاعة قطن|Cotton burp cloth set|1
بيجامة شتوية بقبعة|Winter sleepsuit with a hat|2
حمالة بيبي قماش (رابّ)|Fabric baby wrap carrier|2
صندوق ألعاب خشب بالاسم|Name-painted wooden toy box|3
لعبة موسيقية تُعلَّق في العربة|Musical pram toy|1
ستارة تعتيم للغرفة|Blackout curtain for the room|2
وسادة رضاعة بغطاء قابل للغسل|Nursing pillow with a washable cover|2
جهاز تعقيم وتجفيف للرضّاعات|Bottle steriliser and dryer|3
مصباح ليلي بلمسة|Touch night light|2
قبعة صوف ناعمة بأذنين|Soft wool hat with ears|1
طقم أول عيد ميلاد للتصوير|First-birthday photo outfit|2
ميزان أطفال منزلي|Home baby scale|3
حقيبة ظهر للأم والبيبي|Mum-and-baby backpack|3
جوارب بعدم انزلاق|Non-slip baby socks|1
بساط لعب قابل للطي|Foldable play mat|3
كيس نوم صيفي خفيف|Light summer sleep bag|2
أداة شفط أنف للبيبي|Baby nasal aspirator|1
ملابس داخلية قطن عضوي (طقم)|Organic-cotton bodysuit set|2
لعبة حيوانات مطاطية للحمام|Rubber bath animals|1
حامل كتب قماش للحائط|Fabric wall book holder|2
دمية قماش ناعمة بأول حرف|Soft fabric doll with the initial|2
مقعد سيارة قابل للدوران|Rotating car seat|3
حزام أمان لعربة التسوق|Shopping-trolley safety cover|2
مرطب جو بارد للغرفة|Cool-mist humidifier for the room|2
مفرش سرير مضاد للماء|Waterproof cot mattress protector|1
حافظة حليب حرارية|Insulated bottle bag|1
طقم أدوات عناية بالأظافر للبيبي|Baby nail-care kit|1
حامل عربة لكوب القهوة|Pram cup holder|1
بطانية تحمل اسم البيبي مطرزة|Blanket embroidered with the baby's name|2
بوستر حروف عربية للغرفة|Arabic-letters poster for the room|1
خيمة لعب صغيرة للمستقبل|Small play tent for later|3`,
  mother: `
روب استحمام قطن ناعم|Soft cotton bathrobe|2
وسادة ظهر للرضاعة|Back-support nursing pillow|2
طقم نوم حرير للأم|Silk sleep set for mum|3
حقيبة يد أنيقة تتسع لأغراض البيبي|Stylish handbag that fits baby things|3
كوب ماء كبير بعداد شرب|Large water bottle with a drinking tracker|1
جلسة مساج بعد الولادة (قسيمة)|Postnatal massage voucher|3
كتاب خفيف للقراءة وقت الرضاعة|Light read for feeding time|1
طقم بيجامة رضاعة|Nursing pyjama set|2
صندوق وجبات صحية جاهزة لأسبوع|A week of healthy ready meals|3
شمعة مهدئة بعطر الخزامى|Calming lavender candle|1
دفتر يوميات للأم الجديدة|Journal for the new mum|1
اشتراك قهوة شهري|Monthly coffee subscription|3
عقد باسم البيبي للأم|Necklace with the baby's name for mum|3
حذاء منزلي مريح|Comfy house slippers|1
بطانية صوف خفيفة للصالة|Light wool throw for the lounge|2
زيت تدليك للبطن والظهر|Belly and back massage oil|2
وشاح صلاة ناعم|Soft prayer scarf|2
مخدة حمل وولادة بشكل حرف U|U-shaped pregnancy pillow|2
سماعة لمراقبة البيبي على الجوال|Phone-linked baby monitor|3
حامل جوال للسرير|Bedside phone holder|1
باقة ورد مع بطاقة «أنتِ قدها»|Flowers with a "you've got this" card|2
طقم عناية بالبشرة الطبيعي|Natural skincare set|3
ميزان مطبخ ذكي لوجبات صحية|Smart kitchen scale for healthy meals|2
حقيبة مستشفى مرتبة ومليانة|Packed and organised hospital bag|3
وجبة فطور مفاجأة للبيت|Surprise breakfast delivered home|2
قسيمة تنظيف للبيت|House-cleaning voucher|3
مشروب أعشاب للرضاعة|Lactation herbal tea|1
مروحة يد صغيرة قابلة للشحن|Rechargeable mini hand fan|1
قلادة بأحجار ولادة العائلة|Family birthstone necklace|3
كتاب صور مطبوع لرحلة الحمل|Printed photo book of the pregnancy|2
مشط وفرشاة شعر من الخيزران|Bamboo comb and hairbrush|1
جلسة تصوير خاصة للأم بعد الولادة|Postnatal portrait session for mum|3
لوحة فنية مرسومة للأم والبيبي|Painted portrait of mum and baby|3
كمادات دافئة للظهر قابلة للتسخين|Reheatable warm back pack|1
صندوق مفاجآت صغيرة لكل أسبوع من الأربعين|Little surprise box for each week of recovery|3
سوار ناعم محفور عليه تاريخ الولادة|Fine bracelet engraved with the birth date|3
طقم أكواب شاي مع أعشاب مهدئة|Tea cups with calming herbs|2
قارئ كتب إلكتروني للسهر|E-reader for the late-night feeds|3
مفرش سرير قطن مصري ناعم|Soft Egyptian-cotton bed set|3
اشتراك تطبيق تأمل واسترخاء|Meditation app subscription|2`,
  decor: `
ستارة شراشيب ورقية خلف الطاولة|Paper tassel curtain behind the table|1
حروف بالونات فضية لاسم البيبي|Silver balloon letters for the name|2
سحاب قطن معلق بإضاءة دافئة|Hanging cotton clouds with warm lights|2
مفارش طاولة بنقشة الغيوم|Cloud-print table runners|1
مزهرية زجاج فيها ورد جبسوفيلا|Glass vase with gypsophila|1
كراسي صغيرة للأطفال بأغطية|Small kids' chairs with covers|2
قوس خشب دائري بورد صناعي|Round wooden arch with faux flowers|3
شموع LED آمنة في فوانيس|Safe LED candles in lanterns|2
ستاند كب كيك بثلاث طبقات|Three-tier cupcake stand|1
لافتة نيون باسم البيبي|Neon sign with the baby's name|3
أكاليل ورق كريشة على الجدار|Crepe-paper garlands on the wall|1
مجسم قمر كبير مضيء|Large glowing moon prop|3
بالونات شفافة بقصاصات ذهبية|Clear balloons with gold confetti|1
مكعبات خشب كبيرة بحروف الاسم|Large wooden blocks spelling the name|2
سجادة صغيرة ناعمة لركن التصوير|Soft rug for the photo corner|2
مخدات أرضية بألوان الثيم|Floor cushions in the theme colours|2
حامل ورد على مدخل البيت|Flower stand at the front door|2
غيوم ورق مقوى مع اسم البيبي|Card clouds with the baby's name|1
عربة بيبي قديمة للزينة مليانة ورد|Vintage pram filled with flowers|3
إضاءة خيوط على شكل نجوم|Star string lights|1
لوحة خشب «أهلًا بالضيوف»|Wooden "welcome guests" board|2
مفارش ساتان على الكراسي|Satin chair sashes|1
أطباق تقديم بلون الثيم|Serving plates in the theme colour|2
طاولة حلويات بخلفية قماش مكشكش|Sweets table with a ruffled backdrop|2
دبدوب ضخم بفيونكة|Giant teddy with a bow|3
تعليقة فراشات ورقية من السقف|Paper butterflies hanging from the ceiling|1
ركن هدايا بسلة خوص كبيرة|Gift corner with a large woven basket|2
فوانيس ورقية بيضاء معلقة|Hanging white paper lanterns|1
أرقام خشب لتاريخ الولادة|Wooden numbers for the birth date|2
بالون عملاق شفاف بداخله ريش|Giant clear balloon with feathers|2
كرسي ملكي للأم مزين بالورد|Flower-decked queen chair for mum|3
شجرة صغيرة يعلق عليها الضيوف أمنياتهم|Little tree for guests' wishes|2
مرآة كبيرة مكتوب عليها ترحيب|Large mirror with a welcome message|3
بالونات على شكل نجوم وقمر|Star and moon balloons|1
مفرش طاولة دانتيل|Lace tablecloth|2
أكواب بأغطية ومصاصات ورقية|Lidded cups with paper straws|1
شريط ساتان على كل طبق|Satin ribbon on each plate|1
ستاند صور بإطار ذهبي كبير|Large gold-frame photo stand|2
باقات ورد صغيرة على كل طاولة|Small posies on every table|2
لوح خشب للتوقيع بدل دفتر الضيوف|Wooden signing board instead of a guest book|2`,
  sign: `
لوحة أكريليك ملونة بطبقتين|Two-layer coloured acrylic sign|2
لوحة خشب دائرية بحروف بارزة|Round wooden sign with raised letters|2
لوحة قماش مطرزة بالاسم|Embroidered fabric name banner|2
اسم البيبي بحروف ورد صناعي|The name in faux-flower letters|3
لوحة طباشير بخط يدوي|Hand-lettered chalkboard sign|1
لوحة نيون وردية صغيرة|Small pink neon sign|3
اسم البيبي على غيمة خشب بيضاء|Name on a white wooden cloud|2
لافتة مرآة ذهبية بالاسم والتاريخ|Gold mirror sign with name and date|3
حروف خشب مستقلة على الجدار|Separate wooden letters on the wall|2
لوحة مع تفاصيل الولادة (الوزن والطول)|Sign with birth details (weight and length)|2
لافتة باب مستشفى بشكل قمر|Moon-shaped hospital door sign|1
لوحة ورقية ثلاثية الأبعاد|3D paper name sign|1
اسم بالبالونات الصغيرة الملصقة|Name made of small stuck-on balloons|2
لوحة قماش بإطار تطريز دائري|Embroidery-hoop name sign|1
لوحة خط عربي ديواني بالاسم|Diwani calligraphy name panel|3
لافتة على ستاند حديد ذهبي|Sign on a gold metal stand|2
اسم بإضاءة LED خلف الخشب|LED-backlit wooden name|3
لوحة صغيرة للسرير تتعلق بشريطة|Small cot sign hung on a ribbon|1
ملصق جداري بالاسم والنجوم|Name and stars wall decal|1
لوحة «الحمد لله على السلامة»|"Thank God for your safe arrival" sign|1
لوحة بتاريخ هجري وميلادي|Sign with both Hijri and Gregorian dates|2
لوحة لباد ملونة بحروف مخيطة|Felt sign with sewn letters|1
لافتة على شكل رضّاعة كبيرة|Big bottle-shaped sign|1
لوحة بصورة البيبي والاسم|Sign with the baby's photo and name|2
لوحة خشب محروق يدوي|Hand-burnt wooden name sign|2`,
  hosp: `
ركن قهوة مختصة بباريستا|Specialty-coffee corner with a barista|3
أكواب شوربة صغيرة|Small soup cups|1
ميني سندويشات حلوم وطماطم|Mini halloumi and tomato sandwiches|1
فطائر جبن بالزعتر|Za'atar cheese pastries|1
أكواب زبادي بالجرانولا والتوت|Yoghurt, granola and berry cups|1
ساندويش دجاج بالمايونيز في خبز بريوش|Chicken mayo brioche sliders|2
بوكس فطور صغير لكل ضيف|Small breakfast box per guest|2
محطة شاي بأنواع مختلفة|Tea station with several blends|1
كنافة صغيرة في أكواب|Mini kunafa cups|2
بلح بالقشطة والفستق|Dates with cream and pistachio|2
عصير برتقال طازج بجرة زجاج|Fresh orange juice in a glass jar|1
سمبوسة جبن وخضار|Cheese and vegetable sambousa|1
كب كيك بكريمة بلون الثيم|Cupcakes with theme-coloured frosting|1
لقيمات مع عسل ودبس|Luqaimat with honey and date syrup|1
ساجو بالحليب في أكواب|Sago milk pudding cups|1
مكسرات مشكلة في أوعية صغيرة|Mixed nuts in small bowls|1
شوكولاتة ساخنة في الشتاء|Hot chocolate for winter|1
ليموناضة بالريحان|Basil lemonade|1
أطباق جبن وعنب|Cheese and grape platters|2
معجنات صغيرة بالسبانخ|Mini spinach pastries|1
كيكة كبيرة باسم البيبي|Large cake with the baby's name|2
ماء بنكهات الفواكه في جرار|Fruit-infused water in jars|1
حلى تيراميسو في كاسات|Tiramisu cups|2
شاي حليب بالزعفران|Saffron milk tea|1
بوفيه صغير للأطفال|Small kids' buffet|2
فشار بنكهات في أكياس ورقية|Flavoured popcorn in paper bags|1
عربة آيس كريم صغيرة|Small ice-cream cart|3
تمر مع قهوة عربية في الاستقبال|Dates and Arabic coffee at the entrance|1
ساندويشات تونة صغيرة|Mini tuna sandwiches|1
محطة وافل طازج|Fresh waffle station|3
مكعبات بطيخ وشمام على أعواد|Melon cubes on skewers|1
كعك بالسمسم مع جبن|Sesame ka'ak with cheese|1
حلاوة جزر بالهيل|Cardamom carrot halwa|1
عصائر في قوارير صغيرة بالأسماء|Juices in small named bottles|2
طبق حمص وخضار مقطعة|Hummus with vegetable sticks|1
كريم كراميل في أكواب صغيرة|Crème caramel cups|1
خبز محلى بالزبدة والعسل|Sweet bread with butter and honey|1
موس شوكولاتة في كاسات|Chocolate mousse cups|1
صينية مندي صغيرة للعائلة|Small mandi tray for family|3
بسكويت شاي بالسمسم|Sesame tea biscuits|1`,
  photo: `
صورة البيبي نايم في سلة خوص|Baby asleep in a woven basket|1
يد البيبي فوق يد الأب والأم|Baby's hand on mum's and dad's hands|1
صورة للإخوان يحضنون البيبي|Siblings hugging the baby|1
البيبي مع لوحة الاسم|Baby with the name sign|1
صورة الأقدام الصغيرة بالأبيض والأسود|Tiny feet in black and white|1
صورة الجدة تشيل البيبي|Grandma holding the baby|1
البيبي بملابس أول يوم في البيت|Baby in the first coming-home outfit|1
الأم والبيبي جنب الشباك بضوء طبيعي|Mum and baby by the window in daylight|1
صورة كل شهر بنفس المكان|A photo each month in the same spot|1
البيبي مع دبدوب يكبر معه|Baby beside a teddy that "grows" with them|1
صورة تفاصيل: الأظافر والرموش|Detail shots: nails and lashes|1
البيبي مع بطاقة الشهر|Baby with a month card|1
لقطة الأب يقرأ أذان أو دعاء|Dad reading a prayer to the baby|1
صورة العائلة كاملة بألوان متناسقة|Whole family in coordinated colours|2
البيبي فوق بطانية بحروف الاسم|Baby on a blanket with name letters|1
لقطة من فوق مع ورد حول البيبي|Top-down shot with flowers around the baby|2
صورة بطن الحمل مع صورة البيبي بعدين|Bump photo then the same pose with baby|1
البيبي في حضن الأب مع ابتسامة|Baby in dad's arms, smiling|1
لقطات الحمام الأول|First-bath shots|1
البيبي مع ملابس الأم القديمة|Baby with mum's old baby clothes|1
صورة سوار المستشفى والاسم|Hospital bracelet and name|1
لقطة مع الحيوان الأليف بأمان|A safe shot with the family pet|1
صورة الخطوة الأولى بعدين|First steps later on|1
فيديو قصير لأول ضحكة|Short video of the first laugh|1
صورة أول زيارة للأجداد|First visit to the grandparents|1
البيبي مع كتاب قصص أول|Baby with a first storybook|1
لقطة سينمائية بالأبيض والأسود للعائلة|Cinematic black-and-white family shot|2
جلسة تصوير احترافية في البيت|Professional at-home session|3
صورة مع ساعة تبين وقت الولادة|Photo with a clock showing birth time|1
البيبي في ملابس تقليدية خليجية|Baby in traditional Gulf clothes|2`,
  hospital: `
صينية ترحيب للممرضات بالشوكولاتة|Chocolate welcome tray for the nurses|2
مفرش سرير المستشفى بلون الثيم|Hospital bed throw in the theme colour|2
بالون واحد كبير باسم البيبي|One large balloon with the name|1
ركن قهوة صغير في الغرفة|Small coffee corner in the room|2
باقة ورد على الطاولة الجانبية|Flowers on the bedside table|1
توزيعات صغيرة على باب الغرفة|Little favors by the room door|1
مخدة مطرزة باسم البيبي للتصوير|Name-embroidered pillow for photos|2
حامل مناديل مزين|Decorated tissue box holder|1
إطار صورة فاضي لأول صورة|Empty frame for the first photo|1
شنطة ضيافة للزوار عند الباب|Visitor goodie bag by the door|2
صينية تمر وماء زمزم|Dates and Zamzam water tray|1
لافتة صغيرة: نحتاج هدوء البيبي نايم|Small "quiet please, baby sleeping" sign|1
بطانية ناعمة للأم في الغرفة|Soft blanket for mum in the room|2
كراسي إضافية مغطاة للزوار|Extra covered chairs for visitors|2
إضاءة خافتة بشموع LED|Soft LED candle lighting|1
سلة فواكه للزوار|Fruit basket for visitors|2
روب أنيق للأم للتصوير|Elegant robe for mum for photos|2
طاولة صغيرة عليها الكيك|Small table for the cake|1
دفتر ضيوف عند المدخل|Guest book at the entrance|1
ستاند لوحة الاسم جنب السرير|Name-sign stand beside the bed|1
بطاقة شكر للطبيبة والفريق|Thank-you card for the doctor and team|1
معطر غرفة لطيف بدون روائح قوية|Gentle room scent, nothing strong|1
مفرش صغير لسرير البيبي في المستشفى|Small cover for the hospital bassinet|1
تعليقة نجوم على الستارة|Stars hung on the curtain|1
ركن صغير لهدايا الزوار|Small corner for visitors' gifts|1`,
  aqiqah: `
توزيع لحم العقيقة في أكياس مرتبة|Aqiqah meat in neat bags|1
بطاقة تعريف بالعقيقة مع الأكياس|Card explaining the aqiqah with each bag|1
سفرة أرضية تراثية للعائلة|Traditional floor dining for family|2
ركن قهوة وتمر للرجال|Coffee and dates corner for the men|1
قدور صغيرة للمرق بالأسماء|Small named broth pots|2
أطباق رز بالزعفران مزينة باللوز|Saffron rice platters with almonds|2
مبخرة دوارة بين الضيوف|Incense passed among guests|1
توزيع وجبات على العمال|Meals for workers|2
بطاقة دعاء للمولود على كل طبق|Prayer card for the baby on each plate|1
صحون حلى عربي بعد العشاء|Arabic dessert plates after dinner|1
تصوير بسيط للسفرة قبل الأكل|A simple photo of the spread before eating|1
لوحة «عقيقة فلان» عند المدخل|"Aqiqah of …" sign at the entrance|1
ركن غسيل يدين بعطر ومناشف|Hand-wash corner with scent and towels|1
توزيع ماء وعصير بارد|Cold water and juice for guests|1
طاولة خاصة للأطفال|A dedicated kids' table|1
صدقة باسم المولود لجهة خيرية|Charity in the baby's name|2
خيمة صغيرة في الحوش|Small tent in the courtyard|3
إضاءة فوانيس في المدخل|Lantern lights at the entrance|1
علب أكل للمحتاجين مع العقيقة|Food boxes for those in need|2
بطاقة شكر للطباخ والمساعدين|Thank-you card for the cook and helpers|1`,
  keepsake: `
طبعة يد وقدم بالجبس|Plaster hand and foot casts|2
رسالة صوتية من الأب للبيبي|A voice message from dad to the baby|1
جريدة يوم الولادة محفوظة|The newspaper from the birth day|1
أول سن يطيح في علبة صغيرة (بعدين)|First lost tooth in a tiny box (later)|1
أول ملابس لبسها في إطار|First outfit in a frame|2
تسجيل صوتي لأول بكاء|Voice recording of the first cry|1
لوحة أسماء كل من زار البيبي أول أسبوع|Board of everyone who visited in week one|1
أسماء الزوار في ألبوم|Visitors' names in an album|1
صندوق كبسولة زمنية للعائلة|Family time-capsule box|2
لوحة بصمة إصبع العائلة على شجرة|Family fingerprint tree|1
لحاف من ملابس البيبي الصغيرة|Quilt from the baby's outgrown clothes|3
كتاب «أول مرة» لتسجيل المراحل|"First times" milestone book|1
قارورة رمل من مكان مميز|A bottle of sand from a special place|1
فيديو رسائل من العائلة|Video of family messages|1
سوار المستشفى في إطار صغير|Hospital bracelet in a small frame|1
رسمة يدوية لوجه البيبي|Hand-drawn portrait of the baby|2
صورة ثلاثية الأبعاد للسونار مطبوعة|Printed 3D scan image|2
مذكرات الحمل مطبوعة ككتاب|Pregnancy notes printed as a book|2
أول حذاء مطلي بالبرونز|Bronze-dipped first shoes|3
صندوق رسائل من الأجداد|Box of letters from the grandparents|1`,
  thanks: `
شكرًا على مشاركتكم فرحتنا، وجودكم كان أحلى هدية|Thank you for sharing our joy. Having you was the best gift
الله يسعدكم مثل ما أسعدتونا بزيارتكم وهديتكم|May you be as happy as your visit and gift made us
هديتكم لمستنا، وبيبينا محظوظ بعائلة مثلكم|Your gift touched us. Our baby is lucky to have family like you
ما ننسى لطفكم، شكرًا من كل قلبنا|We won't forget your kindness. Thank you from all our hearts
شكرًا على الهدية والدعاء الحلو، الله يحفظكم|Thank you for the gift and the sweet prayers. God keep you
وصلت هديتكم وفرحنا فيها كثير، الله يجزاكم الجنة|Your gift arrived and delighted us. May God reward you
{name}، ذوقك حلو مثل قلبك، شكرًا على {gift}|{name}, your taste is as lovely as your heart. Thanks for {gift}
شكرًا لأنكم كنتم معنا من أول يوم|Thank you for being with us from day one
فرحتنا كملت بحضوركم، الله لا يحرمنا منكم|You completed our joy. May we never be without you
كل الشكر على تعبكم ومحبتكم، ردها الله لكم في أفراحكم|Thank you for your effort and love. May we repay it at your celebrations`,
};
