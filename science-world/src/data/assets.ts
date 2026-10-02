/**
 * Optional AI-generated illustrations.
 * The site is complete without them: every visual has a hand-drawn SVG or emoji fallback.
 * To use one: generate the image (see ASSETS.md), save it to public/<path>,
 * then add the path to `readyAssets` below.
 */
export const readyAssets = new Set<string>([
  // 'assets/lesson-1-1-body-organs.webp',
]);

export function assetReady(path: string | undefined): boolean {
  return Boolean(path && readyAssets.has(path));
}
