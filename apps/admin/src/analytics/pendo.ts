type TrackProperties = Record<string, string | number | boolean>;

interface PendoAgent {
  track: (eventName: string, properties?: TrackProperties) => void;
}

declare global {
  interface Window {
    pendo?: PendoAgent;
  }
}

// Sends a Pendo Track Event when the agent is loaded. Tracking must never break the app.
export function trackEvent(eventName: string, properties: TrackProperties = {}): void {
  try {
    window.pendo?.track(eventName, properties);
  } catch (err) {
    console.warn("Pendo track failed", err);
  }
}
