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
};

export const clickyFamily: FamilyMember[] = [
  {
    id: "clicky",
    name: { ar: "كليكي", en: "Clicky" },
    role: { ar: "قائد العائلة. يرحّب فيك ويوصلك لكل مكان في الموقع.", en: "Leader of the family. Welcomes you and shows you around." },
    color: "#12B5A6",
    mood: "wink",
  },
  {
    id: "warda",
    name: { ar: "وردة", en: "Warda" },
    role: { ar: "الحب والفرح. تفرح معك لما تشتري، وتهتم بمفكّرة العروسة.", en: "Love and joy. Celebrates every purchase and looks after the bride's planner." },
    color: "#F0567A",
    mood: "love",
    accessory: "heart",
  },
  {
    id: "shams",
    name: { ar: "شمس", en: "Shams" },
    role: { ar: "صاحبة الأفكار. تشاركك النصايح والأدلة اللي تسهّل يومك.", en: "The idea maker. Shares tips and guides that make your day easier." },
    color: "#FFC23D",
    mood: "happy",
    accessory: "bulb",
  },
  {
    id: "marjan",
    name: { ar: "مرجان", en: "Marjan" },
    role: { ar: "المساعد. يرد على أسئلتك ويحل أي مشكلة تواجهك.", en: "The helper. Answers your questions and sorts out any problem." },
    color: "#FF6B6B",
    mood: "happy",
    accessory: "chat",
  },
  {
    id: "lilac",
    name: { ar: "ليلك", en: "Lilac" },
    role: { ar: "الحارس. يحمي حسابك وبياناتك، وما يدخل أحد غيرك.", en: "The guardian. Keeps your account and data safe, for your eyes only." },
    color: "#8B7CF6",
    mood: "happy",
    accessory: "shield",
  },
];

export const family = (id: FamilyMember["id"]) => clickyFamily.find((m) => m.id === id)!;

export const familyCopy = {
  title: { ar: "تعرّف على عائلة Clicky", en: "Meet the Clicky family" },
  sub: { ar: "خمسة أصدقاء، لكل واحد دور يساعدك فيه داخل الموقع.", en: "Five friends, each with a job to help you around the site." },
};
