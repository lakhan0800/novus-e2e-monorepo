/** Pendo Track Agent events for the research assistant panel. */

export const RESEARCH_ASSISTANT_AGENT_ID = "W0blDISncRfhvy9PtzSOh0rWtYk";

export type AgentEventType = "prompt" | "agent_response" | "user_reaction";

export interface AgentEventMetadata {
  agentId: string;
  conversationId: string;
  messageId: string;
  content: string;
  modelUsed?: string;
  suggestedPrompt?: boolean;
  toolsUsed?: string[];
  fileUploaded?: boolean;
}

export function trackAgentEvent(eventType: AgentEventType, metadata: AgentEventMetadata): void {
  window.pendo?.trackAgent?.(eventType, metadata);
}
