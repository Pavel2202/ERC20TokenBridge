//SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

interface IBridge {
    struct Signature {
        uint256 deadline;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    event Locked(
        address indexed sender,
        address receiver,
        address indexed token,
        uint256 amount
    );

    event Burned(
        address indexed sender,
        address receiver,
        address indexed token,
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
        address to,
        address token,
        uint256 amount,
        Signature calldata _signature
    ) external payable;

    function burn(
        address to,
        address token,
        uint256 amount,
        Signature calldata _signature
    ) external;

    function unlock(address token, uint256 amount) external payable;

    function mint(address token, string calldata name, string calldata symbol, uint256 amount) external;

    function updateOwner(address _owner) external;

    function updateFee(uint256 _fee) external;
}
