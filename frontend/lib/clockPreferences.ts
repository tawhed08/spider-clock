export interface ClockPreferences {
  timezone: string;
  localTimezone: string;
  use24Hour: boolean;
  ready: boolean;
}

const SERVER_PREFERENCES: ClockPreferences = {
  timezone: "UTC",
  localTimezone: "UTC",
  use24Hour: false,
  ready: false,
};

let cachedPreferences: ClockPreferences | null = null;
const listeners = new Set<() => void>();

function detectLocalTimezone(): string {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    new Intl.DateTimeFormat("en", { timeZone: timezone });
    return timezone;
  } catch (error) {
    console.error("Unable to detect the browser timezone:", error);
    return "UTC";
  }
}

export function getClockPreferencesSnapshot(): ClockPreferences {
  if (typeof window === "undefined") return SERVER_PREFERENCES;
  if (cachedPreferences) return cachedPreferences;

  const localTimezone = detectLocalTimezone();
  let timezone = localTimezone;
  let use24Hour = false;

  try {
    const savedTimezone = window.localStorage.getItem("spider-clock-timezone");
    if (savedTimezone) {
      try {
        new Intl.DateTimeFormat("en", { timeZone: savedTimezone });
        timezone = savedTimezone;
      } catch {
        console.error("Ignoring invalid saved timezone:", savedTimezone);
      }
    }
    use24Hour =
      window.localStorage.getItem("spider-clock-hour-format") === "24";
  } catch (error) {
    console.error("Unable to restore clock preferences:", error);
  }

  cachedPreferences = { timezone, localTimezone, use24Hour, ready: true };
  return cachedPreferences;
}

export function getServerClockPreferencesSnapshot(): ClockPreferences {
  return SERVER_PREFERENCES;
}

export function subscribeToClockPreferences(listener: () => void): () => void {
  listeners.add(listener);
  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === null ||
      event.key === "spider-clock-timezone" ||
      event.key === "spider-clock-hour-format"
    ) {
      cachedPreferences = null;
      listeners.forEach((notify) => notify());
    }
  };

  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function updateClockPreference<K extends "timezone" | "use24Hour">(
  key: K,
  value: ClockPreferences[K],
): void {
  const current = getClockPreferencesSnapshot();
  cachedPreferences = { ...current, [key]: value };

  try {
    window.localStorage.setItem(
      key === "timezone" ? "spider-clock-timezone" : "spider-clock-hour-format",
      key === "timezone" ? String(value) : value ? "24" : "12",
    );
  } catch (error) {
    console.error("Unable to save clock preferences:", error);
  }

  listeners.forEach((listener) => listener());
}
