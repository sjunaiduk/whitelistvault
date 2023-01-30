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

  return (
    <div id="App">
      <p>TEST </p>
      <>
        <ConnectWallet />
        {state.accounts?.length > 0 && (
          <>
            <ViewSales sellerAddress={state.accounts[0]} />
            <AcceptSale />
            <CreateSale />
            <CompleteSale />
          </>
        )}
      </>
    </div>
  );
}

export default App;
