import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { NavBar } from "./components/Navbar";
import { CreateSale, ViewSales } from "./components/SalesComponents";
import { useEth } from "./contexts/EthContext";

import "./style/normalize.css";
import "./style/style.css";

function App() {
  const { state } = useEth();
  const [seller, setSeller] = useState(true);

  function switchSeller() {
    console.log("switching seller");
    setSeller(!seller);
  }

  return (
    <div id="App">
      <NavBar switchTheSeller={switchSeller} isUserSeller={seller} />

      <>
        {state.accounts?.length > 0 ? (
          <>
            <i
              style={{
                wordBreak: "break-all",
              }}
            >
              Connected to {state.accounts[0]}
            </i>
            <Routes>
              <Route
                path="/sales"
                element={
                  <ViewSales
                    usersAddress={state.accounts[0]}
                    isSeller={seller}
                  />
                }
              />
              {seller && (
                <Route
                  path="/createSale"
                  element={<CreateSale usersAddress={state.accounts[0]} />}
                />
              )}

              <Route path="/" element={<h1>Home</h1>} />
            </Routes>
          </>
        ) : (
          <h1>Connect to Metamask</h1>
        )}
      </>
    </div>
  );
}

export default App;
