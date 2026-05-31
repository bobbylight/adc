import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app";

const node = document.getElementById("root");
if (!node) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(node).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
