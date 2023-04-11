const { ethers } = require("hardhat");

async function onPermit(owner, spender, contract, provider, amount) {
  const nonce = await contract.nonces(owner);
  const deadline = +new Date() + 60 * 60;

  const domainType = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
  ];

  const chainId = await (await provider.getNetwork()).chainId;
  const domain = {
    name: await contract.name(),
    version: "1",
    chainId: chainId,
    verifyingContract: contract.address,
  };

  const Permit = [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ];

  const permit = {
    owner: owner,
    spender: spender,
    value: amount.toString(),
    nonce: nonce.toHexString(),
    deadline: deadline,
  };

  const data = JSON.stringify({
    types: {
      EIP712Domain: domainType,
      Permit: Permit,
    },
    domain: domain,
    primaryType: "Permit",
    message: permit,
  });

  const signatureLike = await provider.send("eth_signTypedData_v4", [
    owner,
    data,
  ]);

  const signature = ethers.utils.splitSignature(signatureLike);
  return {
    v: signature.v,
    r: signature.r,
    s: signature.s,
    deadline,
  };
}

module.exports = { onPermit };
