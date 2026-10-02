import type { Category } from "./types";

// Categories are data, not code. The Admin "Categories" screen will manage this list
// (Supabase table `categories`). Subcategories use `parent`.
export const categories: Category[] = [
  {
    slug: "life-productivity",
    name: { en: "Life & Productivity", ar: "الحياة والإنتاجية" },
    description: { en: "Plan your days, weeks and goals without the mental clutter.", ar: "خطّط أيامك وأسابيعك وأهدافك بدون زحمة في رأسك." },
    hue: "planner",
    order: 1,
  },
  {
    slug: "wedding-events",
    name: { en: "Wedding & Events", ar: "الأعراس والمناسبات" },
    description: { en: "Every date, vendor and guest in one calm place.", ar: "كل موعد ومورّد وضيف في مكان واحد هادئ." },
    hue: "bride",
    order: 2,
  },
  {
    slug: "shopping-home",
    name: { en: "Shopping & Home", ar: "التسوق والبيت" },
    description: { en: "Lists, routines and household organization that actually stick.", ar: "قوائم وروتين وتنظيم للبيت يدوم معك." },
    hue: "grocery",
    order: 3,
  },
  {
    slug: "health-fitness",
    name: { en: "Health & Fitness", ar: "الصحة واللياقة" },
    description: { en: "Simple tracking for workouts and healthy habits.", ar: "متابعة بسيطة للتمارين والعادات الصحية." },
    hue: "fit",
    order: 4,
  },
  {
    slug: "money-budgeting",
    name: { en: "Money & Budgeting", ar: "المال والميزانية" },
    description: { en: "See where your money goes and plan what comes next.", ar: "اعرف وين تروح فلوسك وخطّط للقادم." },
    hue: "budget",
    order: 5,
  },
  {
    slug: "study-education",
    name: { en: "Study & Education", ar: "الدراسة والتعليم" },
    description: { en: "Organize courses, exams and revision with less stress.", ar: "نظّم موادك واختباراتك ومراجعتك بضغط أقل." },
    hue: "study",
    order: 6,
  },
  {
    slug: "travel",
    name: { en: "Travel", ar: "السفر" },
    description: { en: "Trips planned, packed and budgeted before you leave.", ar: "رحلتك مخططة ومجهزة وميزانيتها واضحة قبل لا تسافر." },
    hue: "travel",
    order: 7,
  },
  {
    slug: "templates-downloads",
    name: { en: "Templates & Downloads", ar: "قوالب وملفات للتحميل" },
    description: { en: "Printable planners, checklists and digital kits.", ar: "مخططات وقوائم قابلة للطباعة وحزم رقمية." },
    hue: "brand",
    order: 8,
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
