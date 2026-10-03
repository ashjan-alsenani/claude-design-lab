import type { Localized } from "@/i18n/config";
import type { Product } from "@/content/types";
import { offersDownloads } from "./policy";
import type { ProductSecuritySettings } from "./types";

/**
 * Downloadable files per product. Production: objects in a PRIVATE storage bucket
 * (Supabase Storage), served only through short-lived signed URLs after the engine
 * authorizes the request. In the sandbox, a personalized sample PDF is generated.
 */
export type ProductFile = { id: string; label: Localized; format: "pdf" };

export function productFiles(settings: ProductSecuritySettings): ProductFile[] {
  if (!offersDownloads(settings)) return [];
  return [{ id: "printable", label: { en: "Printable PDF (personalized)", ar: "ملف PDF للطباعة (مخصص لك)" }, format: "pdf" }];
}

/**
 * Minimal one-page PDF with a personalization footer (visible watermark).
 * Watermarking discourages casual sharing and identifies the licensee; it cannot
 * prevent copying, and we never claim otherwise.
 */
export function personalizedSamplePdf(p: { product: Product; email: string; orderRef: string; licenseId: string; watermark: boolean; issuedAt: string }) {
  const ascii = (s: string) => s.replace(/[^\x20-\x7E]/g, "?").replace(/([()\\])/g, "\\$1");
  const lines: [number, number, number, string][] = [
    [56, 770, 24, p.product.name.en],
    [56, 740, 12, p.product.tagline.en],
    [56, 700, 12, "Sample printable page (sandbox). The real file is supplied by the product team."],
    ...Array.from({ length: 12 }, (_, i): [number, number, number, string] => [56, 660 - i * 34, 12, "[  ]  ____________________________________________"]),
  ];
  if (p.watermark) {
    lines.push([56, 80, 9, `Licensed to ${p.email} | Order ${p.orderRef} | License ${p.licenseId}`]);
    lines.push([56, 66, 9, `Personal license. Issued ${p.issuedAt.slice(0, 10)}. Please do not redistribute.`]);
  }
  const stream = lines.map(([x, y, size, text]) => `BT /F1 ${size} Tf ${x} ${y} Td (${ascii(text)}) Tj ET`).join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  ];
  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((o, i) => {
    offsets.push(Buffer.byteLength(out));
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = Buffer.byteLength(out);
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, "latin1");
}
