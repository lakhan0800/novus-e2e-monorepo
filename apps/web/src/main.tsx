import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";

// Boot Novus by Pendo exactly once, before the app renders. An empty visitor id lets
// the agent resume a known visitor or start an anonymous one; App identifies the researcher.
pendo.initialize({ visitor: { id: "" } });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
