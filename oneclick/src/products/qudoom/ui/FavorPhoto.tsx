import type { FavorCat } from "../model/favor-ideas";
import { FavorArt } from "./Illustrations";

/**
 * AI-made sample photos (Canva), one per favor category, to show roughly how a favor looks. They are
 * approximate pictures, not the exact item; a category without a photo yet falls back to its drawing.
 */
export const favorPhotos: Partial<Record<FavorCat, string>> = {
  sweets: "/brand/qudoom/favors/sweets.webp",
  scents: "/brand/qudoom/favors/scents.webp",
  plants: "/brand/qudoom/favors/plants.webp",
};

export function FavorPhoto({ cat, color, className = "" }: { cat: FavorCat; color: string; className?: string }) {
  const src = favorPhotos[cat];
  if (!src) return <FavorArt cat={cat} color={color} className={className} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" loading="lazy" decoding="async" width={200} height={200} className={`rounded-[16px] object-cover ${className}`} />;
}
