const { ethers } = require("ethers");
async function main() {
  const provider = new ethers.JsonRpcProvider("https://api.infra.testnet.somnia.network");
  const wallet = new ethers.Wallet("62a232ee012e29eada8694487f5640c2ccfac38e1d69ca3f0cc14c799f6909aa", provider);
  const sentinel = new ethers.Contract("0x87E3D9fcfA4eff229A65d045A7C741E49b581187", ["function protect(address)"], wallet);
  const tx = await sentinel.protect("0x87E3D9fcfA4eff229A65d045A7C741E49b581187");
  await tx.wait();
  console.log("Protected! tx:", tx.hash);
}
main();
