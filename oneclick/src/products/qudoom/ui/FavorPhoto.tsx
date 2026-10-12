import type { FavorCat } from "../model/favor-ideas";
import type { IdeaKind } from "../model/all-ideas";
import type { LookTheme } from "../model/looks";
import { FavorArt } from "./Illustrations";
import { favorPhotoFiles, kindPhotoFiles, lookPhotoFiles } from "./photos.gen";

/**
 * AI-made sample photos (Canva): one per favor category, per idea kind and per welcome theme. They
 * show roughly how an idea looks, not the exact item. Anything without a photo yet keeps its drawing.
 */
export const favorPhoto = (cat: FavorCat): string | undefined => favorPhotoFiles[cat];
export const kindPhoto = (kind: IdeaKind): string | undefined => kindPhotoFiles[kind] ?? (kind === "favor" ? favorPhotoFiles.sweets : undefined);
export const lookPhoto = (theme: LookTheme): string | undefined => lookPhotoFiles[theme];

export function Photo({ src, className = "", alt = "" }: { src: string; className?: string; alt?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" decoding="async" width={200} height={200} className={`object-cover ${className}`} />;
}

export function FavorPhoto({ cat, color, className = "" }: { cat: FavorCat; color: string; className?: string }) {
  const src = favorPhoto(cat);
  if (!src) return <FavorArt cat={cat} color={color} className={className} />;
  return <Photo src={src} className={`rounded-[16px] ${className}`} />;
}
