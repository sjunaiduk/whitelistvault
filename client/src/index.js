import React from "react";
import ReactDOM from "react-dom/client";
import "./style/normalize.css";
import "./style/style.css";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { WagmiConfig, createClient } from "wagmi";
import { ConnectKitProvider, getDefaultClient } from "connectkit";
import { bscTestnet } from "wagmi/chains";

const client = createClient(
  getDefaultClient({
    chains: [bscTestnet],
  })
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <WagmiConfig client={client}>
      <ConnectKitProvider theme="midnight">
        <App />
      </ConnectKitProvider>
    </WagmiConfig>
  </BrowserRouter>
);
