// Minimal typing for the global `pendo` object that the Pendo agent snippet defines. It is
// undefined until the snippet is installed and loaded, so check `typeof pendo !== "undefined"`
// before calling it.
interface PendoAgent {
  // `undefined` is accepted because useParams() types route params as possibly undefined.
  track(trackType: string, metadata?: Record<string, string | number | boolean | undefined>): void;
}

declare var pendo: PendoAgent | undefined;
