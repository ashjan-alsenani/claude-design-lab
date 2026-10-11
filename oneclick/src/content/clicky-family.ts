import type { ClickyAccessory, ClickyMood } from "@/components/brand/Clicky";

/**
 * The Clicky family: one character per brand color, each with a job on the site.
 * Clicky (teal) leads and welcomes; Warda (pink) is love and joy — buying, the party, the bride's
 * planner; Shams (sunshine) brings ideas — guides and tips; Marjan (coral) helps — help, contact,
 * "page not found"; Lilac (lilac) guards — sign-in codes, devices, security, protected products.
 */
export type FamilyMember = {
  id: "clicky" | "warda" | "shams" | "marjan" | "lilac";
  name: { ar: string; en: string };
  role: { ar: string; en: string };
  color: string;
  mood: ClickyMood;
  accessory?: ClickyAccessory;
  /** Where this character lives on the site; the home card links there. */
  link: { path: string; label: { ar: string; en: string } };
};

export const clickyFamily: FamilyMember[] = [
  {
    id: "clicky",
    name: { ar: "كليكي", en: "Clicky" },
    role: { ar: "قائد العائلة. تلقاه في كل مكان، وهو اللي يعرّفك على المنتجات.", en: "Leader of the family. You'll spot him everywhere, showing you the products." },
    color: "#12B5A6",
    mood: "wink",
    link: { path: "/products", label: { ar: "تصفّح المنتجات", en: "Browse products" } },
  },
  {
    id: "warda",
    name: { ar: "وردة", en: "Warda" },
    role: { ar: "الحب والفرح. تطلع لك وقت الشراء، وعلى مفكّرة العروسة.", en: "Love and joy. She shows up when you buy, and on the bride's planner." },
    color: "#F0567A",
    mood: "love",
    accessory: "heart",
    link: { path: "/products/bride-planner", label: { ar: "مفكّرة العروسة", en: "The bride's planner" } },
  },
  {
    id: "shams",
    name: { ar: "شمس", en: "Shams" },
    role: { ar: "صاحبة الأفكار. تلقاها في الأدلة والنصايح اللي تسهّل يومك.", en: "The idea maker. Find her in the guides and tips that make your day easier." },
    color: "#FFC23D",
    mood: "happy",
    accessory: "bulb",
    link: { path: "/guides", label: { ar: "الأدلة", en: "Guides" } },
  },
  {
    id: "marjan",
    name: { ar: "مرجان", en: "Marjan" },
    role: { ar: "المساعد. تلقاه في صفحة المساعدة والتواصل لما تحتاج شي.", en: "The helper. Find him on the help and contact pages whenever you need something." },
    color: "#FF6B6B",
    mood: "happy",
    accessory: "chat",
    link: { path: "/help", label: { ar: "المساعدة", en: "Help" } },
  },
  {
    id: "lilac",
    name: { ar: "ليلك", en: "Lilac" },
    role: { ar: "الحارس. تلقاه في صفحات أمان حسابك وأجهزتك.", en: "The guardian. Find him on your account's security and devices pages." },
    color: "#8B7CF6",
    mood: "happy",
    accessory: "shield",
    link: { path: "/account/security", label: { ar: "أمان الحساب", en: "Account security" } },
  },
];

export const family = (id: FamilyMember["id"]) => clickyFamily.find((m) => m.id === id)!;

export const familyCopy = {
  title: { ar: "تعرّف على عائلة Clicky", en: "Meet the Clicky family" },
  sub: { ar: "خمسة أصدقاء، كل واحد تلقاه في جزء من الموقع. اضغط على أي واحد ويوديك له.", en: "Five friends, each living in a part of the site. Tap one to go there." },
};
