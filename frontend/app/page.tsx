
"use client";

import { useState } from "react";
import Alarm from "@/components/Alarm";
import ClockControls from "@/components/ClockControls";
import SpiderClock from "@/components/SpiderClock";
import Stopwatch from "@/components/Stopwatch";
import Timer from "@/components/Timer";
import WorldClocks from "@/components/WorldClocks";

export default function Home() {
  const [timezone, setTimezone] = useState("Asia/Dhaka");
  const [theme, setTheme] = useState("spider");

  const fullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  const themeStyles: Record<string, string> = {
    spider: "bg-[#030507]",
    neon: "bg-[#020806]",
    red: "bg-[#090304]",
    cyber: "bg-[#02050b]",
    classic: "bg-[#08090b]",
  };

  return (
    <main
      className={`relative min-h-screen overflow-x-hidden overflow-y-auto text-white transition-colors duration-700 ${
        themeStyles[theme] || themeStyles.spider
      }`}
    >
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[12%] h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-lime-400/[0.035] blur-[100px] sm:top-[18%] sm:h-[520px] sm:w-[520px] sm:blur-[150px]" />

        <div className="absolute -left-40 top-[45%] h-[320px] w-[320px] rounded-full bg-emerald-500/[0.025] blur-[100px] sm:-left-48 sm:h-[500px] sm:w-[500px] sm:blur-[140px]" />

        <div className="absolute -right-40 top-[10%] h-[320px] w-[320px] rounded-full bg-cyan-500/[0.025] blur-[100px] sm:-right-48 sm:h-[500px] sm:w-[500px] sm:blur-[140px]" />

        <div className="absolute bottom-0 left-1/2 h-[280px] w-[500px] -translate-x-1/2 rounded-full bg-lime-400/[0.018] blur-[120px]" />

        <div className="spider-web absolute inset-0 opacity-70" />
      </div>

      {/* Top glow */}
      <div className="glow-line pointer-events-none fixed left-0 right-0 top-0 z-50 h-px opacity-70" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center px-3.5 py-5 sm:px-8 sm:py-10 lg:px-10">
        {/* Header */}
        <header className="w-full text-center">
          <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-lime-400/10 bg-lime-400/[0.035] px-3 py-1.5 shadow-[0_0_30px_rgba(163,230,53,0.025)] backdrop-blur-xl sm:mb-6 sm:px-4 sm:py-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-50" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400 shadow-[0_0_12px_rgba(163,230,53,0.9)]" />
            </span>

            <span className="truncate text-[8px] font-bold uppercase tracking-[0.18em] text-lime-300/70 sm:text-xs sm:tracking-[0.3em]">
              Live • Real Time
            </span>
          </div>

          <div className="relative">
            <p className="mb-2 text-[7px] font-semibold uppercase tracking-[0.28em] text-white/25 sm:mb-3 sm:text-xs sm:tracking-[0.5em]">
              The Web Is Always Watching
            </p>

            <h1 className="text-4xl font-black tracking-[-0.06em] sm:text-6xl lg:text-7xl">
              <span className="text-white">Spider</span>{" "}
              <span className="text-lime-400 drop-shadow-[0_0_30px_rgba(163,230,53,0.22)]">
                Clock
              </span>
            </h1>

            <p className="mx-auto mt-3 max-w-xl px-2 text-[11px] leading-5 text-white/35 sm:mt-5 sm:px-0 sm:text-base sm:leading-7">
              A cinematic real-time clock experience with animated spider
              mechanics, global timezones and interactive themes.
            </p>
          </div>

          <div className="mx-auto mt-5 flex max-w-md items-center gap-3 sm:mt-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />

            <div className="h-1.5 w-1.5 shrink-0 rotate-45 border border-lime-400/60 bg-lime-400/20 shadow-[0_0_10px_rgba(163,230,53,0.5)]" />

            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>
        </header>

        {/* Main Clock */}
        <div className="relative z-10 mt-2 w-full overflow-hidden sm:mt-10">
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-lime-400/[0.035] sm:h-[510px] sm:w-[510px]" />

          <div className="absolute left-1/2 top-1/2 h-[325px] w-[325px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.02] sm:h-[570px] sm:w-[570px]" />

          <SpiderClock timezone={timezone} theme={theme} />
        </div>

        {/* Clock Controls */}
        <div className="relative z-20 mt-2 w-full sm:mt-5">
          <ClockControls
            timezone={timezone}
            setTimezone={setTimezone}
            theme={theme}
            setTheme={setTheme}
            fullscreen={fullscreen}
          />
        </div>

        {/* Tools Section */}
        <section className="mt-9 w-full max-w-7xl sm:mt-14">
          {/* Section heading */}
          <div className="mb-4 flex items-center gap-2.5 sm:mb-7 sm:gap-4">
            <div className="h-px min-w-0 flex-1 bg-gradient-to-r from-transparent to-white/10" />

            <div className="shrink-0 text-center">
              <p className="text-[7px] font-bold uppercase tracking-[0.22em] text-lime-400/60 sm:text-[10px] sm:tracking-[0.35em]">
                Time Utilities
              </p>

              <h2 className="mt-1 text-sm font-bold tracking-tight text-white/80 sm:text-xl">
                Clock Tools
              </h2>
            </div>

            <div className="h-px min-w-0 flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>

          {/* Tool Cards */}
          <div className="grid w-full grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
            {/* Alarm */}
            <article className="group relative min-w-0 overflow-hidden rounded-[24px] border border-white/[0.055] bg-white/[0.018] p-1 shadow-[0_10px_40px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-1 hover:border-lime-400/15 hover:bg-white/[0.025] hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-lime-400/[0.025] blur-3xl transition-opacity duration-500 group-hover:bg-lime-400/[0.06]" />

              <div className="relative min-w-0 overflow-hidden rounded-[20px]">
                <Alarm timezone={timezone} />
              </div>
            </article>

            {/* Stopwatch */}
            <article className="group relative min-w-0 overflow-hidden rounded-[24px] border border-white/[0.055] bg-white/[0.018] p-1 shadow-[0_10px_40px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-1 hover:border-lime-400/15 hover:bg-white/[0.025] hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-cyan-400/[0.02] blur-3xl transition-opacity duration-500 group-hover:bg-cyan-400/[0.05]" />

              <div className="relative min-w-0 overflow-hidden rounded-[20px]">
                <Stopwatch />
              </div>
            </article>

            {/* Timer */}
            <article className="group relative min-w-0 overflow-hidden rounded-[24px] border border-white/[0.055] bg-white/[0.018] p-1 shadow-[0_10px_40px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-1 hover:border-lime-400/15 hover:bg-white/[0.025] hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)] md:col-span-2 xl:col-span-1">
              <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-emerald-400/[0.02] blur-3xl transition-opacity duration-500 group-hover:bg-emerald-400/[0.05]" />

              <div className="relative min-w-0 overflow-hidden rounded-[20px]">
                <Timer />
              </div>
            </article>
          </div>
        </section>

        {/* World Time */}
        <section className="mt-10 w-full max-w-6xl sm:mt-16">
          <div className="mb-4 flex items-center gap-2.5 sm:mb-7 sm:gap-4">
            <div className="h-px min-w-0 flex-1 bg-gradient-to-r from-transparent to-white/10" />

            <div className="shrink-0 text-center">
              <p className="text-[7px] font-bold uppercase tracking-[0.22em] text-lime-400/60 sm:text-[10px] sm:tracking-[0.35em]">
                Global Network
              </p>

              <h2 className="mt-1 text-sm font-bold tracking-tight text-white/80 sm:text-xl">
                World Time
              </h2>
            </div>

            <div className="h-px min-w-0 flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>

          <div className="glass-panel min-w-0 overflow-hidden rounded-[24px] p-2.5 transition-all duration-500 hover:border-lime-400/10 sm:rounded-3xl sm:p-6">
            <WorldClocks />
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 w-full max-w-5xl border-t border-white/[0.05] pb-4 pt-6 text-center sm:mt-16 sm:pb-6 sm:pt-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.8)]" />

            <span className="text-[7px] font-bold uppercase tracking-[0.22em] text-white/25 sm:text-[10px] sm:tracking-[0.35em]">
              Spider Clock
            </span>

            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.8)]" />
          </div>

          <p className="mt-3 px-4 text-[9px] text-white/15 sm:text-xs">
            Real-time experience • Global timezone • Interactive themes
          </p>

          <p className="mt-2 text-[7px] uppercase tracking-[0.22em] text-white/10 sm:text-[9px] sm:tracking-[0.35em]">
            Built for the web • 2026
          </p>
        </footer>
      </section>
    </main>
  );
}
