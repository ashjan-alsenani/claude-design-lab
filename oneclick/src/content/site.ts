import type { Localized } from "@/i18n/config";

/**
 * Brand messaging (approved direction, see BRAND_GUIDELINES.md) and business settings.
 * Business identity fields stay empty and are NOT displayed publicly until the owner
 * provides final legal information through Admin > Business settings.
 */
export const brand = {
  name: "One Click",
  nameAr: "ون كليك",
  slogan: { en: "Less effort. More life.", ar: "جهد أقل. حياة أكثر." } satisfies Localized,
  statement: {
    en: "One Click makes everyday life simpler with beautiful, useful digital tools.",
    ar: "ون كليك تجعل حياتك اليومية أبسط بأدوات رقمية جميلة ومفيدة.",
  } satisfies Localized,
  elevator: {
    en: "One Click is a digital lifestyle brand from Oman. We design interactive planners, organizers and tools that take everyday tasks from chaos to clarity, in Arabic and English.",
    ar: "ون كليك علامة رقمية لأسلوب الحياة من عُمان. نصمم مخططات ومنظّمات وأدوات تفاعلية تنقل مهامك اليومية من الفوضى إلى الوضوح، بالعربي والإنجليزي.",
  } satisfies Localized,
  instagramBio: {
    en: "Less effort. More life.\nSmart planners & organizers for everyday life\nArabic + English · From Oman",
    ar: "جهد أقل. حياة أكثر.\nمخططات ومنظّمات ذكية ليومك\nعربي + English · من عُمان",
  } satisfies Localized,
};

export type BusinessSettings = {
  legalName: string | null;
  commercialRegistration: string | null;
  vatNumber: string | null;
  address: string | null;
  supportEmail: string | null;
  businessPhone: string | null;
  /** Public display stays off until the owner confirms the details above. */
  showLegalIdentity: boolean;
};

export const businessSettings: BusinessSettings = {
  legalName: null,
  commercialRegistration: null,
  vatNumber: null,
  address: null,
  supportEmail: null,
  businessPhone: null,
  showLegalIdentity: false,
};

export const social = {
  instagram: null as string | null, // set once the handle is secured (see OWNER_ACTIONS.md)
};
