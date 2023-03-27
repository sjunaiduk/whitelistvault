export const Home = ({ isUserSeller }) => {
  return (
    <div className="main-container">
      <h1 className="main-title">Whitelist Brokers</h1>
      <span> Securing your transactions </span>
      <div>{isUserSeller ? "Seller Home" : "Buyer Home"}</div>
    </div>
  );
};
