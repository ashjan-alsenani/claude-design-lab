import { PlusIcon } from "@phosphor-icons/react/dist/ssr";

/** Native disclosure accordion: accessible, works without JavaScript. */
export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((f) => (
        <details key={f.q} className="group py-1">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-start text-[1.05rem] font-medium text-ink [&::-webkit-details-marker]:hidden">
            {f.q}
            <PlusIcon size={18} className="shrink-0 text-muted transition-transform duration-300 group-open:rotate-45" aria-hidden="true" />
          </summary>
          <p className="max-w-[65ch] pb-5 leading-relaxed text-ink-soft">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
