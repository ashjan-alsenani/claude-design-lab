import { z } from "zod";

// Server-side validation schemas. The client validates for convenience; the server
// re-validates everything (never trust the browser).

const text = (max: number) => z.string().trim().max(max);

export const solutionTypes = ["website", "mini-app", "dashboard", "planner", "tool", "other"] as const;
export const budgetBands = ["lt-100", "100-300", "300-750", "750-plus", "unsure"] as const;

export const customRequestSchema = z.object({
  goal: text(1000).min(10, "tooShort"),
  solutionType: z.enum(solutionTypes),
  audience: text(500).optional().default(""),
  features: text(2000).min(5, "tooShort"),
  references: text(2000).optional().default(""),
  languages: z.array(z.enum(["ar", "en", "other"])).min(1, "required"),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")).default(""),
  budget: z.enum(budgetBands),
  branding: z.enum(["have", "need", "na"]),
  payments: z.enum(["yes", "no", "unsure"]),
  notes: text(2000).optional().default(""),
  name: text(120).min(2, "required"),
  email: z.string().trim().toLowerCase().email("invalidEmail").max(200),
  phone: text(40).optional().default(""),
  country: text(80).optional().default(""),
  privacy: z.literal("on", { message: "required" }),
  locale: z.enum(["ar", "en"]),
  // Honeypot: real people never fill this hidden field.
  website: z.string().max(0).optional().default(""),
});
export type CustomRequestInput = z.infer<typeof customRequestSchema>;

export const contactSchema = z.object({
  topic: z.enum(["support", "order", "custom", "partnership", "other"]),
  reference: text(80).optional().default(""),
  name: text(120).min(2, "required"),
  email: z.string().trim().toLowerCase().email("invalidEmail").max(200),
  message: text(4000).min(10, "tooShort"),
  privacy: z.literal("on", { message: "required" }),
  locale: z.enum(["ar", "en"]),
  website: z.string().max(0).optional().default(""),
});
export type ContactInput = z.infer<typeof contactSchema>;

/** Converts FormData to a plain object, collecting repeated keys into arrays. */
export function formDataToObject(fd: FormData, arrayKeys: string[] = []) {
  const out: Record<string, unknown> = {};
  for (const key of new Set(fd.keys())) {
    const all = fd.getAll(key).map((v) => (typeof v === "string" ? v : ""));
    out[key] = arrayKeys.includes(key) ? all : all[0];
  }
  for (const k of arrayKeys) if (!(k in out)) out[k] = [];
  return out;
}

export type FieldErrors = Record<string, string>;
export function zodFieldErrors(err: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of err.issues) {
    const k = String(issue.path[0] ?? "form");
    if (!out[k]) out[k] = issue.message === "Required" || issue.code === "invalid_value" ? "required" : issue.message;
  }
  return out;
}
