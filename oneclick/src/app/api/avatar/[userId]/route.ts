import { currentContext } from "@/lib/licensing/server";
import { readAvatarPhoto } from "@/lib/licensing/avatar";

/**
 * A customer's profile photo. Private: only that customer and site admins can load it.
 * Served with a strict content type and a sandboxing CSP so the bytes can only ever be an image.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const ctx = await currentContext();
  const allowed = ctx && (ctx.user.id === userId || ctx.roles.includes("admin"));
  const base = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex", "X-Content-Type-Options": "nosniff" };
  if (!allowed) return new Response(null, { status: 404, headers: base });
  const photo = await readAvatarPhoto(userId);
  if (!photo) return new Response(null, { status: 404, headers: base });
  return new Response(new Uint8Array(photo.bytes), {
    headers: {
      ...base,
      // The URL carries a version (?v=N) that changes on every upload, so a private cache is safe.
      "Cache-Control": "private, max-age=86400",
      "Content-Type": photo.mime,
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Content-Disposition": "inline",
    },
  });
}
