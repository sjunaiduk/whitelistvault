import React from "react";
import ReactDOM from "react-dom/client";
import "./style/normalize.css";
import "./style/style.css";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { WagmiConfig, createClient, configureChains } from "wagmi";
import { bsc } from "wagmi/chains";
const chains = [bsc];

import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
const { provider } = configureChains(chains, [
  w3mProvider({ projectId: "80f3b920a519677627fee8796a5dc6a8" }),
]);

const projectId = "80f3b920a519677627fee8796a5dc6a8";

const wagmiClient = createClient({
  autoConnect: false,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  provider,
});

const ethereumClient = new EthereumClient(wagmiClient, chains);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <WagmiConfig client={wagmiClient}>
      <App />
    </WagmiConfig>
    <Web3Modal
      projectId={projectId}
      ethereumClient={ethereumClient}
      themeMode="dark"
      defaultChain={bsc}
    />
  </BrowserRouter>
);
