import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useAccount } from "wagmi";
import { Footer } from "./components/Footer";
import { Home } from "./components/Home";
import { NavBar } from "./components/Navbar";
import {
  CreateSale,
  ViewOpenBookSales,
  ViewSales,
} from "./components/SalesComponents";

import "./style/normalize.css";
import "./style/style.css";

function App() {
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

              <Route path="/" element={<Home isUserSeller={seller} />} />
            </Routes>
          </>
        ) : (
          <Home isUserSeller={seller} />
        )}
      </>
      <Footer />
    </div>
  );
}

export default App;
