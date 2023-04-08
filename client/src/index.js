import React from "react";
import ReactDOM from "react-dom/client";
import "./style/normalize.css";
import "./style/style.css";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { WagmiConfig, createClient, configureChains } from "wagmi";
import { ConnectKitProvider, getDefaultClient } from "connectkit";
import { bscTestnet } from "wagmi/chains";

import { publicProvider } from "wagmi/providers/public";

import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { InjectedConnector } from "wagmi/connectors/injected";

const { chains, provider, webSocketProvider } = configureChains(
  [bscTestnet],
  [publicProvider()]
);

const client = createClient({
  autoConnect: true,
  connectors: [
    new WalletConnectConnector({
      chains,
      options: {
        projectId: "80f3b920a519677627fee8796a5dc6a8",
        showQrModal: false,
      },
    }),
    new InjectedConnector({
      chains,

      options: {
        name: "MetaMask",
        iconUrl: "https://metamask.io/images/favicon-32x32.png",
      },
    }),
  ],
  provider,
  webSocketProvider,
});

// const client = createClient(
//   getDefaultClient({
//     chains: [bscTestnet],
//   })
// );

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
