"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/track";

export function CheckoutTracker({ productId }: { productId: string }) {
  useEffect(() => {
    track("checkout_start", { product_id: productId });
  }, [productId]);
  return null;
}
