const dotenv = require("dotenv");
dotenv.config();

const TotalMint = 10;

const RPC_URL = "https://rpc-mainnet.kcc.network";
const chainId = 321;

const { ethers } = require("ethers");
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const privateKey = process.env.PRIVATEKEY;
const wallet = new ethers.Wallet(privateKey, provider);
const account = wallet.address;

const FgGreen = "\x1b[32m";
const FgYellow = "\x1b[33m";
const FgRed = "\x1b[31m";

async function mint() {
  // ILKC
  const dataHex = "0x646174613a2c7b2270223a226b72632d3230222c226f70223a226d696e74222c227469636b223a22696c6b63222c22616d74223a2231227d";
  // KCAI
  // const dataHex = "0x646174613a2c7b2270223a226b72632d3230222c226f70223a226d696e74222c227469636b223a226b636169222c22616d74223a2231227d";
  const nonce = await provider.getTransactionCount(account);

  const ga = ethers.utils.parseUnits("9", "gwei");
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
  console.log(FgGreen, `Send Transaction : ${receipt.hash}`);
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
