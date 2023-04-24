const { network, ethers } = require("hardhat");

module.exports = async () => {
  const chainId = network.config.chainId;

  const abi = [
    {
      inputs: [
        {
          internalType: "string",
          name: "_name",
          type: "string",
        },
        {
          internalType: "string",
          name: "_symbol",
          type: "string",
        },
        {
          internalType: "address",
          name: "_owner",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "spender",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Approval",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
    {
      inputs: [],
      name: "DOMAIN_SEPARATOR",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          internalType: "address",
          name: "spender",
          type: "address",
        },
      ],
      name: "allowance",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "spender",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "approve",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "balanceOf",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "burn",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "burnFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "decimals",
      outputs: [
        {
          internalType: "uint8",
          name: "",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "spender",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "subtractedValue",
          type: "uint256",
        },
      ],
      name: "decreaseAllowance",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "spender",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "addedValue",
          type: "uint256",
        },
      ],
      name: "increaseAllowance",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "mint",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "name",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
      ],
      name: "nonces",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          internalType: "address",
          name: "spender",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "deadline",
          type: "uint256",
        },
        {
          internalType: "uint8",
          name: "v",
          type: "uint8",
        },
        {
          internalType: "bytes32",
          name: "r",
          type: "bytes32",
        },
        {
          internalType: "bytes32",
          name: "s",
          type: "bytes32",
        },
      ],
      name: "permit",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "symbol",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "totalSupply",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "transfer",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "transferFrom",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  const bin =
    "0x6101406040523480156200001257600080fd5b50604051620033f0380380620033f083398181016040528101906200003891906200062f565b82806040518060400160405280600181526020017f31000000000000000000000000000000000000000000000000000000000000008152508585816003908162000083919062000914565b50806004908162000095919062000914565b50505060008280519060200120905060008280519060200120905060007f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f90508260e081815250508161010081815250504660a0818152505062000101818484620001d960201b60201c565b608081815250503073ffffffffffffffffffffffffffffffffffffffff1660c08173ffffffffffffffffffffffffffffffffffffffff16815250508061012081815250505050505050506200016b6200015f6200021560201b60201c565b6200021d60201b60201c565b620001876731e996a1481860b560c01b620002e360201b60201c565b620001a367a1893da3f21fbace60c01b620002e360201b60201c565b620001bf67f3d51adf2f9cbcfd60c01b620002e360201b60201c565b620001d081620002e660201b60201c565b50505062000bb0565b60008383834630604051602001620001f695949392919062000a38565b6040516020818303038152906040528051906020012090509392505050565b600033905090565b6000600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081600760006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b50565b620002f66200037c60201b60201c565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff160362000368576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016200035f9062000b1c565b60405180910390fd5b62000379816200021d60201b60201c565b50565b6200038c6200021560201b60201c565b73ffffffffffffffffffffffffffffffffffffffff16620003b26200040d60201b60201c565b73ffffffffffffffffffffffffffffffffffffffff16146200040b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620004029062000b8e565b60405180910390fd5b565b6000600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b620004a08262000455565b810181811067ffffffffffffffff82111715620004c257620004c162000466565b5b80604052505050565b6000620004d762000437565b9050620004e5828262000495565b919050565b600067ffffffffffffffff82111562000508576200050762000466565b5b620005138262000455565b9050602081019050919050565b60005b838110156200054057808201518184015260208101905062000523565b60008484015250505050565b6000620005636200055d84620004ea565b620004cb565b90508281526020810184848401111562000582576200058162000450565b5b6200058f84828562000520565b509392505050565b600082601f830112620005af57620005ae6200044b565b5b8151620005c18482602086016200054c565b91505092915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000620005f782620005ca565b9050919050565b6200060981620005ea565b81146200061557600080fd5b50565b6000815190506200062981620005fe565b92915050565b6000806000606084860312156200064b576200064a62000441565b5b600084015167ffffffffffffffff8111156200066c576200066b62000446565b5b6200067a8682870162000597565b935050602084015167ffffffffffffffff8111156200069e576200069d62000446565b5b620006ac8682870162000597565b9250506040620006bf8682870162000618565b9150509250925092565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806200071c57607f821691505b602082108103620007325762000731620006d4565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b6000600883026200079c7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff826200075d565b620007a886836200075d565b95508019841693508086168417925050509392505050565b6000819050919050565b6000819050919050565b6000620007f5620007ef620007e984620007c0565b620007ca565b620007c0565b9050919050565b6000819050919050565b6200081183620007d4565b620008296200082082620007fc565b8484546200076a565b825550505050565b600090565b6200084062000831565b6200084d81848462000806565b505050565b5b8181101562000875576200086960008262000836565b60018101905062000853565b5050565b601f821115620008c4576200088e8162000738565b62000899846200074d565b81016020851015620008a9578190505b620008c1620008b8856200074d565b83018262000852565b50505b505050565b600082821c905092915050565b6000620008e960001984600802620008c9565b1980831691505092915050565b6000620009048383620008d6565b9150826002028217905092915050565b6200091f82620006c9565b67ffffffffffffffff8111156200093b576200093a62000466565b5b62000947825462000703565b6200095482828562000879565b600060209050601f8311600181146200098c576000841562000977578287015190505b620009838582620008f6565b865550620009f3565b601f1984166200099c8662000738565b60005b82811015620009c6578489015182556001820191506020850194506020810190506200099f565b86831015620009e65784890151620009e2601f891682620008d6565b8355505b6001600288020188555050505b505050505050565b6000819050919050565b62000a1081620009fb565b82525050565b62000a2181620007c0565b82525050565b62000a3281620005ea565b82525050565b600060a08201905062000a4f600083018862000a05565b62000a5e602083018762000a05565b62000a6d604083018662000a05565b62000a7c606083018562000a16565b62000a8b608083018462000a27565b9695505050505050565b600082825260208201905092915050565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b600062000b0460268362000a95565b915062000b118262000aa6565b604082019050919050565b6000602082019050818103600083015262000b378162000af5565b9050919050565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572600082015250565b600062000b7660208362000a95565b915062000b838262000b3e565b602082019050919050565b6000602082019050818103600083015262000ba98162000b67565b9050919050565b60805160a05160c05160e05161010051610120516127f062000c006000396000610fb501526000610ff701526000610fd601526000610f0b01526000610f6101526000610f8a01526127f06000f3fe608060405234801561001057600080fd5b506004361061012c5760003560e01c8063715018a6116100ad578063a457c2d711610071578063a457c2d714610333578063a9059cbb14610363578063d505accf14610393578063dd62ed3e146103af578063f2fde38b146103df5761012c565b8063715018a6146102a157806379cc6790146102ab5780637ecebe00146102c75780638da5cb5b146102f757806395d89b41146103155761012c565b80633644e515116100f45780633644e515146101eb578063395093511461020957806340c10f191461023957806342966c681461025557806370a08231146102715761012c565b806306fdde0314610131578063095ea7b31461014f57806318160ddd1461017f57806323b872dd1461019d578063313ce567146101cd575b600080fd5b6101396103fb565b60405161014691906118a1565b60405180910390f35b6101696004803603810190610164919061195c565b61048d565b60405161017691906119b7565b60405180910390f35b6101876104b0565b60405161019491906119e1565b60405180910390f35b6101b760048036038101906101b291906119fc565b6104ba565b6040516101c491906119b7565b60405180910390f35b6101d56104e9565b6040516101e29190611a6b565b60405180910390f35b6101f36104f2565b6040516102009190611a9f565b60405180910390f35b610223600480360381019061021e919061195c565b610501565b60405161023091906119b7565b60405180910390f35b610253600480360381019061024e919061195c565b610538565b005b61026f600480360381019061026a9190611aba565b6105b2565b005b61028b60048036038101906102869190611ae7565b6105c6565b60405161029891906119e1565b60405180910390f35b6102a961060e565b005b6102c560048036038101906102c0919061195c565b610622565b005b6102e160048036038101906102dc9190611ae7565b610642565b6040516102ee91906119e1565b60405180910390f35b6102ff610692565b60405161030c9190611b23565b60405180910390f35b61031d6106bc565b60405161032a91906118a1565b60405180910390f35b61034d6004803603810190610348919061195c565b61074e565b60405161035a91906119b7565b60405180910390f35b61037d6004803603810190610378919061195c565b6107c5565b60405161038a91906119b7565b60405180910390f35b6103ad60048036038101906103a89190611b96565b6107e8565b005b6103c960048036038101906103c49190611c38565b61092a565b6040516103d691906119e1565b60405180910390f35b6103f960048036038101906103f49190611ae7565b6109b1565b005b60606003805461040a90611ca7565b80601f016020809104026020016040519081016040528092919081815260200182805461043690611ca7565b80156104835780601f1061045857610100808354040283529160200191610483565b820191906000526020600020905b81548152906001019060200180831161046657829003601f168201915b5050505050905090565b600080610498610a34565b90506104a5818585610a3c565b600191505092915050565b6000600254905090565b6000806104c5610a34565b90506104d2858285610c05565b6104dd858585610c91565b60019150509392505050565b60006012905090565b60006104fc610f07565b905090565b60008061050c610a34565b905061052d81858561051e858961092a565b6105289190611d07565b610a3c565b600191505092915050565b61054c678074883883d4ec0060c01b611021565b610554611024565b610568673b261001e4fa4e9360c01b611021565b61057c67a38f6477e266633b60c01b611021565b61059067a00bd1c7922c76ca60c01b611021565b6105a467392446969e56283760c01b611021565b6105ae82826110a2565b5050565b6105c36105bd610a34565b826111f8565b50565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b610616611024565b61062060006113c5565b565b6106348261062e610a34565b83610c05565b61063e82826111f8565b5050565b600061068b600560008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002061148b565b9050919050565b6000600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6060600480546106cb90611ca7565b80601f01602080910402602001604051908101604052809291908181526020018280546106f790611ca7565b80156107445780601f1061071957610100808354040283529160200191610744565b820191906000526020600020905b81548152906001019060200180831161072757829003601f168201915b5050505050905090565b600080610759610a34565b90506000610767828661092a565b9050838110156107ac576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107a390611dad565b60405180910390fd5b6107b98286868403610a3c565b60019250505092915050565b6000806107d0610a34565b90506107dd818585610c91565b600191505092915050565b8342111561082b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161082290611e19565b60405180910390fd5b60007f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c988888861085a8c611499565b8960405160200161087096959493929190611e39565b6040516020818303038152906040528051906020012090506000610893826114f7565b905060006108a382878787611511565b90508973ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614610913576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161090a90611ee6565b60405180910390fd5b61091e8a8a8a610a3c565b50505050505050505050565b6000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b6109b9611024565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603610a28576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a1f90611f78565b60405180910390fd5b610a31816113c5565b50565b600033905090565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610aab576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610aa29061200a565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610b1a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b119061209c565b60405180910390fd5b80600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92583604051610bf891906119e1565b60405180910390a3505050565b6000610c11848461092a565b90507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8114610c8b5781811015610c7d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c7490612108565b60405180910390fd5b610c8a8484848403610a3c565b5b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610d00576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610cf79061219a565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610d6f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d669061222c565b60405180910390fd5b610d7a83838361153c565b60008060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905081811015610e00576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610df7906122be565b60405180910390fd5b8181036000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550816000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef84604051610eee91906119e1565b60405180910390a3610f01848484611541565b50505050565b60007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff163073ffffffffffffffffffffffffffffffffffffffff16148015610f8357507f000000000000000000000000000000000000000000000000000000000000000046145b15610fb0577f0000000000000000000000000000000000000000000000000000000000000000905061101e565b61101b7f00000000000000000000000000000000000000000000000000000000000000007f00000000000000000000000000000000000000000000000000000000000000007f0000000000000000000000000000000000000000000000000000000000000000611546565b90505b90565b50565b61102c610a34565b73ffffffffffffffffffffffffffffffffffffffff1661104a610692565b73ffffffffffffffffffffffffffffffffffffffff16146110a0576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016110979061232a565b60405180910390fd5b565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603611111576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161110890612396565b60405180910390fd5b61111d6000838361153c565b806002600082825461112f9190611d07565b92505081905550806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516111e091906119e1565b60405180910390a36111f460008383611541565b5050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603611267576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161125e90612428565b60405180910390fd5b6112738260008361153c565b60008060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050818110156112f9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016112f0906124ba565b60405180910390fd5b8181036000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555081600260008282540392505081905550600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516113ac91906119e1565b60405180910390a36113c083600084611541565b505050565b6000600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081600760006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b600081600001549050919050565b600080600560008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002090506114e68161148b565b91506114f181611580565b50919050565b600061150a611504610f07565b83611596565b9050919050565b6000806000611522878787876115c9565b9150915061152f816116ab565b8192505050949350505050565b505050565b505050565b600083838346306040516020016115619594939291906124da565b6040516020818303038152906040528051906020012090509392505050565b6001816000016000828254019250508190555050565b600082826040516020016115ab9291906125a5565b60405160208183030381529060405280519060200120905092915050565b6000807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a08360001c11156116045760006003915091506116a2565b60006001878787876040516000815260200160405260405161162994939291906125dc565b6020604051602081039080840390855afa15801561164b573d6000803e3d6000fd5b505050602060405103519050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603611699576000600192509250506116a2565b80600092509250505b94509492505050565b600060048111156116bf576116be612621565b5b8160048111156116d2576116d1612621565b5b031561180e57600160048111156116ec576116eb612621565b5b8160048111156116ff576116fe612621565b5b0361173f576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016117369061269c565b60405180910390fd5b6002600481111561175357611752612621565b5b81600481111561176657611765612621565b5b036117a6576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161179d90612708565b60405180910390fd5b600360048111156117ba576117b9612621565b5b8160048111156117cd576117cc612621565b5b0361180d576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016118049061279a565b60405180910390fd5b5b50565b600081519050919050565b600082825260208201905092915050565b60005b8381101561184b578082015181840152602081019050611830565b60008484015250505050565b6000601f19601f8301169050919050565b600061187382611811565b61187d818561181c565b935061188d81856020860161182d565b61189681611857565b840191505092915050565b600060208201905081810360008301526118bb8184611868565b905092915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006118f3826118c8565b9050919050565b611903816118e8565b811461190e57600080fd5b50565b600081359050611920816118fa565b92915050565b6000819050919050565b61193981611926565b811461194457600080fd5b50565b60008135905061195681611930565b92915050565b60008060408385031215611973576119726118c3565b5b600061198185828601611911565b925050602061199285828601611947565b9150509250929050565b60008115159050919050565b6119b18161199c565b82525050565b60006020820190506119cc60008301846119a8565b92915050565b6119db81611926565b82525050565b60006020820190506119f660008301846119d2565b92915050565b600080600060608486031215611a1557611a146118c3565b5b6000611a2386828701611911565b9350506020611a3486828701611911565b9250506040611a4586828701611947565b9150509250925092565b600060ff82169050919050565b611a6581611a4f565b82525050565b6000602082019050611a806000830184611a5c565b92915050565b6000819050919050565b611a9981611a86565b82525050565b6000602082019050611ab46000830184611a90565b92915050565b600060208284031215611ad057611acf6118c3565b5b6000611ade84828501611947565b91505092915050565b600060208284031215611afd57611afc6118c3565b5b6000611b0b84828501611911565b91505092915050565b611b1d816118e8565b82525050565b6000602082019050611b386000830184611b14565b92915050565b611b4781611a4f565b8114611b5257600080fd5b50565b600081359050611b6481611b3e565b92915050565b611b7381611a86565b8114611b7e57600080fd5b50565b600081359050611b9081611b6a565b92915050565b600080600080600080600060e0888a031215611bb557611bb46118c3565b5b6000611bc38a828b01611911565b9750506020611bd48a828b01611911565b9650506040611be58a828b01611947565b9550506060611bf68a828b01611947565b9450506080611c078a828b01611b55565b93505060a0611c188a828b01611b81565b92505060c0611c298a828b01611b81565b91505092959891949750929550565b60008060408385031215611c4f57611c4e6118c3565b5b6000611c5d85828601611911565b9250506020611c6e85828601611911565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680611cbf57607f821691505b602082108103611cd257611cd1611c78565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000611d1282611926565b9150611d1d83611926565b9250828201905080821115611d3557611d34611cd8565b5b92915050565b7f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f7760008201527f207a65726f000000000000000000000000000000000000000000000000000000602082015250565b6000611d9760258361181c565b9150611da282611d3b565b604082019050919050565b60006020820190508181036000830152611dc681611d8a565b9050919050565b7f45524332305065726d69743a206578706972656420646561646c696e65000000600082015250565b6000611e03601d8361181c565b9150611e0e82611dcd565b602082019050919050565b60006020820190508181036000830152611e3281611df6565b9050919050565b600060c082019050611e4e6000830189611a90565b611e5b6020830188611b14565b611e686040830187611b14565b611e7560608301866119d2565b611e8260808301856119d2565b611e8f60a08301846119d2565b979650505050505050565b7f45524332305065726d69743a20696e76616c6964207369676e61747572650000600082015250565b6000611ed0601e8361181c565b9150611edb82611e9a565b602082019050919050565b60006020820190508181036000830152611eff81611ec3565b9050919050565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b6000611f6260268361181c565b9150611f6d82611f06565b604082019050919050565b60006020820190508181036000830152611f9181611f55565b9050919050565b7f45524332303a20617070726f76652066726f6d20746865207a65726f2061646460008201527f7265737300000000000000000000000000000000000000000000000000000000602082015250565b6000611ff460248361181c565b9150611fff82611f98565b604082019050919050565b6000602082019050818103600083015261202381611fe7565b9050919050565b7f45524332303a20617070726f766520746f20746865207a65726f20616464726560008201527f7373000000000000000000000000000000000000000000000000000000000000602082015250565b600061208660228361181c565b91506120918261202a565b604082019050919050565b600060208201905081810360008301526120b581612079565b9050919050565b7f45524332303a20696e73756666696369656e7420616c6c6f77616e6365000000600082015250565b60006120f2601d8361181c565b91506120fd826120bc565b602082019050919050565b60006020820190508181036000830152612121816120e5565b9050919050565b7f45524332303a207472616e736665722066726f6d20746865207a65726f20616460008201527f6472657373000000000000000000000000000000000000000000000000000000602082015250565b600061218460258361181c565b915061218f82612128565b604082019050919050565b600060208201905081810360008301526121b381612177565b9050919050565b7f45524332303a207472616e7366657220746f20746865207a65726f206164647260008201527f6573730000000000000000000000000000000000000000000000000000000000602082015250565b600061221660238361181c565b9150612221826121ba565b604082019050919050565b6000602082019050818103600083015261224581612209565b9050919050565b7f45524332303a207472616e7366657220616d6f756e742065786365656473206260008201527f616c616e63650000000000000000000000000000000000000000000000000000602082015250565b60006122a860268361181c565b91506122b38261224c565b604082019050919050565b600060208201905081810360008301526122d78161229b565b9050919050565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572600082015250565b600061231460208361181c565b915061231f826122de565b602082019050919050565b6000602082019050818103600083015261234381612307565b9050919050565b7f45524332303a206d696e7420746f20746865207a65726f206164647265737300600082015250565b6000612380601f8361181c565b915061238b8261234a565b602082019050919050565b600060208201905081810360008301526123af81612373565b9050919050565b7f45524332303a206275726e2066726f6d20746865207a65726f2061646472657360008201527f7300000000000000000000000000000000000000000000000000000000000000602082015250565b600061241260218361181c565b915061241d826123b6565b604082019050919050565b6000602082019050818103600083015261244181612405565b9050919050565b7f45524332303a206275726e20616d6f756e7420657863656564732062616c616e60008201527f6365000000000000000000000000000000000000000000000000000000000000602082015250565b60006124a460228361181c565b91506124af82612448565b604082019050919050565b600060208201905081810360008301526124d381612497565b9050919050565b600060a0820190506124ef6000830188611a90565b6124fc6020830187611a90565b6125096040830186611a90565b61251660608301856119d2565b6125236080830184611b14565b9695505050505050565b600081905092915050565b7f1901000000000000000000000000000000000000000000000000000000000000600082015250565b600061256e60028361252d565b915061257982612538565b600282019050919050565b6000819050919050565b61259f61259a82611a86565b612584565b82525050565b60006125b082612561565b91506125bc828561258e565b6020820191506125cc828461258e565b6020820191508190509392505050565b60006080820190506125f16000830187611a90565b6125fe6020830186611a5c565b61260b6040830185611a90565b6126186060830184611a90565b95945050505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b7f45434453413a20696e76616c6964207369676e61747572650000000000000000600082015250565b600061268660188361181c565b915061269182612650565b602082019050919050565b600060208201905081810360008301526126b581612679565b9050919050565b7f45434453413a20696e76616c6964207369676e6174757265206c656e67746800600082015250565b60006126f2601f8361181c565b91506126fd826126bc565b602082019050919050565b60006020820190508181036000830152612721816126e5565b9050919050565b7f45434453413a20696e76616c6964207369676e6174757265202773272076616c60008201527f7565000000000000000000000000000000000000000000000000000000000000602082015250565b600061278460228361181c565b915061278f82612728565b604082019050919050565b600060208201905081810360008301526127b381612777565b905091905056fea26469706673582212200c2598e116b2e8255f64dc2e1382695e6057348c969d89838916a353862b47b864736f6c63430008130033";

  if (chainId == 11155111) {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.SEPOLIA_RPC_URL
    );
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const tokenFactory = new ethers.ContractFactory(abi, bin, wallet);
    const token = await tokenFactory.deploy(
      "TokenShark",
      "SHARK",
      "0xf739403058D49D2B5c37DB58e788D32181aD0033"
    );

    console.log("Token deployed " + token.address);
  }
};

module.exports.tags = ["all", "token"];
