const dotenv = require("dotenv");
dotenv.config();

const { ethers } = require("ethers");
const privateKey = process.env.PRIVATEKEY;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.address;
const currentChallenge = ethers.utils.formatBytes32String("rBNB"); //0x72424e4200000000000000000000000000000000000000000000000000000000

const difficulty = "0x9999";
const tick = "rBNB";

const FgGreen = "\x1b[32m";
const FgYellow = "\x1b[33m";
const FgRed = "\x1b[31m";

const postResultData = async (body) => {
  const res = await fetch(
    "https://ec2-18-217-135-255.us-east-2.compute.amazonaws.com/validate",
    {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9",
        "content-type": "application/json",
        "sec-ch-ua":
          '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        Referer: "https://bnb.reth.cc/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body,
      method: "POST",
    }
  );
  const r = await res.json();
  return r;
};

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

async function sleepMS(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function findSolution(difficulty) {
  while (1) {
    const random_value = ethers.utils.randomBytes(32);
    const potential_solution = ethers.utils.hexlify(random_value);
    const hashed_solution = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["bytes32", "bytes32", "address"],
        [potential_solution, currentChallenge, account]
      )
    );
    if (hashed_solution.startsWith(difficulty)) {
      return potential_solution;
    }
  }
}

async function sendTransaction(solution) {
  const body = {
    solution,
    challenge: currentChallenge,
    address: account,
    difficulty,
    tick,
  };

  console.log(body);

  await postResultData(JSON.stringify(body));
}

async function main() {
  try {
    while (true) {
      const solution = findSolution(difficulty);

      await sendTransaction(solution);
      console.log(`发送成功 solution: ${solution}`);

      await sleepMS(50);
    }
  } catch (err) {
    console.log("错误 ------------------");
    console.log(err);
    console.log("-----------------------");
    console.log("重启程序");
    main();
  }
}

main();
