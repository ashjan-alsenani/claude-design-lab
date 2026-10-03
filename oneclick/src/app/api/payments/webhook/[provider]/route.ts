import { getPaymentProvider } from "@/lib/payments";
import { licensing } from "@/lib/licensing/server";

/**
 * Payment provider webhooks. The ONLY place (besides audited admin grants) where
 * licenses are activated. The provider adapter must verify the signature; until a real
 * provider is connected every request is rejected.
 */
export async function POST(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider: id } = await params;
  const { sandboxProvider, engine } = licensing();
  const provider = id === "sandbox" ? sandboxProvider : getPaymentProvider();
  if (!provider || provider.id !== id) return Response.json({ error: "unknown_provider" }, { status: 404 });
  const raw = await req.text();
  let event;
  try {
    event = await provider.parseWebhook(raw, req.headers);
  } catch {
    return Response.json({ error: "invalid_event" }, { status: 400 });
  }
  const r = await engine.handlePaymentEvent(provider.id, event);
  return Response.json({ received: true, outcome: r.outcome });
}
