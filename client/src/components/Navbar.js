import { useState } from "react";
import { ConnectWallet } from "./ConnectWallet";

export const NavBar = ({ switchTheSeller }) => {
  const [burgerExpanded, setBurgerExpanded] = useState(false);
  const [navbarExpanded, setNavbarExpanded] = useState(false);
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
          <button className="btn btn--secondary">Switch View</button>
          <ConnectWallet />
        </div>
      </div>
      <div
        id="navbar-new__content"
        className={navbarExpanded && "navbar-new__expanded"}
      >
        <div className="navbar-new__header">
          <div className="navbar__logo">
            <span>Escrow Dapp</span>
            <i className="logo"></i>
          </div>
        </div>

        <ul className="navbar-new__items">
          <li className="navbar-new__item">
            <a href="#" className="navbar__link">
              Home
            </a>
          </li>
          <li className="navbar-new__item">
            <a href="#" className="navbar__link">
              About
            </a>
          </li>
          <li className="navbar-new__item">
            <a href="#" className="navbar__link">
              Contact
            </a>
          </li>
          <li className="navbar-new__item mobile-hidden">
            <ConnectWallet />
          </li>
          <li className="navbar-new__item mobile-hidden">
            <button className="btn btn--secondary" onClick={switchTheSeller}>
              Switch View
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};
