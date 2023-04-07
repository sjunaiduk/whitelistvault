import { useState } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { ConnectWallet } from "./ConnectWallet";

export const NavBar = ({ switchTheSeller, isUserSeller }) => {
  const [burgerExpanded, setBurgerExpanded] = useState(false);
  const [navbarExpanded, setNavbarExpanded] = useState(false);
  const { address } = useAccount();
  return (
    <div className={"navbar-new"}>
      <div className="navbar-new__filler-nav">
        <i
          id="navbar-new__opener"
          className={burgerExpanded ? "burger expanded" : "burger"}
          onClick={() => {
            setBurgerExpanded(!burgerExpanded);
            setNavbarExpanded(!navbarExpanded);
          }}
        ></i>
        <div className="nav-filler__buttons">
          {address && (
            <button className="btn btn--secondary" onClick={switchTheSeller}>
              {isUserSeller ? "Switch to Buyer" : "Switch to Seller"}
            </button>
          )}

          <ConnectWallet />
        </div>
      </div>
      <div
        id="navbar-new__content"
        className={navbarExpanded && "navbar-new__expanded"}
      >
        <div className="navbar-new__header">
          <div className="navbar__logo">
            <span>Whitelist Vault</span>
            <i className="logo"></i>
          </div>
        </div>

        <ul className="navbar-new__items">
          <li className="navbar-new__item">
            <Link to="/" className="navbar__link">
              Home
            </Link>
          </li>
          {address ? (
            isUserSeller ? (
              <>
                <li className="navbar-new__item">
                  <Link to="/createSale" className="navbar__link">
                    Create Sale
                  </Link>
                </li>
                <li className="navbar-new__item">
                  <Link to="/sales" className="navbar__link">
                    Seller Sales
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="navbar-new__item">
                  <Link to="/openBookSales" className="navbar__link">
                    Openbook sales
                  </Link>
                </li>
                <li className="navbar-new__item">
                  <Link to="/sales" className="navbar__link">
                    Purchases
                  </Link>
                </li>
              </>
            )
          ) : null}

          <li className="navbar-new__item mobile-hidden">
            <ConnectWallet />
          </li>
          {address && (
            <li className="navbar-new__item mobile-hidden">
              <button className="btn btn--secondary" onClick={switchTheSeller}>
                {isUserSeller ? "Switch to Buyer" : "Switch to Seller"}
              </button>
            </li>
          )}
        </ul>
      </div>

      {navbarExpanded && (
        <div
          id="navbar-new__overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 10,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          onClick={() => {
            setBurgerExpanded(!burgerExpanded);
            setNavbarExpanded(!navbarExpanded);
          }}
        ></div>
      )}
    </div>
  );
};
