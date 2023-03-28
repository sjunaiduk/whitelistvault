export const Home = ({ isUserSeller }) => {
  return (
    <div className="main-container">
      <div className="main-header">
        <div className="main-header-text">
          <h1>Whitelist</h1>
          <span> Haven</span>
          <h2>
            Whitelist Haven is a decentralized escrow service for buying and
            selling presale whitelist spots for crypto projects
          </h2>
        </div>
      </div>

      <div className="main-features">
        <h2>Features</h2>
        <ul className="main-features-list">
          <li className="main-features-list-item">
            <h3>Secure</h3>
            <p>
              Your funds are held in a secure smart contract until the
              transaction is completed.
            </p>
          </li>
          <li className="main-features-list-item">
            <h3>Easy To Use</h3>
            <p>
              Create or accept sales with just a few clicks, and cancel within 5
              minutes if needed.
            </p>
          </li>
          <li className="main-features-list-item">
            <h3>Transparent</h3>
            <p>All transaction details are viewable on the blockchain</p>
          </li>
          <li className="main-features-list-item">
            <h3>Open Book Option</h3>
            <p>
              Sellers can choose to create generic 'open book' sales where any
              buyer can accept the sale.
            </p>
          </li>
        </ul>
      </div>

      <div className="main-howitworks">
        <h2>How it works</h2>
        <ul className="main-howitworks-list">
          <li className="main-howitworks-list-item">
            <h3>1. Create a sale</h3>
            <p>
              As a seller, you can create a sale by setting the presale address,
              price, and optionally the buyer's wallet address. This information
              is stored on the blockchain and cannot be tampered with.
            </p>
          </li>
          <li className="main-howitworks-list-item">
            <h3>2. Buyer Accepts Sale</h3>
            <p>
              Once a sale is created, it becomes available to potential buyers.
              When a buyer accepts the sale, they send the payment to our secure
              smart contract.
            </p>
          </li>
          <li className="main-howitworks-list-item">
            <h3>3. Escrow Protection</h3>
            <p>
              Our smart contract acts as a middleman, holding the payment until
              the seller completes the sale. This ensures both parties are
              protected from scams or fraud.
            </p>
          </li>
          <li className="main-howitworks-list-item">
            <h3>4. Complete the Sale</h3>
            <p>
              Once the buyer's wallet address is added, the seller can complete
              the sale when the presale starts, and he will recieve the funds
              held by our escrow service.
            </p>
          </li>
          <li className="main-howitworks-list-item">
            <h3>5. Cancelation Policy</h3>
            <p>
              Buyers can cancel within 5 minutes of accepting the sale for a
              full refund. After that, they can only cancel if their wallet
              address is not added by the seller by the time presale starts..
              Sellers can cancel at any time.
            </p>
          </li>
        </ul>
      </div>
      <p>
        By using WhitelistHaven, you can buy and sell presale tokens with peace
        of mind knowing that your transaction is secure and protected by our
        escrow service.
      </p>
    </div>
  );
};
