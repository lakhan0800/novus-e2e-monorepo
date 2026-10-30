/** Generic browser Pendo Track Event helper. No-ops when the Pendo agent is not loaded. */

export type TrackEventProperties = Record<string, string | boolean | number>;

export function trackEvent(eventName: string, properties?: TrackEventProperties): void {
  try {
    window.pendo?.track(eventName, properties);
  } catch {
    // Tracking must never break the app.
  }
}
