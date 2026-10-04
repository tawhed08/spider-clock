import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Spider Clock — Clock, World Clock, Alarm, Stopwatch & Timer",
    short_name: "Spider Clock",
    description:
      "An animated Clock with a World Clock, timezone selector, Alarm, Stopwatch and Timer.",
    start_url: "/",
    display: "standalone",
    background_color: "#030507",
    theme_color: "#a3e635",
    icons: [
      {
        src: "/icons/spider-clock-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/spider-clock-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/spider-clock.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
