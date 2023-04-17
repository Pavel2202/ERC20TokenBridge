//SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "./Token.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Bridge {
    address public admin;

    mapping(address => bool) public bridges;
    mapping(address => mapping(address => uint256)) public deposits;
    mapping(address => mapping(address => uint256)) public withdraws;

    event Deposit(
        address indexed sender,
        address indexed token,
        address targetBridge,
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
        address targetBridge,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(bridges[targetBridge], "invalid bridge address");
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

        deposits[msg.sender][token] += amount;
        Bridge(targetBridge).increaseWithdraw(to,  token, amount);
        Token(token).transferFrom(msg.sender, address(this), amount);
        emit Deposit(msg.sender, token, targetBridge, amount);
    }

    function increaseWithdraw(
        address to,
        address token,
        uint256 amount
    ) external {
        require(bridges[msg.sender], "no permission");
        withdraws[to][token] += amount;
    }

    function withdrawFromBridge(
        address from,
        address token,
        address fromBridge,
        uint256 amount
    ) external {
        require(bridges[fromBridge], "invalid bridge address");
        require(withdraws[msg.sender][token] >= amount, "insufficient balance");
        withdraws[msg.sender][token] -= amount;
        Bridge(fromBridge).decreaseDeposits(from, token, amount);
        Token(token).transfer(msg.sender, amount);
        emit Withdraw(msg.sender, token, amount);
    }

    function decreaseDeposits(
        address from,
        address token,
        uint256 amount
    ) external {
        require(bridges[msg.sender], "no permission");
        deposits[from][token] -= amount;
    }

    function addBridge(address bridge) external {
        require(msg.sender == admin, "only admin");
        bridges[bridge] = true;
    }
}
