// Global created by the Pendo install snippet in index.html.
type PendoMetadataValue = string | number | boolean | string[];

interface PendoMetadata {
  id: string;
  [field: string]: PendoMetadataValue;
}

interface PendoOptions {
  visitor: PendoMetadata;
  account?: PendoMetadata;
}

interface Pendo {
  initialize(options: PendoOptions): void;
  identify(options: PendoOptions): void;
  // Not stubbed by the snippet: undefined until the agent script has loaded.
  clearSession?(): void;
}

declare var pendo: Pendo;
