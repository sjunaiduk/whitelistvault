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
              <a href="#" className="footer__link">
                About
              </a>
            </li>
            <li className="footer__item">
              <a href="#" className="footer__link">
                Contact
              </a>
            </li>
            <li className="footer__item">
              <a href="#" className="footer__link">
                Terms
              </a>
            </li>
            <li className="footer__item">
              <a href="#" className="footer__link">
                Privacy
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
