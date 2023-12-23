const dotenv = require("dotenv");
dotenv.config();

const TotalMint = 10;

const RPC_URL = "https://avax-pokt.nodies.app/ext/bc/C/rpc";
const chainId = 43114;

const { ethers } = require("ethers");
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
  // const dataHex =
  //   "0x646174613a2c7b2270223a226173632d3230222c226f70223a226d696e74222c227469636b223a2262756c6c222c22616d74223a22313030303030303030227d";
  const dataHex = "0x646174613a2c7b2270223a226173632d3230222c226f70223a226d696e74222c227469636b223a2232303234222c22616d74223a223234227d";
  const nonce = await provider.getTransactionCount(account);
  // const gasPrice = await provider.getGasPrice();
  // console.log(
  //   FgYellow,
  //   `=== Gas Price: ${(gasPrice / 1e9).toFixed(2)} gwei ===`
  // );

  const ga = ethers.utils.parseUnits("100", "gwei");
  const tx = {
    from: account,
    to: account, // Self-transfer
    nonce: nonce,
    gasPrice: ga,
    gasLimit: ethers.utils.hexlify(23000), 
    data: dataHex,
    chainId: chainId,
  };

  const signedTx = await wallet.signTransaction(tx);
  const receipt = await provider.sendTransaction(signedTx);
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
