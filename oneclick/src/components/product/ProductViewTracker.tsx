"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/track";

export function ProductViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    track("product_view", { product_id: productId });
  }, [productId]);
  return null;
}
