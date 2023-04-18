//SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "./Token.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Bridge {
    address public admin;

    mapping(address => uint256) public tokenNonce;
    mapping(address => mapping(address => uint256)) public deposits;
    mapping(address => mapping(address => uint256)) public withdraws;

    event Deposit(
        address indexed sender,
        address indexed token,
        uint256 amount
    );
    event Withdraw(
        address indexed receiver,
        address indexed token,
        uint256 amount
    );

    constructor() {
        admin = msg.sender;
    }

    function sendToBridge(
        address to,
        address token,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(amount > 0, "invalid amount");

        Token(token).permit(
            msg.sender,
            address(this),
            amount,
            deadline,
            v,
            r,
            s
        );

        tokenNonce[token] += 1;
        deposits[msg.sender][token] += amount;
        withdraws[to][token] += amount;
        Token(token).transferFrom(msg.sender, address(this), amount);
        emit Deposit(msg.sender, token, amount);
    }

    function withdrawFromBridge(
        address from,
        address token,
        uint256 amount
    ) external {
        require(withdraws[msg.sender][token] >= amount, "insufficient balance");
        withdraws[msg.sender][token] -= amount;
        deposits[from][token] -= amount;
        Token(token).transfer(msg.sender, amount);
        emit Withdraw(msg.sender, token, amount);
    }
}
