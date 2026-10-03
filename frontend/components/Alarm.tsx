"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface AlarmProps {
  timezone: string;
}

interface SoundOption {
  id: string;
  name: string;
  description: string;
}

interface AlarmHistoryItem {
  id: number;
  time: string;
  label: string;
  sound: string;
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

export default function Alarm({ timezone }: AlarmProps) {
  const [alarmTime, setAlarmTime] = useState("");
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [ringing, setRinging] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [selectedSound, setSelectedSound] = useState("classic");
  const [previewing, setPreviewing] = useState(false);
  const [history, setHistory] = useState<AlarmHistoryItem[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const soundTimersRef = useRef<Set<TimeoutHandle>>(new Set());
  const previewTimerRef = useRef<TimeoutHandle | null>(null);
  const alarmLoopRef = useRef<TimeoutHandle | null>(null);

  const selectedSoundInfo = useMemo(
    () =>
      SOUND_OPTIONS.find((sound) => sound.id === selectedSound) ??
      SOUND_OPTIONS[0],
    [selectedSound],
  );

  const createAudioContext = useCallback(() => {
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
      }
    }

    if (audioContextRef.current?.state === "suspended") {
      void audioContextRef.current.resume();
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

    if (alarmLoopRef.current) {
      clearTimeout(alarmLoopRef.current);
      alarmLoopRef.current = null;
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

  const playAlarmPattern = useCallback(
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

  const startAlarmSound = useCallback(() => {
    stopSound();

    const loop = () => {
      playAlarmPattern(selectedSound);

      alarmLoopRef.current = setTimeout(loop, 1700);
    };

    loop();
  }, [playAlarmPattern, selectedSound, stopSound]);

  const previewSound = useCallback(() => {
    if (previewing) {
      stopSound();
      return;
    }

    stopSound();
    createAudioContext();

    setPreviewing(true);
    playAlarmPattern(selectedSound);

    previewTimerRef.current = setTimeout(() => {
      clearSoundTimers();
      previewTimerRef.current = null;
      setPreviewing(false);
    }, 1500);
  }, [
    clearSoundTimers,
    createAudioContext,
    playAlarmPattern,
    previewing,
    selectedSound,
    stopSound,
  ]);

  const saveAlarm = useCallback(() => {
    if (!alarmTime) {
      return;
    }

    stopSound();
    createAudioContext();

    setEnabled(true);
    setRinging(false);

    const newHistoryItem: AlarmHistoryItem = {
      id: Date.now(),
      time: alarmTime,
      label: label.trim() || "Spider Alarm",
      sound: selectedSound,
    };

    setHistory((current) => {
      const filtered = current.filter(
        (item) =>
          !(
            item.time === alarmTime &&
            item.label === newHistoryItem.label &&
            item.sound === selectedSound
          ),
      );

      return [newHistoryItem, ...filtered].slice(0, 8);
    });
  }, [
    alarmTime,
    createAudioContext,
    label,
    selectedSound,
    stopSound,
  ]);

  const dismissAlarm = useCallback(() => {
    setRinging(false);
    setEnabled(false);
    stopSound();
  }, [stopSound]);

  const clearAlarm = useCallback(() => {
    stopSound();

    setAlarmTime("");
    setLabel("");
    setEnabled(false);
    setRinging(false);
  }, [stopSound]);

  const toggleAlarm = useCallback(() => {
    createAudioContext();

    setEnabled((current) => !current);
    setRinging(false);

    stopSound();
  }, [createAudioContext, stopSound]);

  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();

      const formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      setCurrentTime(formatter.format(now));
    };

    updateCurrentTime();

    const interval = setInterval(updateCurrentTime, 1000);

    return () => clearInterval(interval);
  }, [timezone]);

  useEffect(() => {
    if (!enabled || ringing || !alarmTime) {
      return;
    }

    const checkAlarm = () => {
      const now = new Date();

      const formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const time = formatter.format(now);

      if (time === alarmTime) {
        setRinging(true);
        setEnabled(false);
        startAlarmSound();
      }
    };

    checkAlarm();

    const interval = setInterval(checkAlarm, 1000);

    return () => clearInterval(interval);
  }, [
    alarmTime,
    enabled,
    ringing,
    startAlarmSound,
    timezone,
  ]);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();

        if (alarmTime) {
          toggleAlarm();
        }
      }

      if (event.key === "Escape") {
        dismissAlarm();
      }

      if (event.key.toLowerCase() === "c") {
        clearAlarm();
      }
    };

    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [alarmTime, clearAlarm, dismissAlarm, toggleAlarm]);

  useEffect(() => {
    return () => {
      clearSoundTimers();

      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
      }

      if (alarmLoopRef.current) {
        clearTimeout(alarmLoopRef.current);
      }

      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    };
  }, [clearSoundTimers]);

  return (
    <section className="relative overflow-hidden rounded-[22px] border border-white/8 bg-white/[0.025] p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-amber-400/[0.06] blur-3xl" />

      {/* Header */}
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/10 bg-amber-400/[0.06] text-amber-300">
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
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-amber-400/55">
              Time Utility
            </p>

            <h2 className="mt-1 text-lg font-bold text-white/90">
              Alarm
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/7 bg-white/[0.03] px-3 py-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              ringing
                ? "animate-pulse bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]"
                : enabled
                  ? "animate-pulse bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                  : "bg-white/20"
            }`}
          />

          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/30">
            {ringing ? "Ringing" : enabled ? "Armed" : "Ready"}
          </span>
        </div>
      </div>

      {/* Current time */}
      <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/7 bg-black/10 p-5">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/[0.025] to-transparent" />

        <div className="relative text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">
            Current Time
          </p>

          <div className="mt-3 font-mono text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {currentTime}
          </div>

          <p className="mt-2 text-[9px] text-white/20">
            {timezone}
          </p>
        </div>
      </div>

      {/* Set alarm */}
      <div className="relative mt-5">
        <div className="mb-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/25">
            Set Alarm
          </p>

          <p className="mt-1 text-[10px] text-white/15">
            Choose a time and customize your alert.
          </p>
        </div>

        <div className="rounded-2xl border border-white/7 bg-white/[0.02] p-4">
          <label
            htmlFor="alarm-time"
            className="mb-2 block text-[8px] font-bold uppercase tracking-[0.2em] text-white/20"
          >
            Alarm Time
          </label>

          <input
            id="alarm-time"
            type="time"
            step="60"
            value={alarmTime}
            onChange={(event) => {
              setAlarmTime(event.target.value);
              setRinging(false);
              stopSound();
            }}
            className="w-full rounded-xl border border-white/8 bg-white/[0.035] px-4 py-3 font-mono text-lg font-bold text-white outline-none transition focus:border-amber-400/30 focus:bg-white/[0.06]"
          />

          <label
            htmlFor="alarm-label"
            className="mt-4 mb-2 block text-[8px] font-bold uppercase tracking-[0.2em] text-white/20"
          >
            Label
          </label>

          <input
            id="alarm-label"
            type="text"
            value={label}
            maxLength={40}
            placeholder="Spider Alarm"
            onChange={(event) => setLabel(event.target.value)}
            className="w-full rounded-xl border border-white/8 bg-white/[0.035] px-4 py-3 text-xs font-semibold text-white/70 outline-none transition placeholder:text-white/15 focus:border-amber-400/30 focus:bg-white/[0.06]"
          />

          <div className="mt-4">
            <label
              htmlFor="alarm-sound"
              className="mb-2 block text-[8px] font-bold uppercase tracking-[0.2em] text-white/20"
            >
              Alarm Sound
            </label>

            <div className="flex gap-2">
              <select
                id="alarm-sound"
                value={selectedSound}
                onChange={(event) => {
                  setSelectedSound(event.target.value);
                  stopSound();
                }}
                className="min-w-0 flex-1 rounded-xl border border-white/8 bg-black/20 px-3 py-3 text-xs font-semibold text-white/70 outline-none focus:border-amber-400/30"
              >
                {SOUND_OPTIONS.map((sound) => (
                  <option
                    key={sound.id}
                    value={sound.id}
                    className="bg-slate-900 text-white"
                  >
                    {sound.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={previewSound}
                className="shrink-0 rounded-xl border border-cyan-400/10 bg-cyan-400/[0.05] px-4 py-3 text-[10px] font-bold text-cyan-300/70 transition-all hover:border-cyan-400/25 hover:bg-cyan-400/[0.09] hover:text-cyan-300 active:scale-[0.97]"
              >
                {previewing ? "Stop" : "Preview"}
              </button>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-cyan-400/50" />

              <p className="text-[9px] text-white/20">
                {selectedSoundInfo.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={saveAlarm}
            disabled={!alarmTime}
            className="mt-4 w-full rounded-xl border border-amber-400/15 bg-amber-400/[0.07] px-4 py-3 text-xs font-bold text-amber-300 transition-all duration-300 hover:border-amber-400/30 hover:bg-amber-400/[0.12] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-30"
          >
            {enabled ? "Update Alarm" : "Arm Alarm"}
          </button>
        </div>
      </div>

      {/* Active alarm */}
      {alarmTime && (
        <div
          className={`mt-4 overflow-hidden rounded-2xl border p-4 transition-all ${
            ringing
              ? "border-red-400/30 bg-red-400/[0.07]"
              : enabled
                ? "border-amber-400/15 bg-amber-400/[0.035]"
                : "border-white/7 bg-white/[0.02]"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  ringing
                    ? "bg-red-400/[0.12] text-red-300"
                    : enabled
                      ? "bg-amber-400/[0.08] text-amber-300"
                      : "bg-white/[0.04] text-white/30"
                }`}
              >
                <svg
                  className={`h-4 w-4 ${ringing ? "animate-bounce" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white/65">
                  {label || "Spider Alarm"}
                </p>

                <div className="mt-0.5 flex items-center gap-2">
                  <span className="font-mono text-[10px] text-white/25">
                    {alarmTime}
                  </span>

                  <span className="text-white/10">•</span>

                  <span className="truncate text-[9px] text-cyan-300/35">
                    {selectedSoundInfo.name}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleAlarm}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-all ${
                enabled ? "bg-amber-400/30" : "bg-white/[0.08]"
              }`}
              aria-label={enabled ? "Disable alarm" : "Enable alarm"}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full transition-all ${
                  enabled
                    ? "left-6 bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                    : "left-1 bg-white/25"
                }`}
              />
            </button>
          </div>

          {/* Ringing */}
          {ringing && (
            <div className="mt-4 border-t border-red-400/10 pt-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-red-300/70">
                    Alarm is ringing
                  </p>

                  <p className="mt-1 text-[9px] text-white/20">
                    Sound: {selectedSoundInfo.name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={stopSound}
                  className="rounded-lg border border-white/8 bg-white/[0.035] px-3 py-2 text-[9px] font-bold text-white/35 transition-all hover:bg-white/[0.07] hover:text-white/60"
                >
                  Stop Sound
                </button>
              </div>

              <button
                type="button"
                onClick={dismissAlarm}
                className="mt-3 w-full rounded-xl border border-red-400/20 bg-red-400/[0.08] px-4 py-3 text-xs font-bold text-red-300 transition-all hover:bg-red-400/[0.13] active:scale-[0.98]"
              >
                Dismiss Alarm
              </button>
            </div>
          )}

          {/* Normal actions */}
          {!ringing && (
            <div className="mt-4 flex gap-2 border-t border-white/5 pt-4">
              <button
                type="button"
                onClick={toggleAlarm}
                className="flex-1 rounded-xl border border-white/7 bg-white/[0.035] px-3 py-2.5 text-[10px] font-bold text-white/40 transition-all hover:bg-white/[0.06] hover:text-white/65"
              >
                {enabled ? "Pause Alarm" : "Enable Alarm"}
              </button>

              <button
                type="button"
                onClick={clearAlarm}
                className="rounded-xl border border-white/7 bg-white/[0.025] px-3 py-2.5 text-[10px] font-bold text-white/25 transition-all hover:bg-white/[0.06] hover:text-white/50"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Alarm history */}
      {history.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/7 bg-black/10">
          <div className="border-b border-white/5 px-4 py-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/25">
              Recent Alarms
            </p>

            <p className="mt-1 text-[10px] text-white/15">
              Saved alarm presets
            </p>
          </div>

          <div className="max-h-44 overflow-y-auto">
            {history.map((item, index) => {
              const sound = SOUND_OPTIONS.find(
                (option) => option.id === item.sound,
              );

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setAlarmTime(item.time);
                    setLabel(item.label);
                    setSelectedSound(item.sound);
                    setEnabled(true);
                    setRinging(false);
                    stopSound();
                  }}
                  className="flex w-full items-center justify-between gap-3 border-b border-white/[0.035] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-white/[0.025]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] font-mono text-[9px] text-white/30">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-semibold text-white/45">
                        {item.label}
                      </p>

                      <p className="mt-0.5 truncate text-[8px] text-white/15">
                        {sound?.name ?? "Classic"}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 font-mono text-xs text-amber-300/45">
                    {item.time}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Keyboard shortcuts */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[9px] text-white/20">
        <span>
          <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono">
            SPACE
          </kbd>{" "}
          Enable
        </span>

        <span>
          <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono">
            ESC
          </kbd>{" "}
          Dismiss
        </span>

        <span>
          <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono">
            C
          </kbd>{" "}
          Clear
        </span>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
        <span className="text-[9px] uppercase tracking-[0.2em] text-white/20">
          Smart Alarm
        </span>

        <span className="font-mono text-[10px] text-amber-300/30">
          {timezone}
        </span>
      </div>
    </section>
  );
}