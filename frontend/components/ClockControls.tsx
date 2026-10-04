
"use client";

import { useMemo, useState } from "react";

interface ClockControlsProps {
  timezone: string;
  setTimezone: (timezone: string) => void;
  localTimezone: string;
  theme: string;
  setTheme: (theme: string) => void;
  fullscreen: () => void;
}

const cities = [
  { city: "Dhaka", country: "Bangladesh", timezone: "Asia/Dhaka", flag: "🇧🇩" },
  { city: "Tokyo", country: "Japan", timezone: "Asia/Tokyo", flag: "🇯🇵" },
  { city: "Singapore", country: "Singapore", timezone: "Asia/Singapore", flag: "🇸🇬" },
  { city: "Dubai", country: "UAE", timezone: "Asia/Dubai", flag: "🇦🇪" },
  { city: "Kolkata", country: "India", timezone: "Asia/Kolkata", flag: "🇮🇳" },
  { city: "Seoul", country: "South Korea", timezone: "Asia/Seoul", flag: "🇰🇷" },
  { city: "Shanghai", country: "China", timezone: "Asia/Shanghai", flag: "🇨🇳" },

  { city: "London", country: "United Kingdom", timezone: "Europe/London", flag: "🇬🇧" },
  { city: "Paris", country: "France", timezone: "Europe/Paris", flag: "🇫🇷" },
  { city: "Berlin", country: "Germany", timezone: "Europe/Berlin", flag: "🇩🇪" },
  { city: "Rome", country: "Italy", timezone: "Europe/Rome", flag: "🇮🇹" },
  { city: "Moscow", country: "Russia", timezone: "Europe/Moscow", flag: "🇷🇺" },

  { city: "New York", country: "USA", timezone: "America/New_York", flag: "🇺🇸" },
  { city: "Los Angeles", country: "USA", timezone: "America/Los_Angeles", flag: "🇺🇸" },
  { city: "Chicago", country: "USA", timezone: "America/Chicago", flag: "🇺🇸" },
  { city: "Toronto", country: "Canada", timezone: "America/Toronto", flag: "🇨🇦" },
  { city: "São Paulo", country: "Brazil", timezone: "America/Sao_Paulo", flag: "🇧🇷" },

  { city: "Cairo", country: "Egypt", timezone: "Africa/Cairo", flag: "🇪🇬" },
  {
    city: "Johannesburg",
    country: "South Africa",
    timezone: "Africa/Johannesburg",
    flag: "🇿🇦",
  },

  { city: "Sydney", country: "Australia", timezone: "Australia/Sydney", flag: "🇦🇺" },
  {
    city: "Melbourne",
    country: "Australia",
    timezone: "Australia/Melbourne",
    flag: "🇦🇺",
  },
  {
    city: "Auckland",
    country: "New Zealand",
    timezone: "Pacific/Auckland",
    flag: "🇳🇿",
  },
];

const themes = [
  {
    id: "spider",
    name: "Spider",
    description: "Lime Web",
    color: "#a3e635",
  },
  {
    id: "neon",
    name: "Neon",
    description: "Green Pulse",
    color: "#4ade80",
  },
  {
    id: "red",
    name: "Crimson",
    description: "Red Signal",
    color: "#ef4444",
  },
  {
    id: "cyber",
    name: "Cyber",
    description: "Cyan Core",
    color: "#22d3ee",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Clean Steel",
    color: "#94a3b8",
  },
];

export default function ClockControls({
  timezone,
  setTimezone,
  localTimezone,
  theme,
  setTheme,
  fullscreen,
}: ClockControlsProps) {
  const [search, setSearch] = useState("");
  const [openCities, setOpenCities] = useState(false);

  const localCityName =
    localTimezone.split("/").pop()?.replaceAll("_", " ") ?? localTimezone;
  const cityOptions = useMemo(
    () =>
      cities.some((city) => city.timezone === localTimezone)
        ? cities
        : [
            {
              city: localCityName || "Local timezone",
              country: "Your device",
              timezone: localTimezone,
              flag: "📍",
            },
            ...cities,
          ],
    [localCityName, localTimezone],
  );
  const selectedCity =
    cityOptions.find((city) => city.timezone === timezone) ??
    (timezone === localTimezone
      ? {
          city: localCityName || "Local timezone",
          country: "Your device",
          timezone,
          flag: "📍",
        }
      : {
          city: timezone.split("/").pop()?.replaceAll("_", " ") ?? timezone,
          country: "Selected timezone",
          timezone,
          flag: "🌐",
        });

  const selectedTheme =
    themes.find((item) => item.id === theme) ?? themes[0];

  const filteredCities = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return cityOptions;
    }

    return cityOptions.filter(
      (city) =>
        city.city.toLowerCase().includes(query) ||
        city.country.toLowerCase().includes(query) ||
        city.timezone.toLowerCase().includes(query),
    );
  }, [cityOptions, search]);

  const handleCitySelect = (cityTimezone: string) => {
    setTimezone(cityTimezone);
    setOpenCities(false);
    setSearch("");
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-0">
      <div className="glass-panel overflow-visible rounded-[24px] p-3 sm:rounded-[28px] sm:p-4">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between px-1 sm:px-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute h-full w-full animate-ping rounded-full bg-lime-400 opacity-40" />
              <span className="relative h-2 w-2 rounded-full bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.8)]" />
            </span>

            <span className="truncate text-[8px] font-bold uppercase tracking-[0.22em] text-white/35 sm:text-[9px] sm:tracking-[0.3em]">
              Clock Controls
            </span>
          </div>

          <span className="hidden font-mono text-[9px] text-white/20 sm:block">
            TIMEZONE CONTROLS
          </span>
        </div>

        {/* Controls */}
        <div className="grid gap-2.5 sm:gap-3 lg:grid-cols-[1.5fr_1fr_auto]">
          {/* Timezone */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenCities((value) => !value)}
              aria-expanded={openCities}
              aria-label={`Select timezone. Currently ${selectedCity.city}, ${timezone}`}
              aria-haspopup="listbox"
              onKeyDown={(event) => {
                if (event.key === "Escape") setOpenCities(false);
              }}
              className="group flex min-h-[70px] w-full items-center justify-between rounded-2xl border border-white/8 bg-white/[0.035] px-3 py-2.5 text-left transition-all duration-300 hover:border-lime-400/20 hover:bg-white/[0.055] active:scale-[0.99] sm:min-h-[78px] sm:px-4 sm:py-3"
            >
              <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04] text-lg transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10 sm:text-xl">
                  {selectedCity.flag}
                </div>

                <div className="min-w-0">
                  <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/25 sm:text-[9px] sm:tracking-[0.2em]">
                    Timezone
                  </p>

                  <p className="mt-0.5 truncate text-xs font-bold text-white/85 sm:text-sm">
                    {selectedCity.city}
                  </p>

                  <p className="max-w-[190px] truncate text-[9px] text-white/25 sm:max-w-none sm:text-[10px]">
                    {selectedCity.country} • {selectedCity.timezone}
                  </p>
                </div>
              </div>

              <svg
                className={`ml-2 h-4 w-4 shrink-0 text-white/30 transition-transform duration-300 ${
                  openCities ? "rotate-180 text-lime-300/60" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {/* City dropdown */}
            {openCities && (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[100] overflow-hidden rounded-2xl border border-white/10 bg-[#090d10]/98 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
                {/* Search */}
                <div className="border-b border-white/7 p-2.5 sm:p-3">
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-4-4" />
                    </svg>

                    <input
                      type="text"
                      aria-label="Search city, country, or timezone"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search city, country..."
                      autoFocus
                      className="w-full rounded-xl border border-white/8 bg-white/[0.04] py-2.5 pl-10 pr-3 text-xs text-white outline-none placeholder:text-white/20 transition-colors focus:border-lime-400/30 focus:bg-white/[0.06]"
                    />
                  </div>
                </div>

                {/* Cities */}
                <div
                  role="listbox"
                  aria-label="Available timezones"
                  className="max-h-64 overflow-y-auto p-1.5 sm:max-h-72 sm:p-2"
                >
                  {filteredCities.length > 0 ? (
                    filteredCities.map((city) => {
                      const active = city.timezone === timezone;

                      return (
                        <button
                          key={city.timezone}
                          type="button"
                          role="option"
                          aria-selected={active}
                          aria-label={`${city.city}, ${city.country}, ${city.timezone}`}
                          onClick={() => handleCitySelect(city.timezone)}
                          className={`flex min-h-[46px] w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all duration-200 sm:gap-3 sm:px-3 ${
                            active
                              ? "bg-lime-400/10"
                              : "hover:bg-white/[0.05]"
                          }`}
                        >
                          <span className="text-base sm:text-lg">
                            {city.flag}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span
                              className={`block text-[11px] font-bold sm:text-xs ${
                                active
                                  ? "text-lime-300"
                                  : "text-white/75"
                              }`}
                            >
                              {city.city}
                            </span>

                            <span className="block truncate text-[8px] text-white/25 sm:text-[9px]">
                              {city.country}
                            </span>
                          </span>

                          {active && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.8)]" />
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <p className="text-xs text-white/30">No city found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme selector */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/25 sm:text-[9px] sm:tracking-[0.2em]">
                Theme
              </span>

              <span
                className="text-[8px] sm:text-[9px]"
                style={{ color: selectedTheme.color }}
              >
                {selectedTheme.name}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {themes.map((item) => {
                const active = item.id === theme;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTheme(item.id)}
                    title={`${item.name} — ${item.description}`}
                    aria-label={`${item.name} theme`}
                    aria-pressed={active}
                    className={`group relative flex h-9 items-center justify-center rounded-xl border transition-all duration-300 active:scale-95 sm:h-10 ${
                      active
                        ? "border-white/15 bg-white/[0.08]"
                        : "border-transparent bg-white/[0.025] hover:bg-white/[0.06]"
                    }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full transition-transform duration-300 group-hover:scale-125 sm:h-3.5 sm:w-3.5"
                      style={{
                        backgroundColor: item.color,
                        boxShadow: active
                          ? `0 0 12px ${item.color}`
                          : "none",
                      }}
                    />

                    {active && (
                      <span
                        className="absolute -bottom-1 h-1 w-1 rounded-full"
                        style={{
                          backgroundColor: item.color,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={fullscreen}
            aria-label="Toggle fullscreen display"
            className="group flex min-h-[64px] items-center justify-center gap-3 rounded-2xl border border-lime-400/10 bg-lime-400/[0.035] px-4 transition-all duration-300 hover:border-lime-400/25 hover:bg-lime-400/[0.07] active:scale-[0.98] sm:min-h-[78px] sm:px-5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-lime-400/10 bg-lime-400/[0.05] text-lime-300 transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10">
              <svg
                className="h-4.5 w-4.5 sm:h-5 sm:w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                <path d="M16 3h3a2 2 0 0 1 2 2v3" />
                <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
                <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
              </svg>
            </span>

            <span className="text-left">
              <span className="block text-[8px] font-bold uppercase tracking-[0.18em] text-lime-300/60 sm:text-[9px] sm:tracking-[0.2em]">
                Display
              </span>

              <span className="mt-0.5 block text-[11px] font-bold text-white/75 sm:text-xs">
                Fullscreen
              </span>
            </span>
          </button>
        </div>

        {/* Current status */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 px-1 pt-3 sm:px-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute h-full w-full animate-ping rounded-full bg-lime-400 opacity-40" />
              <span className="relative h-2 w-2 rounded-full bg-lime-400" />
            </span>

            <span className="text-[8px] font-medium uppercase tracking-[0.14em] text-white/25 sm:text-[9px] sm:tracking-[0.18em]">
              Selected timezone
            </span>
          </div>

          <span className="max-w-[55%] truncate font-mono text-[8px] text-white/15 sm:max-w-none sm:text-[9px]">
            {timezone}
          </span>
        </div>
      </div>
    </div>
  );
}
