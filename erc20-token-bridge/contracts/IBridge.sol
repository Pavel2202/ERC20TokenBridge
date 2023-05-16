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
        address receiver,
        address indexed token,
        address indexed targetBridge,
        uint256 amount,
        uint256 blockNumber
    );

    event Withdraw(
        address indexed receiver,
        address indexed token,
        uint256 amount
    );

    function deposit(
        DepositData calldata _depositData,
        Signature calldata _signature
    ) external;

    function withdraw(WithdrawData calldata _withdrawData) external;

    function increaseBalance(
        address to,
        address token,
        uint256 amount
    ) external;

    function addBridge(address _bridge) external;

    function addToken(address _token) external;
}
