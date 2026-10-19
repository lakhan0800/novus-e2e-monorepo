import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";

// Boot Pendo exactly once, before the first render. An empty visitor id lets Pendo
// resume a previously identified visitor or fall back to an anonymous one.
pendo.initialize({ visitor: { id: "" } });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
