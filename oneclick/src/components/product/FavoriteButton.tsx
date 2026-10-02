"use client";

import { useSyncExternalStore } from "react";
import { HeartIcon } from "@phosphor-icons/react/dist/ssr";
import { motion, useReducedMotion } from "motion/react";
import { track } from "@/lib/analytics/track";

// Guest favorites live on this device (localStorage). Signed-in favorites will sync to
// the `favorites` table once accounts are connected.
const KEY = "oc-favorites";
const listeners = new Set<() => void>();

function read(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
let cache: string[] | null = null;
function snapshot() {
  if (cache === null) cache = read();
  return cache;
}
function write(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {}
  cache = ids;
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}
const empty: string[] = [];

export function useFavorites() {
  const ids = useSyncExternalStore(subscribe, snapshot, () => empty);
  const toggle = (id: string) => {
    const has = ids.includes(id);
    write(has ? ids.filter((x) => x !== id) : [...ids, id]);
    track("favorite_toggle", { product_id: id, saved: !has });
  };
  return { ids, toggle };
}

export function FavoriteButton({ productId, labels, className = "" }: { productId: string; labels: { add: string; remove: string }; className?: string }) {
  const { ids, toggle } = useFavorites();
  const reduce = useReducedMotion();
  const saved = ids.includes(productId);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? labels.remove : labels.add}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      className={`grid size-10 place-items-center rounded-full bg-surface-raised/90 text-ink-soft shadow-soft backdrop-blur hover:text-ink ${className}`}
    >
      <motion.span key={String(saved)} initial={reduce ? false : { scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
        <HeartIcon size={18} weight={saved ? "fill" : "regular"} color={saved ? "var(--oc-hue-bride)" : undefined} />
      </motion.span>
    </button>
  );
}
