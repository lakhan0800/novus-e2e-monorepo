/** Browser notebook object events — pairs with apps/api analytics routes. */

declare global {
  interface Window {
    pendo?: {
      track: (eventName: string, metadata?: Record<string, string | boolean | number>) => void;
      trackAgent?: (
        eventType: "prompt" | "agent_response" | "user_reaction",
        metadata: {
          agentId: string;
          conversationId: string;
          messageId: string;
          content: string;
          modelUsed?: string;
          suggestedPrompt?: boolean;
          toolsUsed?: string[];
          fileUploaded?: boolean;
        }
      ) => void;
    };
  }
}

export interface NotebookObjectMetadata {
  notebookId: string;
  organizationId?: string;
  noteId?: string;
  notebookShared?: boolean;
}

export function trackNotebookObjectEvent(
  eventName: string,
  metadata: NotebookObjectMetadata
): void {
  window.pendo?.track(eventName, metadata);
}
