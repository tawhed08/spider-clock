export function isShortcutTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    !target.isContentEditable &&
    !target.closest("input, textarea, select, button, [contenteditable='true']")
  );
}
