
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { isShortcutTarget } from "@/lib/keyboard";

interface Lap {
  id: number;
  total: number;
  split: number;
}

export default function Stopwatch() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const elapsedRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) {
      return;
    }

    const updateElapsed = () => {
      if (startedAtRef.current !== null) {
        setTime(elapsedRef.current + performance.now() - startedAtRef.current);
      }
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 25);
    document.addEventListener("visibilitychange", updateElapsed);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", updateElapsed);
    };
  }, [running]);

  const start = useCallback(() => {
    startedAtRef.current = performance.now();
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    if (startedAtRef.current !== null) {
      elapsedRef.current += performance.now() - startedAtRef.current;
      startedAtRef.current = null;
      setTime(elapsedRef.current);
    }
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    startedAtRef.current = null;
    elapsedRef.current = 0;
    setRunning(false);
    setTime(0);
    setLaps([]);
  }, []);

  const addLap = useCallback(() => {
    if (!running || startedAtRef.current === null) return;

    const lapTime =
      elapsedRef.current + performance.now() - startedAtRef.current;
    if (lapTime === 0) return;
    setTime(lapTime);
    setLaps((currentLaps) => {
      const previousTotal =
        currentLaps.length > 0
          ? currentLaps[currentLaps.length - 1].total
          : 0;

      return [
        ...currentLaps,
        {
          id: lapTime,
          total: lapTime,
          split: lapTime - previousTotal,
        },
      ];
    });
  }, [running]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (
      !isShortcutTarget(event.target) ||
      event.repeat ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    ) {
      return;
    }

    if (event.code === "Space") {
    event.preventDefault();
    if (running) pause();
    else start();
    } else if (event.key.toLowerCase() === "r") {
    reset();
    } else if (event.key.toLowerCase() === "l") {
    addLap();
    }
  };

  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  const milliseconds = Math.floor((time % 1000) / 10);

  const format = (value: number) => String(value).padStart(2, "0");

  const formatTime = (value: number) => {
    const mins = Math.floor(value / 60000);
    const secs = Math.floor((value % 60000) / 1000);
    const ms = Math.floor((value % 1000) / 10);

    return `${format(mins)}:${format(secs)}.${format(ms)}`;
  };

  const fastestLap = useMemo(() => {
    if (laps.length === 0) {
      return null;
    }

    return Math.min(...laps.map((lap) => lap.split));
  }, [laps]);

  const slowestLap = useMemo(() => {
    if (laps.length === 0) {
      return null;
    }

    return Math.max(...laps.map((lap) => lap.split));
  }, [laps]);

  return (
    <section
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Stopwatch. Focus this panel to use Space to start or pause, L to record a lap, and R to reset."
      className="relative overflow-hidden rounded-[22px] border border-white/8 bg-white/[0.025] p-5 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 sm:p-6"
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-cyan-400/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-48 w-48 rounded-full bg-blue-500/[0.04] blur-3xl" />

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
            {running ? "Running" : time > 0 ? "Paused" : "Ready"}
          </span>
        </div>
      </div>

      {/* Main display */}
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

            <span className="mx-1 text-2xl text-cyan-400/50">:</span>

            <span className="text-4xl font-bold text-white sm:text-5xl">
              {format(seconds)}
            </span>

            <span className="mx-1 text-xl text-white/20">.</span>

            <span className="text-xl font-bold text-cyan-300/70 sm:text-2xl">
              {format(milliseconds)}
            </span>
          </div>

          <p className="mt-2 text-[10px] text-white/20">MM : SS . MS</p>
        </div>
      </div>

      {/* Activity */}
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

      {/* Main actions */}
      <div className="relative mt-5 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={running ? pause : start}
          className="rounded-xl border border-cyan-400/15 bg-cyan-400/[0.07] px-3 py-3 text-xs font-bold text-cyan-300 transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-400/[0.12] active:scale-[0.98]"
        >
          {running ? "Pause" : time > 0 ? "Resume" : "Start"}
        </button>

        <button
          type="button"
          onClick={addLap}
          disabled={!running || time === 0}
          className="rounded-xl border border-white/8 bg-white/[0.035] px-3 py-3 text-xs font-bold text-white/50 transition-all duration-300 hover:bg-white/[0.07] hover:text-white/80 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Lap
        </button>

        <button
          type="button"
          onClick={reset}
          className="rounded-xl border border-white/8 bg-white/[0.035] px-3 py-3 text-xs font-bold text-white/45 transition-all duration-300 hover:bg-white/[0.07] hover:text-white/70 active:scale-[0.98]"
        >
          Reset
        </button>
      </div>

      {/* Keyboard shortcuts */}
      <div className="mt-4 flex items-center justify-center gap-3 text-[9px] text-white/20">
        <span>
          <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono">
            SPACE
          </kbd>{" "}
          Start/Pause
        </span>

        <span>
          <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono">
            L
          </kbd>{" "}
          Lap
        </span>

        <span>
          <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono">
            R
          </kbd>{" "}
          Reset
        </span>
      </div>

      {/* Lap history */}
      {laps.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-white/7 bg-black/10">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/25">
                Lap History
              </p>

              <p className="mt-1 text-[10px] text-white/15">
                {laps.length} {laps.length === 1 ? "lap" : "laps"} recorded
              </p>
            </div>

            <button
              type="button"
              onClick={() => setLaps([])}
              aria-label="Clear stopwatch laps"
              className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/25 transition-colors hover:text-cyan-300"
            >
              Clear
            </button>
          </div>

          <div className="max-h-52 overflow-y-auto">
            {[...laps].reverse().map((lap, index) => {
              const lapNumber = laps.length - index;
              const isFastest = lap.split === fastestLap;
              const isSlowest =
                lap.split === slowestLap && laps.length > 1;

              return (
                <div
                  key={lap.id}
                  className="flex items-center justify-between border-b border-white/[0.035] px-4 py-3 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] font-mono text-[9px] text-white/35">
                      {String(lapNumber).padStart(2, "0")}
                    </span>

                    <div>
                      <p className="font-mono text-xs text-white/65">
                        {formatTime(lap.split)}
                      </p>

                      <p className="mt-0.5 text-[8px] uppercase tracking-[0.15em] text-white/15">
                        Split
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-mono text-[10px] text-white/25">
                      {formatTime(lap.total)}
                    </p>

                    {isFastest && (
                      <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-cyan-300/60">
                        Fastest
                      </span>
                    )}

                    {isSlowest && !isFastest && (
                      <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-white/25">
                        Slowest
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats */}
      {laps.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/6 bg-white/[0.025] p-3">
            <p className="text-[8px] uppercase tracking-[0.18em] text-white/20">
              Fastest Lap
            </p>

            <p className="mt-1 font-mono text-sm text-cyan-300/60">
              {fastestLap !== null ? formatTime(fastestLap) : "--"}
            </p>
          </div>

          <div className="rounded-xl border border-white/6 bg-white/[0.025] p-3">
            <p className="text-[8px] uppercase tracking-[0.18em] text-white/20">
              Slowest Lap
            </p>

            <p className="mt-1 font-mono text-sm text-white/35">
              {slowestLap !== null ? formatTime(slowestLap) : "--"}
            </p>
          </div>
        </div>
      )}

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
