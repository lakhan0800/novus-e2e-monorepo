// Novus by Pendo agent, loaded globally by the install snippet in index.html.

type PendoMetadataValue = string | number | boolean | string[];

interface PendoMetadata {
  id: string;
  [field: string]: PendoMetadataValue;
}

interface PendoIdentity {
  visitor: PendoMetadata;
  account?: PendoMetadata;
}

interface Pendo {
  initialize(options: PendoIdentity): void;
  identify(identity: PendoIdentity): void;
  clearSession(): void;
}

declare var pendo: Pendo;
