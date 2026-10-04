import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: "Spider Clock — Clock, World Clock, Alarm, Stopwatch & Timer",
  description:
    "Spider Clock brings together a real-time analog and digital clock, World Clock, timezone selector, Alarm, Stopwatch and Timer in one animated experience.",
  keywords: [
    "Spider Clock",
    "Clock",
    "World Clock",
    "Timezone",
    "Alarm",
    "Stopwatch",
    "Timer",
    "Animated Clock",
  ],
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Spider Clock",
    title: "Spider Clock — Clock, World Clock, Alarm, Stopwatch & Timer",
    description:
      "An animated real-time clock with a World Clock, timezone selector, Alarm, Stopwatch and Timer.",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Spider Clock — Clock, World Clock, Alarm, Stopwatch & Timer",
    description:
      "An animated real-time clock with a World Clock, timezone selector, Alarm, Stopwatch and Timer.",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}