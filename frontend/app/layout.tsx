import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spider Clock | Real-Time World Clock",
  description:
    "A cinematic real-time spider clock with world timezone support, themes, alarm and stopwatch.",
  keywords: [
    "Spider Clock",
    "World Clock",
    "Timezone",
    "Alarm",
    "Stopwatch",
    "Animated Clock",
  ],
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