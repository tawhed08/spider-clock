
"use client";

import { useEffect, useState } from "react";

interface SpiderClockProps {
  timezone: string;
  theme: string;
}

interface ClockTime {
  hours: number;
  minutes: number;
  seconds: number;
}

interface ThemeConfig {
  face: string;
  faceSecondary: string;
  border: string;
  number: string;
  tick: string;
  web: string;
  spider: string;
  hand: string;
  secondHand: string;
  accent: string;
  glow: string;
}

const themes: Record<string, ThemeConfig> = {
  spider: {
    face: "#f8fafc",
    faceSecondary: "#ffffff",
    border: "#a3e635",
    number: "#111827",
    tick: "#374151",
    web: "#64748b",
    spider: "#111827",
    hand: "#111827",
    secondHand: "#ef4444",
    accent: "#84cc16",
    glow: "rgba(163, 230, 53, 0.18)",
  },
  neon: {
    face: "#07140c",
    faceSecondary: "#0b1f12",
    border: "#84cc16",
    number: "#d9f99d",
    tick: "#86efac",
    web: "#4ade80",
    spider: "#f0fdf4",
    hand: "#f0fdf4",
    secondHand: "#bef264",
    accent: "#a3e635",
    glow: "rgba(74, 222, 128, 0.25)",
  },
  red: {
    face: "#190708",
    faceSecondary: "#280b0d",
    border: "#ef4444",
    number: "#fecaca",
    tick: "#f87171",
    web: "#fb7185",
    spider: "#fff1f2",
    hand: "#fff1f2",
    secondHand: "#fca5a5",
    accent: "#ef4444",
    glow: "rgba(239, 68, 68, 0.25)",
  },
  cyber: {
    face: "#050b1c",
    faceSecondary: "#09142d",
    border: "#22d3ee",
    number: "#cffafe",
    tick: "#67e8f9",
    web: "#38bdf8",
    spider: "#e0f2fe",
    hand: "#e0f2fe",
    secondHand: "#22d3ee",
    accent: "#22d3ee",
    glow: "rgba(34, 211, 238, 0.25)",
  },
  classic: {
    face: "#f1f5f9",
    faceSecondary: "#ffffff",
    border: "#334155",
    number: "#0f172a",
    tick: "#334155",
    web: "#64748b",
    spider: "#0f172a",
    hand: "#0f172a",
    secondHand: "#dc2626",
    accent: "#334155",
    glow: "rgba(148, 163, 184, 0.18)",
  },
};

const numbers = [
  { number: "12", angle: 0 },
  { number: "1", angle: 30 },
  { number: "2", angle: 60 },
  { number: "3", angle: 90 },
  { number: "4", angle: 120 },
  { number: "5", angle: 150 },
  { number: "6", angle: 180 },
  { number: "7", angle: 210 },
  { number: "8", angle: 240 },
  { number: "9", angle: 270 },
  { number: "10", angle: 300 },
  { number: "11", angle: 330 },
];

export default function SpiderClock({
  timezone,
  theme,
}: SpiderClockProps) {
  const [time, setTime] = useState<ClockTime>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const currentTheme = themes[theme] ?? themes.spider;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
      });

      const parts = formatter.formatToParts(now);

      const getPart = (type: string) =>
        Number(parts.find((part) => part.type === type)?.value ?? 0);

      setTime({
        hours: getPart("hour"),
        minutes: getPart("minute"),
        seconds: getPart("second"),
      });
    };

    updateTime();

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [timezone]);

  const hourAngle =
    ((time.hours % 12) + time.minutes / 60) * 30;

  const minuteAngle =
    (time.minutes + time.seconds / 60) * 6;

  const secondAngle = time.seconds * 6;

  const digitalHours = String(time.hours).padStart(2, "0");
  const digitalMinutes = String(time.minutes).padStart(2, "0");
  const digitalSeconds = String(time.seconds).padStart(2, "0");

  return (
    <div className="relative flex items-center justify-center py-5 sm:py-8">
      <div
        className="absolute h-[350px] w-[350px] rounded-full blur-[70px] transition-all duration-700 sm:h-[500px] sm:w-[500px] sm:blur-[100px]"
        style={{ backgroundColor: currentTheme.glow }}
      />

      <div
        className="absolute h-[350px] w-[350px] rounded-full border transition-all duration-700 sm:h-[500px] sm:w-[500px]"
        style={{ borderColor: `${currentTheme.border}12` }}
      />

      <div
        className="absolute h-[370px] w-[370px] rounded-full border border-dashed transition-all duration-700 sm:h-[530px] sm:w-[530px]"
        style={{
          borderColor: `${currentTheme.border}08`,
          animation: "spin 40s linear infinite",
        }}
      />

      <div
        className="relative aspect-square w-[310px] rounded-full border-[6px] shadow-2xl transition-all duration-700 sm:w-[440px] sm:border-[8px]"
        style={{
          backgroundColor: currentTheme.face,
          borderColor: currentTheme.border,
          boxShadow: `
            0 0 35px ${currentTheme.glow},
            0 0 90px ${currentTheme.glow},
            inset 0 0 35px rgba(0,0,0,0.16)
          `,
        }}
      >
        <div
          className="absolute inset-[2.5%] rounded-full border transition-all duration-700"
          style={{
            backgroundColor: currentTheme.faceSecondary,
            borderColor: `${currentTheme.border}55`,
          }}
        />

        <div
          className="absolute inset-[8%] rounded-full opacity-70"
          style={{
            backgroundImage: `
              repeating-radial-gradient(
                circle at center,
                transparent 0px,
                transparent 19px,
                ${currentTheme.web}24 20px,
                ${currentTheme.web}24 21px,
                transparent 22px
              )
            `,
          }}
        />

        <div className="absolute inset-[8%] overflow-hidden rounded-full">
          {Array.from({ length: 24 }).map((_, index) => (
            <div
              key={index}
              className="absolute left-1/2 top-1/2 h-px w-1/2 origin-left"
              style={{
                backgroundColor: currentTheme.web,
                opacity: index % 2 === 0 ? 0.28 : 0.14,
                transform: `rotate(${index * 15}deg)`,
              }}
            />
          ))}
        </div>

        <div
          className="absolute inset-[5%] rounded-full border transition-all duration-700"
          style={{ borderColor: `${currentTheme.border}22` }}
        />

        <div className="absolute inset-0">
          {Array.from({ length: 60 }).map((_, index) => {
            const isHour = index % 5 === 0;

            return (
              <div
                key={index}
                className="absolute left-1/2 top-1/2 origin-left"
                style={{
                  width: isHour ? "39%" : "42%",
                  height: isHour ? "3px" : "1px",
                  transform: `rotate(${index * 6}deg)`,
                  transformOrigin: "0 50%",
                }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: currentTheme.tick,
                    opacity: isHour ? 0.85 : 0.3,
                  }}
                />
              </div>
            );
          })}
        </div>

        {numbers.map((item) => {
          const radius = 38;
          const radians = (item.angle * Math.PI) / 180;

          const x = 50 + radius * Math.sin(radians);
          const y = 50 - radius * Math.cos(radians);

          const majorNumber = ["12", "3", "6", "9"].includes(item.number);

          return (
            <div
              key={item.number}
              className={`absolute -translate-x-1/2 -translate-y-1/2 font-black ${
                majorNumber ? "text-xl sm:text-2xl" : "text-sm sm:text-base"
              }`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                color: currentTheme.number,
                textShadow: `0 0 10px ${currentTheme.glow}`,
              }}
            >
              {item.number}
            </div>
          );
        })}

        <div
          className="absolute bottom-[20%] left-1/2 -translate-x-1/2 rounded-full border px-3 py-1 backdrop-blur-sm sm:px-4 sm:py-1.5"
          style={{
            borderColor: `${currentTheme.border}25`,
            backgroundColor: `${currentTheme.face}aa`,
          }}
        >
          <span
            className="font-mono text-[9px] font-bold tracking-[0.2em] sm:text-[10px]"
            style={{ color: currentTheme.number }}
          >
            {digitalHours}:{digitalMinutes}:{digitalSeconds}
          </span>
        </div>

        <div
          className="absolute left-1/2 top-1/2 z-30 origin-bottom rounded-full transition-transform duration-500 ease-linear"
          style={{
            width: "9px",
            height: "21%",
            backgroundColor: currentTheme.hand,
            transform: `
              translate(-50%, -100%)
              rotate(${hourAngle}deg)
            `,
            boxShadow: `0 0 8px ${currentTheme.glow}`,
          }}
        >
          <div
            className="absolute left-1/2 top-0 h-3 w-1 -translate-x-1/2 rounded-full"
            style={{ backgroundColor: currentTheme.accent }}
          />
        </div>

        <div
          className="absolute left-1/2 top-1/2 z-30 origin-bottom rounded-full transition-transform duration-500 ease-linear"
          style={{
            width: "6px",
            height: "31%",
            backgroundColor: currentTheme.hand,
            transform: `
              translate(-50%, -100%)
              rotate(${minuteAngle}deg)
            `,
            boxShadow: `0 0 8px ${currentTheme.glow}`,
          }}
        />

        <div
          className="absolute left-1/2 top-1/2 z-40 origin-bottom transition-transform duration-500 ease-linear"
          style={{
            width: "2px",
            height: "37%",
            backgroundColor: currentTheme.secondHand,
            transform: `
              translate(-50%, -100%)
              rotate(${secondAngle}deg)
            `,
            boxShadow: `0 0 10px ${currentTheme.secondHand}`,
          }}
        >
          <div
            className="absolute -top-1 left-1/2 h-3 w-1 -translate-x-1/2 rounded-full"
            style={{ backgroundColor: currentTheme.secondHand }}
          />
        </div>

        <div
          className="absolute left-1/2 top-[37%] z-45 h-20 w-20 -translate-x-1/2 rounded-full blur-2xl"
          style={{ backgroundColor: currentTheme.glow }}
        />

        {/* Floating spider */}
        <div
          className="absolute left-1/2 top-[37%] z-50 -translate-x-1/2"
          style={{
            animation: "spider-float 3s ease-in-out infinite",
          }}
        >
          {/* Animated spider thread */}
          <div
            className="spider-thread absolute bottom-full left-1/2 h-10 w-px -translate-x-1/2"
            style={{
              backgroundColor: currentTheme.spider,
            }}
          />

          {/* Spider body */}
          <div
            className="relative h-8 w-7 rounded-full"
            style={{
              backgroundColor: currentTheme.spider,
              boxShadow: `0 0 15px ${currentTheme.glow}`,
            }}
          >
            {/* Spider head */}
            <div
              className="absolute -top-3 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full"
              style={{ backgroundColor: currentTheme.spider }}
            />

            {/* Eyes */}
            <div className="absolute -top-1 left-[5px] h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)]" />

            <div className="absolute -top-1 right-[5px] h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)]" />

            {/* Left legs */}
            <div
              className="absolute left-[-18px] top-1 h-[2px] w-6 -rotate-[28deg] rounded-full"
              style={{ backgroundColor: currentTheme.spider }}
            />

            <div
              className="absolute left-[-20px] top-3 h-[2px] w-6 -rotate-[12deg] rounded-full"
              style={{ backgroundColor: currentTheme.spider }}
            />

            <div
              className="absolute left-[-18px] top-5 h-[2px] w-6 rotate-[15deg] rounded-full"
              style={{ backgroundColor: currentTheme.spider }}
            />

            <div
              className="absolute left-[-15px] top-7 h-[2px] w-5 rotate-[30deg] rounded-full"
              style={{ backgroundColor: currentTheme.spider }}
            />

            {/* Right legs */}
            <div
              className="absolute right-[-18px] top-1 h-[2px] w-6 rotate-[28deg] rounded-full"
              style={{ backgroundColor: currentTheme.spider }}
            />

            <div
              className="absolute right-[-20px] top-3 h-[2px] w-6 rotate-[12deg] rounded-full"
              style={{ backgroundColor: currentTheme.spider }}
            />

            <div
              className="absolute right-[-18px] top-5 h-[2px] w-6 -rotate-[15deg] rounded-full"
              style={{ backgroundColor: currentTheme.spider }}
            />

            <div
              className="absolute right-[-15px] top-7 h-[2px] w-5 -rotate-[30deg] rounded-full"
              style={{ backgroundColor: currentTheme.spider }}
            />
          </div>
        </div>

        {/* Center pin */}
        <div
          className="absolute left-1/2 top-1/2 z-[60] h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-[5px] shadow-xl"
          style={{
            backgroundColor: currentTheme.accent,
            borderColor: currentTheme.face,
            boxShadow: `0 0 15px ${currentTheme.glow}`,
          }}
        />

        <div className="absolute left-1/2 top-1/2 z-[61] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_6px_white]" />
      </div>
    </div>
  );
}