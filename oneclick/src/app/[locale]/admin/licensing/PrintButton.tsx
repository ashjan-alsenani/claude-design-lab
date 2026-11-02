"use client";

/** Opens the browser's print dialog, where the owner can also save the page as a PDF. */
export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="h-10 rounded-full bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary-hover print:hidden">
      {label}
    </button>
  );
}
