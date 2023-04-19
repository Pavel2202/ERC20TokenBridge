//SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

interface IBridge {
    struct DepositData {
        address to;
        address token;
        address targetBridge;
        uint256 amount;
        uint256 deadline;
    }

    struct TokenData {
        string name;
        string symbol;
    }

    struct Signature {
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    struct WithdrawData {
        address token;
        uint256 amount;
    }

    event Deposit(
        address indexed sender,
        address indexed token,
        address indexed targetBridge,
        uint256 amount
    );

    event Withdraw(
        address indexed receiver,
        address indexed token,
        uint256 amount
    );

    function deposit(DepositData calldata _depositData, TokenData calldata _tokenData, Signature calldata _signature) external;

    function withdrawFromBridge(WithdrawData calldata _withdrawData) external;

    function createToken(address token, TokenData calldata _tokenData) external;

    function increaseWithdraw(address to, address token, uint256 amount) external;

    function addBridge(address _bridge) external;
}
