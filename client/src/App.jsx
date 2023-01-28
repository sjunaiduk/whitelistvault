import { ConnectWallet } from "./components/ConnectWallet";
import {
  AcceptSale,
  CompleteSale,
  CreateSale,
  ViewSales,
} from "./components/SalesComponents";
import { useEth } from "./contexts/EthContext";

import "./testStyle.css";

function App() {
  const { state } = useEth();

  return (
    <div id="App">
      <p className="colorRed">TEST </p>
      <div className="bg-green-500">
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
