/** Browser Pendo track events for the admin portal. */

declare global {
  interface Window {
    pendo?: {
      track: (eventName: string, metadata?: Record<string, string | boolean | number>) => void;
    };
  }
}

export function trackAdminEvent(
  eventName: string,
  metadata: Record<string, string | boolean | number | undefined>
): void {
  const defined = Object.fromEntries(
    Object.entries(metadata).filter(
      (entry): entry is [string, string | boolean | number] => entry[1] !== undefined
    )
  );
  window.pendo?.track(eventName, defined);
}
