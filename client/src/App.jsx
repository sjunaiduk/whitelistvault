import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useAccount } from "wagmi";
import { NavBar } from "./components/Navbar";
import {
  CreateSale,
  ViewOpenBookSales,
  ViewSales,
} from "./components/SalesComponents";
import { useEth } from "./contexts/EthContext";

import "./style/normalize.css";
import "./style/style.css";

function App() {
  const { state } = useEth();
  const { address } = useAccount();
  const [seller, setSeller] = useState(true);

  function switchSeller() {
    console.log("switching seller");
    setSeller(!seller);
  }

  return (
    <div id="App">
      <NavBar switchTheSeller={switchSeller} isUserSeller={seller} />

      <>
        {address ? (
          <>
            <i
              style={{
                wordBreak: "break-all",
              }}
            >
              Connected to {address}
            </i>
            <Routes>
              <Route
                path="/sales"
                element={<ViewSales usersAddress={address} isSeller={seller} />}
              />
              {!seller && (
                <Route
                  path="/openBookSales"
                  element={
                    <ViewOpenBookSales
                      usersAddress={address}
                      isSeller={seller}
                    />
                  }
                />
              )}

              {seller && (
                <Route
                  path="/createSale"
                  element={<CreateSale usersAddress={address} />}
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
