import { EthContext, EthProvider, useEth } from "./contexts/EthContext";
import "./App.css";

import { ConnectWallet } from "./components/ConnectWallet";

function App() {


 
  return (
    <EthProvider>
    
      
      <div id="App" >
        <div className="container">
            <ConnectWallet />
         
        </div>
      </div>
    </EthProvider>
  );
}

export default App;
