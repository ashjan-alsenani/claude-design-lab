import type { Locale } from "@/i18n/config";

/**
 * One Click Digital Hub transactional email templates (bilingual, RTL-aware, inline styles for
 * email-client compatibility). Rendered to { subject, html, text }.
 * Marketing emails must use a separate path that checks consent + unsubscribe.
 */
export type EmailContent = { subject: string; html: string; text: string };

const C = { bg: "#FFF9F4", card: "#FFFFFF", ink: "#1E1B3A", muted: "#6C6790", primary: "#0B7D73", accent: "#FFC23D", line: "#EFE5DC" };

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function layout(locale: Locale, opts: { preheader: string; title: string; paragraphs: string[]; cta?: { label: string; url: string }; footer: string }) {
  const dir = locale === "ar" ? "rtl" : "ltr";
  const font = "Rubik, -apple-system, 'Segoe UI', Tahoma, Arial, sans-serif";
  const align = locale === "ar" ? "right" : "left";
  const cta = opts.cta
    ? `<p style="margin:28px 0 8px"><a href="${esc(opts.cta.url)}" style="display:inline-block;background:${C.primary};color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px">${esc(opts.cta.label)}</a></p>`
    : "";
  const html = `<!doctype html><html lang="${locale}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(opts.title)}</title></head>
<body style="margin:0;background:${C.bg};font-family:${font};color:${C.ink}">
<span style="display:none;max-height:0;overflow:hidden">${esc(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${C.card};border:1px solid ${C.line};border-radius:20px;padding:32px;text-align:${align}" dir="${dir}">
<tr><td>
<p style="margin:0 0 24px;font-weight:600;font-size:18px;direction:ltr;text-align:${align}"><span style="color:${C.primary}">●</span> One Click Digital Hub</p>
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.35">${esc(opts.title)}</h1>
${opts.paragraphs.map((p) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:${C.ink}">${esc(p)}</p>`).join("")}
${cta}
</td></tr></table>
<p style="max-width:560px;margin:16px auto 0;font-size:12px;color:${C.muted};text-align:center;font-family:${font}" dir="${dir}">${esc(opts.footer)}</p>
</td></tr></table></body></html>`;
  const text = [opts.title, "", ...opts.paragraphs, opts.cta ? `\n${opts.cta.label}: ${opts.cta.url}` : "", "", opts.footer].join("\n");
  return { html, text };
}

const footer = {
  en: "One Click Digital Hub · Less effort. More life. You received this email because of an action on your One Click Digital Hub account.",
  ar: "ون كليك ديجيتال هب · جهد أقل. حياة أكثر. وصلتك هذه الرسالة بسبب إجراء في حسابك على ون كليك ديجيتال هب.",
};

type T = { en: string; ar: string };
const pick = (t: T, l: Locale) => t[l];

export const emailTemplates = {
  welcome(locale: Locale, p: { name: string; dashboardUrl: string }): EmailContent {
    const title = pick({ en: `Welcome to One Click Digital Hub, ${p.name}`, ar: `أهلًا بك في ون كليك ديجيتال هب، ${p.name}` }, locale);
    return {
      subject: pick({ en: "Welcome to One Click Digital Hub", ar: "أهلًا بك في ون كليك ديجيتال هب" }, locale),
      ...layout(locale, {
        preheader: pick({ en: "Your account is ready.", ar: "حسابك جاهز." }, locale),
        title,
        paragraphs: [pick({ en: "Your account is ready. Your products, downloads and favorites will always be in your dashboard.", ar: "حسابك جاهز. منتجاتك وملفاتك ومفضلتك بتكون دايمًا في لوحة التحكم." }, locale)],
        cta: { label: pick({ en: "Open your dashboard", ar: "افتح لوحة التحكم" }, locale), url: p.dashboardUrl },
        footer: footer[locale],
      }),
    };
  },
  verifyEmail(locale: Locale, p: { url: string }): EmailContent {
    return {
      subject: pick({ en: "Confirm your email", ar: "أكّد بريدك الإلكتروني" }, locale),
      ...layout(locale, {
        preheader: pick({ en: "One click to confirm.", ar: "ضغطة وحدة للتأكيد." }, locale),
        title: pick({ en: "Confirm your email", ar: "أكّد بريدك الإلكتروني" }, locale),
        paragraphs: [pick({ en: "Tap the button to confirm this address. The link expires in 24 hours. If you didn't create an account, ignore this email.", ar: "اضغط الزر لتأكيد هذا البريد. الرابط ينتهي خلال ٢٤ ساعة. إذا ما سويت حساب، تجاهل هذي الرسالة." }, locale)],
        cta: { label: pick({ en: "Confirm email", ar: "تأكيد البريد" }, locale), url: p.url },
        footer: footer[locale],
      }),
    };
  },
  passwordReset(locale: Locale, p: { url: string }): EmailContent {
    return {
      subject: pick({ en: "Reset your password", ar: "إعادة تعيين كلمة المرور" }, locale),
      ...layout(locale, {
        preheader: pick({ en: "This link expires in 1 hour.", ar: "الرابط ينتهي خلال ساعة." }, locale),
        title: pick({ en: "Reset your password", ar: "إعادة تعيين كلمة المرور" }, locale),
        paragraphs: [pick({ en: "Someone asked to reset the password for this account. If it was you, use the button below within 1 hour. If not, you can safely ignore this email.", ar: "وصلنا طلب لإعادة تعيين كلمة المرور لهذا الحساب. إذا كان منك، استخدم الزر خلال ساعة. وإذا مو منك، تجاهل الرسالة بأمان." }, locale)],
        cta: { label: pick({ en: "Choose a new password", ar: "اختر كلمة مرور جديدة" }, locale), url: p.url },
        footer: footer[locale],
      }),
    };
  },
  purchaseConfirmation(locale: Locale, p: { orderRef: string; items: string[]; total: string; dashboardUrl: string }): EmailContent {
    return {
      subject: pick({ en: `Order ${p.orderRef} confirmed`, ar: `تم تأكيد الطلب ${p.orderRef}` }, locale),
      ...layout(locale, {
        preheader: pick({ en: "Your products are ready.", ar: "منتجاتك جاهزة." }, locale),
        title: pick({ en: "Thank you, your order is confirmed", ar: "شكرًا لك، تم تأكيد طلبك" }, locale),
        paragraphs: [
          pick({ en: `Order reference: ${p.orderRef}`, ar: `رقم الطلب: ${p.orderRef}` }, locale),
          ...p.items,
          pick({ en: `Total paid: ${p.total}`, ar: `المبلغ المدفوع: ${p.total}` }, locale),
        ],
        cta: { label: pick({ en: "Open my products", ar: "افتح منتجاتي" }, locale), url: p.dashboardUrl },
        footer: footer[locale],
      }),
    };
  },
  productAccess(locale: Locale, p: { productName: string; url: string }): EmailContent {
    return {
      subject: pick({ en: `${p.productName} is ready`, ar: `${p.productName} جاهز` }, locale),
      ...layout(locale, {
        preheader: pick({ en: "Start in under a minute.", ar: "ابدأ في أقل من دقيقة." }, locale),
        title: pick({ en: `${p.productName} is ready for you`, ar: `${p.productName} جاهز لك` }, locale),
        paragraphs: [pick({ en: "Open it from any device by signing in. Tip: add it to your home screen for one-tap access.", ar: "افتحه من أي جهاز بعد تسجيل الدخول. نصيحة: أضفه للشاشة الرئيسية عشان يفتح بضغطة." }, locale)],
        cta: { label: pick({ en: "Open now", ar: "افتح الآن" }, locale), url: p.url },
        footer: footer[locale],
      }),
    };
  },
  customRequestConfirmation(locale: Locale, p: { name: string; reference: string }): EmailContent {
    return {
      subject: pick({ en: `We received your request (${p.reference})`, ar: `وصلنا طلبك (${p.reference})` }, locale),
      ...layout(locale, {
        preheader: pick({ en: "We reply within 3 working days.", ar: "نرد خلال ٣ أيام عمل." }, locale),
        title: pick({ en: `Thanks, ${p.name}`, ar: `شكرًا، ${p.name}` }, locale),
        paragraphs: [
          pick({ en: `Your custom solution request ${p.reference} is with us. We'll review it and reply with questions or a quote, usually within 3 working days.`, ar: `طلبك ${p.reference} وصلنا. بنراجعه ونرد عليك بأسئلة أو عرض سعر، عادةً خلال ٣ أيام عمل.` }, locale),
        ],
        footer: footer[locale],
      }),
    };
  },
  supportConfirmation(locale: Locale, p: { reference: string }): EmailContent {
    return {
      subject: pick({ en: `Support request ${p.reference}`, ar: `طلب دعم ${p.reference}` }, locale),
      ...layout(locale, {
        preheader: pick({ en: "We reply within 2 working days.", ar: "نرد خلال يومين عمل." }, locale),
        title: pick({ en: "We got your message", ar: "وصلتنا رسالتك" }, locale),
        paragraphs: [pick({ en: `Reference ${p.reference}. Reply to this email to add details.`, ar: `الرقم المرجعي ${p.reference}. رد على هذي الرسالة لإضافة تفاصيل.` }, locale)],
        footer: footer[locale],
      }),
    };
  },
  ownerNotification(p: { kind: string; reference: string; summary: string; adminUrl: string }): EmailContent {
    return {
      subject: `[One Click Digital Hub] New ${p.kind}: ${p.reference}`,
      ...layout("en", {
        preheader: p.summary,
        title: `New ${p.kind}`,
        paragraphs: [`Reference: ${p.reference}`, p.summary],
        cta: { label: "Open in Admin", url: p.adminUrl },
        footer: "Owner notification from One Click Digital Hub.",
      }),
    };
  },
};
