import type { Device } from "./types";

/**
 * Friendly device label from the User-Agent. Deliberately coarse: platform + browser
 * only. No fingerprinting (no canvas, fonts, hardware or IP-based identification).
 * Device identity is a random HttpOnly cookie the customer can clear at any time.
 */
export function describeDevice(userAgent: string | null | undefined): { name: string; platform: Device["platform"] } {
  const ua = userAgent ?? "";
  const platform: Device["platform"] = /iPhone|iPad|iPod/.test(ua)
    ? "ios"
    : /Android/.test(ua)
      ? "android"
      : /Macintosh|Mac OS X/.test(ua)
        ? "mac"
        : /Windows/.test(ua)
          ? "windows"
          : /Linux|X11/.test(ua)
            ? "linux"
            : "other";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /Firefox\//.test(ua)
      ? "Firefox"
      : /Chrome\/|CriOS\//.test(ua)
        ? "Chrome"
        : /Safari\//.test(ua)
          ? "Safari"
          : "Browser";
  const device = { ios: /iPad/.test(ua) ? "iPad" : "iPhone", android: "Android", mac: "Mac", windows: "Windows", linux: "Linux", other: "device" }[platform];
  return { name: `${browser} on ${device}`, platform };
}
