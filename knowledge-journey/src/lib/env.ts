/**
 * True for the build published inside claude.ai's artifact viewer, whose sandbox
 * blocks file downloads and the print dialog. Set with VITE_ARTIFACT=1.
 */
export const EMBEDDED = import.meta.env.VITE_ARTIFACT === '1';
