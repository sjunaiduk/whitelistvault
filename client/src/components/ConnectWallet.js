import { useEth } from "../contexts/EthContext";

import "./ScopedStyle.css";

export const ConnectWallet = () => {
  const { tryInit, state, logout } = useEth();

  return (
    <div className="bg-green-50">
      {state.accounts?.length ? (
        <div>
          <button>{state.accounts[0]}</button>
          <button className="test223" type="button" onClick={logout}>
            Logout
          </button>
        </div>
      ) : (
        <div>
          <p className="test223">Not Connected</p>
          <button
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={tryInit}
          >
            Connect Wallet
          </button>
        </div>
      )}

      <p>{state?.accounts}</p>
    </div>
  );
};
