import "./App.css";

import { ConnectWallet } from "./components/ConnectWallet";
import {
  AcceptSale,
  CreateSale,
  ViewSales,
} from "./components/SalesComponents";
import { useEth } from "./contexts/EthContext";

function App() {
  const { state } = useEth();

  return (
    <div id="App">
      <div className="container">
        <ConnectWallet />
        {state.accounts?.length > 0 && (
          <>
            <ViewSales sellerAddress={state.accounts[0]} />
            <AcceptSale />
            <CreateSale />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
