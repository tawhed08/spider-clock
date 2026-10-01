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
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.8)]" />
            </span>

            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-lime-400/70">
              Live Network
            </span>
          </div>

          <p className="mt-1 text-xs text-white/25">
            Real-time global timezone monitoring
          </p>
        </div>

        <div className="hidden rounded-full border border-white/[0.06] bg-white/[0.025] px-3 py-1.5 sm:block">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/25">
            Updated every second
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cities.map((city) => {
          const time = currentTime
            ? getCityTime(city.timezone, currentTime)
            : null;

          return (
            <article
              key={city.timezone}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div
                className="absolute -right-10 -top-10 h-24 w-24 rounded-full opacity-10 blur-3xl transition-opacity duration-300 group-hover:opacity-20"
                style={{ backgroundColor: city.accent }}
              />

              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{city.flag}</span>

                  <div>
                    <h3 className="text-sm font-bold text-white/85">
                      {city.city}
                    </h3>

                    <p className="mt-0.5 text-[10px] text-white/25">
                      {city.country}
                    </p>
                  </div>
                </div>

                {city.city === "Dhaka" && (
                  <span className="rounded-full border border-lime-400/15 bg-lime-400/10 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.15em] text-lime-300/70">
                    Local
                  </span>
                )}
              </div>

              <div className="relative mt-5">
                <div className="flex items-baseline">
                  <span className="font-mono text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {time?.hours ?? "--"}
                  </span>

                  <span className="mx-0.5 font-mono text-xl text-white/25">
                    :
                  </span>

                  <span className="font-mono text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {time?.minutes ?? "--"}
                  </span>

                  <span className="ml-1.5 font-mono text-sm font-semibold text-white/25">
                    {time?.seconds ?? "--"}
                  </span>

                  <span className="ml-1.5 text-sm font-semibold uppercase text-white/25">
                    {time?.period ?? "--"}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-white/25">
                    {time?.date ?? "Loading..."}
                  </span>

                  <span
                    className="text-[9px] font-semibold"
                    style={{ color: city.accent }}
                  >
                    {time?.offset ?? "UTC"}
                  </span>
                </div>
              </div>

              <div className="mt-4 h-px bg-white/[0.05]" />

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-[0.15em] text-white/15">
                  Timezone
                </span>

                <span className="font-mono text-[9px] text-white/20">
                  {city.timezone}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}