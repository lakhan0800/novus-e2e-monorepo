// The Pendo agent, loaded as a global by the install snippet in index.html.
type PendoMetadataValue = string | number | boolean | Array<string | number | boolean>;

interface PendoVisitor {
  id: string;
  email?: string;
  full_name?: string;
  [key: string]: PendoMetadataValue | undefined;
}

interface PendoAccount {
  id: string;
  name?: string;
  [key: string]: PendoMetadataValue | undefined;
}

interface PendoIdentity {
  visitor: PendoVisitor;
  account?: PendoAccount;
}

interface PendoAgent {
  initialize(options: PendoIdentity): void;
  identify(identity: PendoIdentity): void;
  clearSession(): void;
}

declare var pendo: PendoAgent;
