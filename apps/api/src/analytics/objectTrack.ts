/** Server-side notebook object events for Pendo Object Analytics. */

export interface NotebookEventProperties {
  notebookId: string;
  organizationId: string;
  noteId?: string;
  shared?: boolean;
}

const trackEndpoint = process.env.PENDO_TRACK_ENDPOINT ?? "https://app.pendo.io/data/track";
const trackKey = process.env.PENDO_TRACK_KEY;

export function trackNotebookObjectEvent(
  eventName: string,
  properties: NotebookEventProperties,
  visitorId: string
): void {
  if (!trackKey) return;
  const body = {
    type: "track",
    event: eventName,
    visitorId,
    accountId: properties.organizationId,
    properties: {
      notebookId: properties.notebookId,
      noteId: properties.noteId,
      notebookShared: properties.shared,
    },
    timestamp: Date.now(),
  };
  void fetch(`${trackEndpoint}?apikey=${trackKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => undefined);
}
