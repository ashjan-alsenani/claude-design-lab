import type { FavorCat } from "../model/favor-ideas";
import type { IdeaKind } from "../model/all-ideas";
import type { LookTheme } from "../model/looks";
import { FavorArt } from "./Illustrations";
import { favorPhotoFiles, ideaPhotoFiles, kindPhotoFiles, lookPhotoFiles } from "./photos.gen";
import type { AnyIdea } from "../model/all-ideas";
import type { Look } from "../model/looks";

/**
 * AI-made sample photos (Canva): one per favor category, per idea kind and per welcome theme. They
 * show roughly how an idea looks, not the exact item. Anything without a photo yet keeps its drawing.
 */
export const favorPhoto = (cat: FavorCat): string | undefined => favorPhotoFiles[cat];
export const kindPhoto = (kind: IdeaKind): string | undefined => kindPhotoFiles[kind] ?? (kind === "favor" ? favorPhotoFiles.sweets : undefined);
export const lookPhoto = (theme: LookTheme): string | undefined => lookPhotoFiles[theme];
/** Stable file key for an idea's own photo: FNV-1a of its English text (ids are positional and can shift). */
export function ideaKey(en: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < en.length; i++) h = Math.imul(h ^ en.charCodeAt(i), 0x01000193);
  return (h >>> 0).toString(36);
}
/** The idea's own photo when there is one, else its category's or kind's sample. */
export const ideaPhoto = (x: AnyIdea): string | undefined => ideaPhotoFiles[ideaKey(x.en)];
/** A welcome look's own photo (place + theme + palette), then place + theme, then the theme sample. */
export const lookPhotoFor = (l: Look): string | undefined => lookPhotoFiles[`${l.place}.${l.motif}`];

export function Photo({ src, className = "", alt = "" }: { src: string; className?: string; alt?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" decoding="async" width={200} height={200} className={`object-cover ${className}`} />;
}

export function FavorPhoto({ cat, color, className = "" }: { cat: FavorCat; color: string; className?: string }) {
  const src = favorPhoto(cat);
  if (!src) return <FavorArt cat={cat} color={color} className={className} />;
  return <Photo src={src} className={`rounded-[16px] ${className}`} />;
}
