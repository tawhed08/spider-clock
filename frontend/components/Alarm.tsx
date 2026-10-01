"use client";

import { useEffect, useState } from "react";

export default function Alarm() {
  const [alarmTime, setAlarmTime] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [ringing, setRinging] = useState(false);

  useEffect(() => {
    if (!enabled || !alarmTime) {
      return;
    }

    const checkAlarm = () => {
      const now = new Date();

      const currentTime = `${String(now.getHours()).padStart(
        2,
        "0"
      )}:${String(now.getMinutes()).padStart(2, "0")}`;

      if (currentTime === alarmTime) {
        setRinging(true);
        setEnabled(false);
      }
    };

    checkAlarm();

    const interval = setInterval(checkAlarm, 1000);

    return () => clearInterval(interval);
  }, [alarmTime, enabled]);

  const handleSetAlarm = () => {
    if (!alarmTime) {
      return;
    }

    setRinging(false);
    setEnabled(true);
  };

  const handleClearAlarm = () => {
    setAlarmTime("");
    setEnabled(false);
    setRinging(false);
  };

  return (
    <section className="relative overflow-hidden rounded-[22px] border border-white/8 bg-white/[0.025] p-5 sm:p-6">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-lime-400/[0.06] blur-3xl" />

      {/* Header */}
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-lime-400/10 bg-lime-400/[0.06] text-lime-300">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-lime-400/55">
              Time Utility
            </p>

            <h2 className="mt-1 text-lg font-bold text-white/90">
              Alarm
            </h2>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 rounded-full border border-white/7 bg-white/[0.03] px-3 py-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              ringing
                ? "animate-ping bg-red-400"
                : enabled
                  ? "bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.8)]"
                  : "bg-white/20"
            }`}
          />

          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/30">
            {ringing ? "Ringing" : enabled ? "Active" : "Standby"}
          </span>
        </div>
      </div>

      {/* Alarm display */}
      <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/7 bg-black/10 p-5">
        <div className="absolute inset-0 bg-gradient-to-br from-lime-400/[0.025] to-transparent" />

        <div className="relative flex flex-col items-center justify-center">
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">
            Alarm Time
          </span>

          <input
            type="time"
            value={alarmTime}
            onChange={(event) => {
              setAlarmTime(event.target.value);
              setRinging(false);
            }}
            className="mt-2 w-full cursor-pointer bg-transparent text-center font-mono text-4xl font-bold tracking-wider text-white outline-none [color-scheme:dark] sm:text-5xl"
          />

          <p className="mt-2 text-[10px] text-white/20">
            Set your reminder time
          </p>
        </div>
      </div>

      {/* Ringing alert */}
      {ringing && (
        <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="h-2 w-2 animate-ping rounded-full bg-red-400" />

            <span className="text-xs font-bold uppercase tracking-[0.2em] text-red-300">
              Alarm ringing
            </span>
          </div>

          <button
            type="button"
            onClick={() => setRinging(false)}
            className="mt-3 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-xs font-bold text-red-200 transition hover:bg-red-400/15"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="relative mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleSetAlarm}
          disabled={!alarmTime}
          className="rounded-xl border border-lime-400/15 bg-lime-400/[0.07] px-4 py-3 text-xs font-bold text-lime-300 transition-all duration-300 hover:border-lime-400/30 hover:bg-lime-400/[0.12] disabled:cursor-not-allowed disabled:opacity-30"
        >
          {enabled ? "Update Alarm" : "Set Alarm"}
        </button>

        <button
          type="button"
          onClick={handleClearAlarm}
          className="rounded-xl border border-white/8 bg-white/[0.035] px-4 py-3 text-xs font-bold text-white/45 transition-all duration-300 hover:bg-white/[0.07] hover:text-white/70"
        >
          Clear
        </button>
      </div>

      {/* Footer status */}
      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
        <span className="text-[9px] uppercase tracking-[0.2em] text-white/20">
          Monitoring
        </span>

        <span className="font-mono text-[10px] text-white/25">
          {enabled && alarmTime ? alarmTime : "--:--"}
        </span>
      </div>
    </section>
  );
}