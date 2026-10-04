"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { isShortcutTarget } from "@/lib/keyboard";
import {
  requestNotificationPermission,
  showBrowserNotification,
} from "@/lib/notifications";

interface SoundOption {
  id: string;
  name: string;
  description: string;
}

type TimeoutHandle = ReturnType<typeof setTimeout>;

const SOUND_OPTIONS: SoundOption[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Clean double beep",
  },
  {
    id: "digital",
    name: "Digital",
    description: "Modern digital tone",
  },
  {
    id: "rising",
    name: "Rising",
    description: "Soft rising alert",
  },
  {
    id: "rapid",
    name: "Rapid",
    description: "Fast attention sound",
  },
  {
    id: "soft",
    name: "Soft",
    description: "Gentle reminder",
  },
];

export default function Timer() {
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("05");
  const [seconds, setSeconds] = useState("00");

  const [timeLeft, setTimeLeft] = useState(300000);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  const [selectedSound, setSelectedSound] = useState("classic");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [previewing, setPreviewing] = useState(false);
  const [audioError, setAudioError] = useState("");

  const audioContextRef = useRef<AudioContext | null>(null);
  const soundTimersRef = useRef<Set<TimeoutHandle>>(new Set());
  const previewTimerRef = useRef<TimeoutHandle | null>(null);
  const deadlineRef = useRef<number | null>(null);
  const completionHandledRef = useRef(false);

  const totalInputMilliseconds = useMemo(() => {
    const h = Math.max(0, Math.min(99, Number(hours) || 0));
    const m = Math.max(0, Math.min(59, Number(minutes) || 0));
    const s = Math.max(0, Math.min(59, Number(seconds) || 0));

    return (h * 3600 + m * 60 + s) * 1000;
  }, [hours, minutes, seconds]);

  const createAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;

    if (!audioContextRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      } else {
        setAudioError("Audio playback is not supported by this browser.");
      }
    }

    if (audioContextRef.current?.state === "suspended") {
      void audioContextRef.current.resume().then(
        () => setAudioError(""),
        (error: unknown) => {
          console.error("Unable to resume timer audio:", error);
          setAudioError("Allow audio playback in your browser to hear the timer.");
        },
      );
    }

    return audioContextRef.current;
  }, []);

  const playTone = useCallback(
    (
      frequency: number,
      duration: number,
      type: OscillatorType = "sine",
      volume = 0.08,
    ) => {
      const context = createAudioContext();

      if (!context) {
        return;
      }

      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = type;
      oscillator.frequency.value = frequency;

      gain.gain.setValueAtTime(0.0001, context.currentTime);

      gain.gain.exponentialRampToValueAtTime(
        volume,
        context.currentTime + 0.02,
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        context.currentTime + duration,
      );

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start();
      oscillator.stop(context.currentTime + duration + 0.05);
    },
    [createAudioContext],
  );

  const clearSoundTimers = useCallback(() => {
    soundTimersRef.current.forEach((timer) => {
      clearTimeout(timer);
    });

    soundTimersRef.current.clear();
  }, []);

  const stopSound = useCallback(() => {
    clearSoundTimers();

    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }

    setPreviewing(false);
  }, [clearSoundTimers]);

  const scheduleTone = useCallback(
    (
      delay: number,
      frequency: number,
      duration: number,
      type: OscillatorType,
      volume: number,
    ) => {
      const timer = setTimeout(() => {
        soundTimersRef.current.delete(timer);

        playTone(frequency, duration, type, volume);
      }, delay);

      soundTimersRef.current.add(timer);
    },
    [playTone],
  );

  const playSoundPattern = useCallback(
    (soundId: string) => {
      clearSoundTimers();

      switch (soundId) {
        case "digital":
          playTone(880, 0.16, "square", 0.06);
          scheduleTone(220, 1175, 0.16, "square", 0.06);
          break;

        case "rising":
          playTone(523, 0.2, "sine", 0.07);
          scheduleTone(220, 659, 0.2, "sine", 0.07);
          scheduleTone(440, 784, 0.28, "sine", 0.08);
          break;

        case "rapid":
          playTone(1000, 0.1, "square", 0.07);
          scheduleTone(140, 1000, 0.1, "square", 0.07);
          scheduleTone(280, 1200, 0.16, "square", 0.08);
          break;

        case "soft":
          playTone(523, 0.35, "sine", 0.05);
          scheduleTone(380, 659, 0.45, "sine", 0.05);
          break;

        case "classic":
        default:
          playTone(880, 0.2, "sine", 0.07);
          scheduleTone(280, 660, 0.25, "sine", 0.07);
          break;
      }
    },
    [clearSoundTimers, playTone, scheduleTone],
  );

  const previewSound = useCallback(() => {
    if (previewing) {
      stopSound();
      return;
    }

    stopSound();
    createAudioContext();

    setPreviewing(true);
    playSoundPattern(selectedSound);

    previewTimerRef.current = setTimeout(() => {
      clearSoundTimers();
      previewTimerRef.current = null;
      setPreviewing(false);
    }, 1500);
  }, [
    clearSoundTimers,
    createAudioContext,
    playSoundPattern,
    previewing,
    selectedSound,
    stopSound,
  ]);

  const startTimer = useCallback(() => {
    const duration = timeLeft > 0 ? timeLeft : totalInputMilliseconds;
    if (duration <= 0) return;

    deadlineRef.current = Date.now() + duration;
    completionHandledRef.current = false;
    setTimeLeft(duration);
    setFinished(false);
    setRunning(true);
    createAudioContext();
    void requestNotificationPermission();
  }, [createAudioContext, timeLeft, totalInputMilliseconds]);

  const pauseTimer = useCallback(() => {
    if (deadlineRef.current !== null) {
      setTimeLeft(Math.max(0, deadlineRef.current - Date.now()));
      deadlineRef.current = null;
    }
    setRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    deadlineRef.current = null;
    completionHandledRef.current = false;
    setRunning(false);
    setFinished(false);
    stopSound();
    setTimeLeft(totalInputMilliseconds);
  }, [stopSound, totalInputMilliseconds]);

  const toggleTimer = useCallback(() => {
    if (running) {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [pauseTimer, running, startTimer]);

  useEffect(() => {
    if (!running || deadlineRef.current === null) return;

    const updateRemaining = () => {
      const remaining = Math.max(
        0,
        (deadlineRef.current ?? Date.now()) - Date.now(),
      );
      setTimeLeft(remaining);

      if (remaining === 0 && !completionHandledRef.current) {
        completionHandledRef.current = true;
        deadlineRef.current = null;
        setRunning(false);
        setFinished(true);
        if (soundEnabled) playSoundPattern(selectedSound);
        if (document.visibilityState === "hidden") {
          showBrowserNotification(
            "Timer complete",
            "Your Spider Clock timer has finished.",
          );
        }
      }
    };

    const timeout = setTimeout(
      updateRemaining,
      Math.max(0, deadlineRef.current - Date.now()),
    );
    const interval = setInterval(updateRemaining, 50);
    document.addEventListener("visibilitychange", updateRemaining);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", updateRemaining);
    };
  }, [playSoundPattern, running, selectedSound, soundEnabled]);

  useEffect(() => {
    return () => {
      clearSoundTimers();
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      if (audioContextRef.current) void audioContextRef.current.close();
    };
  }, [clearSoundTimers]);

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
      toggleTimer();
    } else if (event.key.toLowerCase() === "r") {
      resetTimer();
    }
  };

  const setPreset = (durationMinutes: number) => {
    const newMinutes = String(durationMinutes).padStart(2, "0");
    setHours("00");
    setMinutes(newMinutes);
    setSeconds("00");
    setTimeLeft(durationMinutes * 60_000);
    setFinished(false);
    deadlineRef.current = null;
    completionHandledRef.current = false;
  };

  const displayHours = Math.floor(timeLeft / 3600000);
  const displayMinutes = Math.floor((timeLeft % 3600000) / 60000);
  const displaySeconds = Math.floor((timeLeft % 60000) / 1000);
  const displayMilliseconds = Math.floor((timeLeft % 1000) / 10);

  const format = (value: number) => String(value).padStart(2, "0");

  const progress =
    totalInputMilliseconds > 0
      ? Math.max(
          0,
          Math.min(
            100,
            ((totalInputMilliseconds - timeLeft) /
              totalInputMilliseconds) *
              100,
          ),
        )
      : 0;

  const status = finished
    ? "Finished"
    : running
      ? "Running"
      : timeLeft < totalInputMilliseconds
        ? "Paused"
        : "Ready";

  return (
    <section
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Timer. Focus this panel to use Space to start or pause and R to reset."
      className="relative overflow-hidden rounded-[22px] border border-white/8 bg-white/[0.025] p-5 outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 sm:p-6"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-violet-400/[0.06] blur-3xl" />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/10 bg-violet-400/[0.06] text-violet-300">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 7v5l3 2" />
              <path d="M9 2h6" />
              <path d="M12 2v2" />
            </svg>
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-violet-400/55">
              Time Utility
            </p>

            <h2 className="mt-1 text-lg font-bold text-white/90">
              Timer
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/7 bg-white/[0.03] px-3 py-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              running
                ? "animate-pulse bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]"
                : finished
                  ? "animate-pulse bg-amber-400"
                  : "bg-white/20"
            }`}
          />

          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/30">
            {status}
          </span>
        </div>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/7 bg-black/10 p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-400/[0.025] to-transparent" />

        <div className="relative flex flex-col items-center justify-center">
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">
            Time Remaining
          </span>

          <div className="mt-3 flex items-baseline font-mono tracking-tight">
            <span className="text-3xl font-bold text-white sm:text-5xl">
              {format(displayHours)}
            </span>

            <span className="mx-1 text-xl text-violet-400/50 sm:text-2xl">
              :
            </span>

            <span className="text-3xl font-bold text-white sm:text-5xl">
              {format(displayMinutes)}
            </span>

            <span className="mx-1 text-xl text-violet-400/50 sm:text-2xl">
              :
            </span>

            <span className="text-3xl font-bold text-white sm:text-5xl">
              {format(displaySeconds)}
            </span>

            <span className="mx-1 text-lg text-white/20">.</span>

            <span className="text-lg font-bold text-violet-300/70 sm:text-2xl">
              {format(displayMilliseconds)}
            </span>
          </div>

          <p className="mt-2 text-[10px] text-white/20">
            HH : MM : SS . MS
          </p>
        </div>
      </div>

      <div className="relative mt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-[0.2em] text-white/20">
            Progress
          </span>

          <span className="font-mono text-[9px] text-violet-300/40">
            {Math.round(progress)}%
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full bg-violet-400 transition-all duration-300"
            style={{
              width: `${progress}%`,
              boxShadow: "0 0 10px rgba(167,139,250,0.55)",
            }}
          />
        </div>
      </div>

      {!running && !finished && (
        <div className="relative mt-5 grid grid-cols-3 gap-2">
          <div>
            <label
              htmlFor="timer-hours"
              className="mb-2 block text-center text-[8px] font-bold uppercase tracking-[0.2em] text-white/20"
            >
              Hours
            </label>

            <input
              id="timer-hours"
              type="number"
              min="0"
              max="99"
              value={hours}
              onChange={(event) => {
                const value = Math.min(
                  99,
                  Math.max(0, Number(event.target.value) || 0),
                );

                const formatted = String(value).padStart(2, "0");

                setHours(formatted);
                setTimeLeft(
                  (value * 3600 +
                    Number(minutes) * 60 +
                    Number(seconds)) *
                    1000,
                );
              }}
              className="w-full rounded-xl border border-white/8 bg-white/[0.035] px-3 py-3 text-center font-mono text-sm font-bold text-white outline-none transition focus:border-violet-400/30 focus:bg-white/[0.06]"
            />
          </div>

          <div>
            <label
              htmlFor="timer-minutes"
              className="mb-2 block text-center text-[8px] font-bold uppercase tracking-[0.2em] text-white/20"
            >
              Minutes
            </label>

            <input
              id="timer-minutes"
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(event) => {
                const value = Math.min(
                  59,
                  Math.max(0, Number(event.target.value) || 0),
                );

                const formatted = String(value).padStart(2, "0");

                setMinutes(formatted);
                setTimeLeft(
                  (Number(hours) * 3600 +
                    value * 60 +
                    Number(seconds)) *
                    1000,
                );
              }}
              className="w-full rounded-xl border border-white/8 bg-white/[0.035] px-3 py-3 text-center font-mono text-sm font-bold text-white outline-none transition focus:border-violet-400/30 focus:bg-white/[0.06]"
            />
          </div>

          <div>
            <label
              htmlFor="timer-seconds"
              className="mb-2 block text-center text-[8px] font-bold uppercase tracking-[0.2em] text-white/20"
            >
              Seconds
            </label>

            <input
              id="timer-seconds"
              type="number"
              min="0"
              max="59"
              value={seconds}
              onChange={(event) => {
                const value = Math.min(
                  59,
                  Math.max(0, Number(event.target.value) || 0),
                );

                const formatted = String(value).padStart(2, "0");

                setSeconds(formatted);
                setTimeLeft(
                  (Number(hours) * 3600 +
                    Number(minutes) * 60 +
                    value) *
                    1000,
                );
              }}
              className="w-full rounded-xl border border-white/8 bg-white/[0.035] px-3 py-3 text-center font-mono text-sm font-bold text-white outline-none transition focus:border-violet-400/30 focus:bg-white/[0.06]"
            />
          </div>
        </div>
      )}

      <div className="mt-4">
        <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">
          Quick Presets
        </p>
        <div className="grid grid-cols-4 gap-2">
          {[1, 5, 10, 25].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setPreset(preset)}
              disabled={running}
              aria-label={`Set timer for ${preset} minute${preset === 1 ? "" : "s"}`}
              className="rounded-xl border border-violet-400/10 bg-violet-400/[0.04] px-2 py-2.5 text-xs font-bold text-violet-200/70 transition hover:border-violet-400/25 hover:bg-violet-400/[0.09] disabled:cursor-not-allowed disabled:opacity-35"
            >
              {preset}m
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-5 rounded-xl border border-white/7 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">
              Completion Sound
            </p>

            <p className="mt-1 text-xs text-white/45">
              {SOUND_OPTIONS.find(
                (sound) => sound.id === selectedSound,
              )?.description || "Timer alert"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled((current) => !current)}
            aria-label={soundEnabled ? "Turn timer sound off" : "Turn timer sound on"}
            className={`rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] transition ${
              soundEnabled
                ? "border-violet-400/20 bg-violet-400/[0.08] text-violet-300"
                : "border-white/8 bg-white/[0.03] text-white/30"
            }`}
          >
            {soundEnabled ? "Sound On" : "Sound Off"}
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          <select
            aria-label="Timer completion sound"
            value={selectedSound}
            onChange={(event) => {
              setSelectedSound(event.target.value);
              stopSound();
            }}
            className="min-w-0 flex-1 rounded-xl border border-white/8 bg-black/20 px-3 py-3 text-xs font-semibold text-white/70 outline-none focus:border-violet-400/30"
          >
            {SOUND_OPTIONS.map((sound) => (
              <option
                key={sound.id}
                value={sound.id}
                className="bg-neutral-900"
              >
                {sound.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={previewSound}
            aria-label={previewing ? "Stop timer sound preview" : "Preview timer sound"}
            className="rounded-xl border border-white/8 bg-white/[0.035] px-4 py-3 text-xs font-bold text-white/50 transition hover:bg-white/[0.07] hover:text-white/80 active:scale-[0.98]"
          >
            {previewing ? "Stop" : "Preview"}
          </button>
        </div>
        {audioError && (
          <p role="status" className="mt-2 text-[10px] text-amber-200/70">
            {audioError}
          </p>
        )}
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={toggleTimer}
          className="rounded-xl border border-violet-400/15 bg-violet-400/[0.07] px-4 py-3 text-xs font-bold text-violet-300 transition-all duration-300 hover:border-violet-400/30 hover:bg-violet-400/[0.12] active:scale-[0.98]"
        >
          {running
            ? "Pause"
            : timeLeft < totalInputMilliseconds
              ? "Resume"
              : "Start"}
        </button>

        <button
          type="button"
          onClick={resetTimer}
          className="rounded-xl border border-white/8 bg-white/[0.035] px-4 py-3 text-xs font-bold text-white/45 transition-all duration-300 hover:bg-white/[0.07] hover:text-white/70 active:scale-[0.98]"
        >
          Reset
        </button>
      </div>

      {finished && (
        <div className="relative mt-4 rounded-xl border border-amber-400/15 bg-amber-400/[0.05] px-4 py-3 text-center">
          <p className="text-xs font-bold text-amber-300">
            Timer Complete
          </p>

          <p className="mt-1 text-[10px] text-amber-200/40">
            Your selected completion sound has played.
          </p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
        <div className="flex items-center gap-3">
          <span className="text-[9px] uppercase tracking-[0.2em] text-white/20">
            Shortcuts
          </span>

          <span className="rounded-md border border-white/8 bg-white/[0.03] px-2 py-1 font-mono text-[9px] text-white/30">
            Space
          </span>

          <span className="rounded-md border border-white/8 bg-white/[0.03] px-2 py-1 font-mono text-[9px] text-white/30">
            R
          </span>
        </div>

        <span className="font-mono text-[10px] text-violet-300/30">
          50ms
        </span>
      </div>
    </section>
  );
}