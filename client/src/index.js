import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { EthContext, EthProvider, useEth } from "./contexts/EthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <EthProvider>
      <App />
    </EthProvider>
  </React.StrictMode>
);
