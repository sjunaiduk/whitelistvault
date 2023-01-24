import { useEth } from "../contexts/EthContext";

export const ConnectWallet = () => {
  const { tryInit, state, logout } = useEth();

  return (
    <div>
      {state.accounts?.length ? (
        <div>
          <button>{state.accounts[0]}</button>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <p>Not Connected</p>
          <button onClick={tryInit}>Connect Wallet</button>
        </div>
      )}

      <p>{state?.accounts}</p>
    </div>
  );
};
