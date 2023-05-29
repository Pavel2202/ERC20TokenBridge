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
        string name;
        string symbol;
        uint256 amount;
    }

    event Locked(
        address indexed sender,
        address receiver,
        address indexed token,
        address indexed targetBridge,
        uint256 amount
    );

    event Burned(
        address indexed sender,
        address receiver,
        address indexed token,
        address indexed targetBridge,
        uint256 amount
    );

    event Unlocked(
        address indexed receiver,
        address indexed token,
        uint256 amount
    );

    event Minted(
        address indexed receiver,
        address indexed token,
        uint256 amount
    );

    function lock(
        DepositData calldata _depositData,
        Signature calldata _signature
    ) external payable;

    function burn(
        DepositData calldata _depositData,
        Signature calldata _signature
    ) external payable;

    function unlock(WithdrawData calldata _withdrawData) external;

    function mint(WithdrawData calldata _withdrawData) external;

    function updateOwner(address _owner) external;

    function updateFee(uint256 _fee) external;
}
