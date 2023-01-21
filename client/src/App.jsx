import { EthProvider } from "./contexts/EthContext";
import "./App.css";
import { ReadContractComponent } from "./components/ReadContract";

function App() {
  return (
    <EthProvider>
      <div id="App" >
        <div className="container">
            <h1>Hello!!</h1>
            <ReadContractComponent />
        </div>
      </div>
    </EthProvider>
  );
}

export default App;
