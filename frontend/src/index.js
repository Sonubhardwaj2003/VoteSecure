import { registerServiceWorker } from "./registerSW";
import React from "react";
import App from "./App";
import ReactDOM from "react-dom/client";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
registerServiceWorker();
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
