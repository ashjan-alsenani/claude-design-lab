import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "One Click Digital Hub",
    short_name: "One Click Digital Hub",
    description: "Smart digital tools for a simpler everyday life.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f7f6",
    theme_color: "#0c6b66",
    icons: [
      { src: "/brand/oneclick-app-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/oneclick-app-icon.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/oneclick-app-icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
