
"use client";

import { useEffect, useState } from "react";

interface City {
  city: string;
  country: string;
  timezone: string;
  flag: string;
  accent: string;
}

interface CityTime {
  hours: string;
  minutes: string;
  seconds: string;
  period: string;
  date: string;
  offset: string;
}

const cities: City[] = [
  {
    city: "Dhaka",
    country: "Bangladesh",
    timezone: "Asia/Dhaka",
    flag: "🇧🇩",
    accent: "#a3e635",
  },
  {
    city: "London",
    country: "United Kingdom",
    timezone: "Europe/London",
    flag: "🇬🇧",
    accent: "#60a5fa",
  },
  {
    city: "New York",
    country: "United States",
    timezone: "America/New_York",
    flag: "🇺🇸",
    accent: "#f472b6",
  },
  {
    city: "Tokyo",
    country: "Japan",
    timezone: "Asia/Tokyo",
    flag: "🇯🇵",
    accent: "#fb7185",
  },
  {
    city: "Dubai",
    country: "UAE",
    timezone: "Asia/Dubai",
    flag: "🇦🇪",
    accent: "#fbbf24",
  },
  {
    city: "Sydney",
    country: "Australia",
    timezone: "Australia/Sydney",
    flag: "🇦🇺",
    accent: "#22d3ee",
  },
  {
    city: "Paris",
    country: "France",
    timezone: "Europe/Paris",
    flag: "🇫🇷",
    accent: "#818cf8",
  },
  {
    city: "Singapore",
    country: "Singapore",
    timezone: "Asia/Singapore",
    flag: "🇸🇬",
    accent: "#34d399",
  },
];

function getCityTime(timezone: string, now: Date): CityTime {
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const offsetFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
  });

  const timeParts = timeFormatter.formatToParts(now);

  const getPart = (type: string) =>
    timeParts.find((part) => part.type === type)?.value ?? "00";

  const offsetParts = offsetFormatter.formatToParts(now);

  const offset =
    offsetParts.find((part) => part.type === "timeZoneName")?.value ?? "UTC";

  return {
    hours: getPart("hour"),
    minutes: getPart("minute"),
    seconds: getPart("second"),
    period: getPart("dayPeriod"),
    date: dateFormatter.format(now),
    offset: offset.replace("GMT", "UTC"),
  };
}

export default function WorldClocks() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };

    updateTime();

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full">
      {/* Section header */}
      <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute h-full w-full animate-ping rounded-full bg-lime-400 opacity-40" />
              <span className="relative h-2 w-2 rounded-full bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.8)]" />
            </span>

            <span className="text-[8px] font-bold uppercase tracking-[0.22em] text-lime-400/70 sm:text-[10px] sm:tracking-[0.3em]">
              Live Network
            </span>
          </div>

          <p className="mt-1 truncate text-[10px] text-white/25 sm:text-xs">
            Real-time global timezone monitoring
          </p>
        </div>

        <div className="hidden shrink-0 rounded-full border border-white/[0.06] bg-white/[0.025] px-3 py-1.5 sm:block">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/25">
            Updated every second
          </span>
        </div>
      </div>

      {/* World clock cards */}
      <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 sm:gap-3 lg:grid-cols-4">
        {cities.map((city) => {
          const time = currentTime
            ? getCityTime(city.timezone, currentTime)
            : null;

          return (
            <article
              key={city.timezone}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12] hover:bg-white/[0.045] hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)] sm:p-4"
            >
              {/* Accent glow */}
              <div
                className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full opacity-[0.07] blur-3xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-[0.16]"
                style={{ backgroundColor: city.accent }}
              />

              <div
                className="pointer-events-none absolute left-0 top-0 h-px w-0 transition-all duration-500 group-hover:w-full"
                style={{ backgroundColor: city.accent }}
              />

              {/* City header */}
              <div className="relative flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                  <span className="shrink-0 text-xl transition-transform duration-300 group-hover:scale-110 sm:text-2xl">
                    {city.flag}
                  </span>

                  <div className="min-w-0">
                    <h3 className="truncate text-xs font-bold text-white/85 sm:text-sm">
                      {city.city}
                    </h3>

                    <p className="mt-0.5 truncate text-[9px] text-white/25 sm:text-[10px]">
                      {city.country}
                    </p>
                  </div>
                </div>

                {city.city === "Dhaka" && (
                  <span className="shrink-0 rounded-full border border-lime-400/15 bg-lime-400/10 px-1.5 py-1 text-[7px] font-bold uppercase tracking-[0.12em] text-lime-300/70 sm:px-2 sm:text-[8px] sm:tracking-[0.15em]">
                    Local
                  </span>
                )}
              </div>

              {/* Time */}
              <div className="relative mt-4 sm:mt-5">
                <div className="flex items-baseline whitespace-nowrap">
                  <span className="font-mono text-[26px] font-bold leading-none tracking-[-0.04em] text-white sm:text-3xl">
                    {time?.hours ?? "--"}
                  </span>

                  <span
                    className="mx-0.5 font-mono text-lg text-white/20 sm:text-xl"
                    style={{
                      animation: currentTime
                        ? "world-clock-blink 1s steps(1) infinite"
                        : "none",
                    }}
                  >
                    :
                  </span>

                  <span className="font-mono text-[26px] font-bold leading-none tracking-[-0.04em] text-white sm:text-3xl">
                    {time?.minutes ?? "--"}
                  </span>

                  <span
                    className="ml-1.5 font-mono text-xs font-semibold text-white/30 sm:text-sm"
                    style={{ color: `${city.accent}99` }}
                  >
                    {time?.seconds ?? "--"}
                  </span>

                  <span className="ml-1.5 text-xs font-semibold uppercase text-white/25 sm:text-sm">
                    {time?.period ?? "--"}
                  </span>
                </div>

                {/* Date + UTC offset */}
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="truncate text-[9px] text-white/25 sm:text-[10px]">
                    {time?.date ?? "Loading..."}
                  </span>

                  <span
                    className="shrink-0 text-[8px] font-semibold sm:text-[9px]"
                    style={{ color: city.accent }}
                  >
                    {time?.offset ?? "UTC"}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="mt-3 h-px bg-white/[0.05] sm:mt-4" />

              {/* Timezone footer */}
              <div className="mt-2.5 flex items-center justify-between gap-2 sm:mt-3">
                <span className="text-[8px] uppercase tracking-[0.13em] text-white/15 sm:text-[9px] sm:tracking-[0.15em]">
                  Timezone
                </span>

                <span className="max-w-[65%] truncate font-mono text-[8px] text-white/20 sm:max-w-none sm:text-[9px]">
                  {city.timezone}
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes world-clock-blink {
          0%,
          45% {
            opacity: 0.2;
          }

          50%,
          95% {
            opacity: 0.7;
          }

          100% {
            opacity: 0.2;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}
