import { useEth } from "../contexts/EthContext";

export const ConnectWallet = () => {
  const { tryInit, state } = useEth();

  return (
    <div>
      {state.accounts?.length ? (
        <p>Connected</p>
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
