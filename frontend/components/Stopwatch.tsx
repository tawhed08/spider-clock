"use client";

import { useEffect, useState } from "react";

export default function Stopwatch() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) {
      return;
    }

    const interval = setInterval(() => {
      setTime((current) => current + 10);
    }, 10);

    return () => clearInterval(interval);
  }, [running]);

  const reset = () => {
    setRunning(false);
    setTime(0);
  };

  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  const milliseconds = Math.floor((time % 1000) / 10);

  const format = (value: number) => String(value).padStart(2, "0");

  return (
    <section className="relative overflow-hidden rounded-[22px] border border-white/8 bg-white/[0.025] p-5 sm:p-6">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-cyan-400/[0.05] blur-3xl" />

      {/* Header */}
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.06] text-cyan-300">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2.5 2" />
              <path d="M9 3h6" />
              <path d="M12 3v2" />
            </svg>
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-400/55">
              Time Utility
            </p>

            <h2 className="mt-1 text-lg font-bold text-white/90">
              Stopwatch
            </h2>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 rounded-full border border-white/7 bg-white/[0.03] px-3 py-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              running
                ? "animate-pulse bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                : "bg-white/20"
            }`}
          />

          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/30">
            {running ? "Running" : "Paused"}
          </span>
        </div>
      </div>

      {/* Stopwatch display */}
      <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/7 bg-black/10 p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/[0.025] to-transparent" />

        <div className="relative flex flex-col items-center justify-center">
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">
            Elapsed Time
          </span>

          <div className="mt-3 flex items-baseline font-mono tracking-tight">
            <span className="text-4xl font-bold text-white sm:text-5xl">
              {format(minutes)}
            </span>

            <span className="mx-1 text-2xl text-cyan-400/50">
              :
            </span>

            <span className="text-4xl font-bold text-white sm:text-5xl">
              {format(seconds)}
            </span>

            <span className="mx-1 text-xl text-white/20">
              .
            </span>

            <span className="text-xl font-bold text-cyan-300/70 sm:text-2xl">
              {format(milliseconds)}
            </span>
          </div>

          <p className="mt-2 text-[10px] text-white/20">
            MM : SS . MS
          </p>
        </div>
      </div>

      {/* Progress visual */}
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-[0.2em] text-white/20">
            Activity
          </span>

          <span className="font-mono text-[9px] text-white/20">
            {running ? "LIVE" : "IDLE"}
          </span>
        </div>

        <div className="h-1 overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className={`h-full rounded-full bg-cyan-400 transition-all duration-300 ${
              running ? "w-full animate-pulse" : "w-[8%]"
            }`}
            style={{
              boxShadow: "0 0 10px rgba(34, 211, 238, 0.5)",
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="relative mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRunning((current) => !current)}
          className="rounded-xl border border-cyan-400/15 bg-cyan-400/[0.07] px-4 py-3 text-xs font-bold text-cyan-300 transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-400/[0.12] active:scale-[0.98]"
        >
          {running ? "Pause" : time > 0 ? "Resume" : "Start"}
        </button>

        <button
          type="button"
          onClick={reset}
          className="rounded-xl border border-white/8 bg-white/[0.035] px-4 py-3 text-xs font-bold text-white/45 transition-all duration-300 hover:bg-white/[0.07] hover:text-white/70 active:scale-[0.98]"
        >
          Reset
        </button>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
        <span className="text-[9px] uppercase tracking-[0.2em] text-white/20">
          Precision Timer
        </span>

        <span className="font-mono text-[10px] text-cyan-300/30">
          10ms
        </span>
      </div>
    </section>
  );
}