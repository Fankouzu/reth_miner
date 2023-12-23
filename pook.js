const dotenv = require("dotenv");
dotenv.config();
const { ethers } = require("ethers");

const TotalMint = 10;

const RPC_URL = "https://polygon.blockpi.network/v1/rpc/public";
const chainId = 137;
const contractAddress = "0xF9C4c674188089A7A5C608510360155147b9607b";
const price = ethers.utils.parseUnits("0.1");

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const privateKey = process.env.PRIVATEKEY;
const wallet = new ethers.Wallet(privateKey, provider);
const account = wallet.address;

const FgGreen = "\x1b[32m";
const FgYellow = "\x1b[33m";
const FgRed = "\x1b[31m";

async function mint() {
  // const jsonData = {
  //   p: "rARB-20",
  //   op: "mint",
  //   tick: "rARB",
  //   solution: solution,
  //   amt: "10000",
  // };

  // const dataHex = ethers.utils.hexlify(
  //   ethers.utils.toUtf8Bytes(
  //     "data:application/json," + JSON.stringify(jsonData)
  //   )
  // );
  const dataHex = "";
  const nonce = await provider.getTransactionCount(account);
  // const gasPrice = await provider.getGasPrice();
  // console.log(
  //   FgYellow,
  //   `=== Gas Price: ${(gasPrice / 1e9).toFixed(2)} gwei ===`
  // );

  const ga = ethers.utils.parseUnits("120", "gwei");
  const tx = {
    from: account,
    to: contractAddress,
    nonce: nonce,
    gasPrice: ga,
    gasLimit: ethers.utils.hexlify(57000),
    chainId: chainId,
    value: price,
  };

  const signedTx = await wallet.signTransaction(tx);
  console.log(FgGreen, `signedTx : ${signedTx}`);
  const receipt = await provider.sendTransaction(signedTx);
  console.log(FgGreen, `receipt : ${receipt.hash}`);
  //await to confirm
  await provider.waitForTransaction(receipt.hash);
  console.log(FgYellow, `Successful minted : ${receipt.hash}`);
}

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const main = async () => {
  let mintedCount = 0;
  while (mintedCount < TotalMint) {
    try {
      await mint();
      mintedCount++;
    } catch (ex) {
      console.error(ex);
      logInfo(`${FgYellow}#-${mintedCount}: Failed to mint`);
    }
  }
};

const logInfo = (msg) => {
  // log with datetime
  console.log(`[${new Date().toLocaleString()}]: ${msg}`);
};

main();
