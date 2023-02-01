import { useState } from "react";
import { ConnectWallet } from "./components/ConnectWallet";
import {
  AcceptSale,
  CompleteSale,
  CreateSale,
  ViewSales,
} from "./components/SalesComponents";
import { useEth } from "./contexts/EthContext";

import "./style/normalize.css";
import "./style/style.css";

function App() {
  const { state } = useEth();
  const [seller, setSeller] = useState(true);

  return (
    <div id="App">
      <p>TEST </p>
      <button onClick={() => setSeller(!seller)}>Toggle Seller</button>
      <p>Role : {seller ? "Seller" : "Buyer"}</p>
      <>
        <ConnectWallet />
        {state.accounts?.length > 0 && (
          <>
            <ViewSales usersAddress={state.accounts[0]} isSeller={seller} />
            <CreateSale usersAddress={state.accounts[0]} />
          </>
        )}
      </>
    </div>
  );
}

export default App;
