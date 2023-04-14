import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__logo">
          <span>Whitelist Vault</span>
          <i className="logo"></i>
        </div>
        <div className="footer__links">
          <ul className="footer__list">
            <li className="footer__item">
              <Link to="/" className="footer__link">
                Home
              </Link>
            </li>

            <li className="footer__item">
              <a href="https://t.me/whitelistvault" className="footer__link">
                Telegram
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
