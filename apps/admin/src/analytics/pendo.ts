type TrackProperties = Record<string, string | number | boolean>;

interface PendoAgent {
  track: (eventName: string, properties?: TrackProperties) => void;
}

declare global {
  interface Window {
    pendo?: PendoAgent;
  }
}

/**
 * Sends a Pendo Track Event when the Pendo agent is loaded. The agent attaches the
 * current visitor and account itself. Tracking failures never break the app flow.
 */
export function trackEvent(eventName: string, properties: TrackProperties): void {
  try {
    window.pendo?.track(eventName, properties);
  } catch {
    // Analytics must never interrupt the admin portal.
  }
}
