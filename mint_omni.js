const dotenv = require("dotenv");
dotenv.config();

const RPC_URL = "https://arbitrum.llamarpc.com";

const { ethers, BigNumber } = require("ethers");
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const privateKey = process.env.PRIVATEKEY;
const wallet = new ethers.Wallet(privateKey, provider);
const account = wallet.address;

const FgGreen = "\x1b[32m";
const FgYellow = "\x1b[33m";
const FgRed = "\x1b[31m";

const data1 = ethers.utils.defaultAbiCoder.encode(
  ["string", "string", "string"],
  ["1", "2", "3"]
);
const data2 = ethers.utils.defaultAbiCoder.encode(
  ["string", "string", "string"],
  ["4", "5", "6"]
);
const data3 = ethers.utils.defaultAbiCoder.encode(
  ["string", "string", "string"],
  ["7", "8", "9"]
);
const data4 = ethers.utils.defaultAbiCoder.encode(
  ["string", "string", "string"],
  ["a", "b", "c"]
);
const data5 = ethers.utils.defaultAbiCoder.encode(
  ["string", "string", "string"],
  ["d", "e", "f"]
);
async function mine_rETH(data) {
  const dataInput = "0xd645ddf6" + data.replace("0x", "");
  const nonce = await provider.getTransactionCount(account);

  const ga = ethers.utils.parseUnits("0.1", "gwei");
  const tx = {
    from: account,
    to: "0x5c6a2b104f212beecced5e346557fba57b82f95b", // Self-transfer
    nonce: nonce,
    gasPrice: ga,
    gasLimit: ethers.utils.hexlify(1100000), //1,086,047
    data: dataInput,
    chainId: 42161,
    value: BigNumber.from("225000000000000"),
  };

  const signedTx = await wallet.signTransaction(tx);
  const receipt = await provider.sendTransaction(signedTx);

  //await to confirm
  // await provider.waitForTransaction(receipt.hash);
  console.log(FgYellow, `Successful minted: ${receipt.hash}`);
}

const main = async () => {
  await mine_rETH(data1);
  await mine_rETH(data2);
  await mine_rETH(data3);
  await mine_rETH(data4);
  await mine_rETH(data5);
};

const logInfo = (msg) => {
  // log with datetime
  console.log(`[${new Date().toLocaleString()}]: ${msg}`);
};

main();
