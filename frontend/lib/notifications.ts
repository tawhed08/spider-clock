export async function requestNotificationPermission(): Promise<void> {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "default") return;

  try {
    await Notification.requestPermission();
  } catch (error) {
    console.error("Unable to request notification permission:", error);
  }
}

export function showBrowserNotification(title: string, body: string): void {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  try {
    new Notification(title, { body, icon: "/favicon.ico" });
  } catch (error) {
    console.error("Unable to show browser notification:", error);
  }
}
