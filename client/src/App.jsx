import { ConnectWallet } from "./components/ConnectWallet";
import {
  AcceptSale,
  CompleteSale,
  CreateSale,
  ViewSales,
} from "./components/SalesComponents";
import { useEth } from "./contexts/EthContext";

import "./index.css";

function App() {
  const { state } = useEth();

  return (
    <div id="App">
      <p>TEST </p>
      <div>
        <ConnectWallet />
        {state.accounts?.length > 0 && (
          <>
            <ViewSales sellerAddress={state.accounts[0]} />
            <AcceptSale />
            <CreateSale />
            <CompleteSale />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
