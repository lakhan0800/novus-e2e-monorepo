/** Browser Pendo Track Events for sign-in, notebook, settings and assistant outcomes. */

export type TrackEventProperties = Record<string, string | boolean | number>;

/**
 * Sends a Pendo Track Event. The Pendo agent attaches the visitor and account itself,
 * so callers must not pass visitor or account ids. Tracking never breaks the app flow.
 */
export function trackEvent(eventName: string, properties: TrackEventProperties = {}): void {
  try {
    window.pendo?.track(eventName, properties);
  } catch (err) {
    console.warn(`Pendo track failed for "${eventName}"`, err);
  }
}
