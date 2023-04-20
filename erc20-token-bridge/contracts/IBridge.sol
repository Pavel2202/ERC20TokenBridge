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

    event DepositWithTransfer(
        address indexed sender,
        address indexed token,
        address indexed targetBridge,
        uint256 amount
    );

    event DepositWithBurn(
        address indexed sender,
        address indexed token,
        address indexed targetBridge,
        uint256 amount
    );

    event WithdrawWithTransfer(
        address indexed receiver,
        address indexed token,
        uint256 amount
    );

    event WithdrawWithMint(
        address indexed receiver,
        address indexed token,
        uint256 amount
    );

    function deposit(
        DepositData calldata _depositData,
        Signature calldata _signature
    ) external;

    function withdrawFromBridge(WithdrawData calldata _withdrawData) external;

    function increaseBalance(
        address to,
        address token,
        uint256 amount
    ) external;

    function addBridge(address _bridge) external;

    function addToken(address _token) external;
}
