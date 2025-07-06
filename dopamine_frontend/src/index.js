import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// PUBLIC_INTERFACE
// Entrypoint for the React app: Renders the <App /> component into #root.
const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
