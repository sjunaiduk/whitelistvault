import axios from "axios";

export const completeSaleRequest = async (
  signature,
  deployedAddress,
  seller,
  presale,
  walletToAdd
) => {
  const url = "http://localhost:3000/pinksale/completeTest";
  const data = {
    signature,
    deployedAddress: deployedAddress,
    seller: seller,
    presale: presale,
    walletToAdd: walletToAdd,
  };
  try {
    const response = await axios.post(url, data);
    return response;
  } catch (e) {
    console.log(`API Complete call error,`, e);
    return e;
  }
};

export const completeCancelRequest = async (
  signature,
  deployedAddress,
  seller,
  presale,
  walletToAdd
) => {
  const url = "http://localhost:3000/pinksale/cancelAsBuyer";
  const data = {
    signature,
    deployedAddress: deployedAddress,
    seller: seller,
    presale: presale,
    walletToAdd: walletToAdd,
  };
  try {
    console.log("Data being sent to API Cancel call: ", data);
    const response = await axios.post(url, data);
    console.log(`API Cancel call response:`, response);
    return response;
  } catch (e) {
    console.log(`API Cancel call error: ${e}`);
    return e;
  }
};
