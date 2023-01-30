import { useEth } from "../contexts/EthContext";

export const ConnectWallet = () => {
  const { tryInit, state, logout } = useEth();

  return (
    <>
      {state.accounts?.length ? (
        <>
          <p id="walletAddress">{state.accounts[0]}</p>
          <button type="button" onClick={logout}>
            Logout
          </button>
        </>
      ) : (
        <>
          <p>Not Connected</p>
          <button onClick={tryInit}>Connect Wallet</button>
        </>
      )}
    </>
  );
};
