const dotenv = require("dotenv");
dotenv.config();

const TotalMint = process.env.MINT_AMOUNT;

const RPC_URL = process.env.RPC_URL;

const { ethers } = require("ethers");
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const privateKey = process.env.PRIVATEKEY;
const wallet = new ethers.Wallet(privateKey, provider);
const account = wallet.address;
const currentChallenge = ethers.utils.formatBytes32String("Fuck-rARB"); //0x4675636b2d724152420000000000000000000000000000000000000000000000

let solution;

const FgGreen = "\x1b[32m";
const FgYellow = "\x1b[33m";
const FgRed = "\x1b[31m";

const computeHash = (address) => {
  while (1) {
    const random_value = ethers.utils.randomBytes(32);
    const potential_solution = ethers.utils.hexlify(random_value);
    const hashed_solution = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["bytes32", "bytes32", "address"],
        [potential_solution, currentChallenge, account]
      )
    );
    if (hashed_solution.startsWith("0xffff")) {
      logInfo(`solution found: ${hashed_solution}`);
      solution = potential_solution;
      break;
    }
  }
};

async function mine_rETH(idx) {
  // data: application / json,
  //   {
  //     p: "rARB-20",
  //     op: "mint",
  //     tick: "rARB",
  //     solution:
  //       "0xf844e8b3e76f69140e80309080ffd49c4c6961a5882d5d3540f24d7f806d874d",
  //     amt: "1000",
  //   };

  const jsonData = {
    p: "rARB-20",
    op: "mint",
    tick: "Fuck-rARB",
    solution: solution,
    amt: "1000",
  };

  const dataHex = ethers.utils.hexlify(
    ethers.utils.toUtf8Bytes(
      "data:application/json," + JSON.stringify(jsonData)
    )
  );

  const nonce = await provider.getTransactionCount(account);
  // const gasPrice = await provider.getGasPrice();
  // console.log(
  //   FgYellow,
  //   `=== Gas Price: ${(gasPrice / 1e9).toFixed(2)} gwei ===`
  // );

  const ga = ethers.utils.parseUnits("0.1", "gwei");
  const tx = {
    from: account,
    to: "0x0000000000000000000000000000000001664799", // Self-transfer
    nonce: nonce,
    gasPrice: ga,
    gasLimit: ethers.utils.hexlify(4000000), //3,175,050
    data: dataHex,
    chainId: 42161,
  };

  const signedTx = await wallet.signTransaction(tx);
  const receipt = await provider.sendTransaction(signedTx);
  //await to confirm
  await provider.waitForTransaction(receipt.hash);
  console.log(FgGreen, `Successful minted rETH: ${receipt.hash}`);
}

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const showGasConsumptionAndBalance = async (txHash) => {
  const receipt = await provider.getTransactionReceipt(txHash);
  const balance = await provider.getBalance(account);
  console.log(FgYellow, `===Your balance: ${(balance / 1e18).toFixed(2)}===`);

  // estimate how many reths you can mint base on current tx gas used and current balance
  const estimateReth = Math.floor(
    balance / receipt.gasUsed / receipt.effectiveGasPrice
  );
  console.log(
    FgYellow,
    `====You can mint rETH base on current balance: ${estimateReth}====`
  );
};

const main = async () => {
  let mintedCount = 0;
  while (mintedCount < TotalMint) {
    logInfo(`#-${mintedCount}: Calculating solution...`);
    computeHash();
    try {
      await mine_rETH(mintedCount);
      mintedCount++;
      // // random sleep
      // const sleepTime = Math.floor(10000 + Math.random() * 10000);
      // await sleep(sleepTime)
    } catch (ex) {
      console.error(ex);
      logInfo(`#-${mintedCount}: Failed to mint rETH`);
    }
  }
};

const logInfo = (msg) => {
  // log with datetime
  console.log(`[${new Date().toLocaleString()}]: ${msg}`);
};

main();
