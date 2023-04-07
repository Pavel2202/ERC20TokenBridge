// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BridgeBase {
    address public admin;
    IERC20 public token;

    enum Step {
        Send,
        Get
    }

    event Transfer(address indexed to, uint256 amount, Step indexed step);

    constructor() {
        admin = msg.sender;
    }

    function deposit(uint256 amount) external {
        token.approve(address(this), amount);
        token.transferFrom(msg.sender, address(this), amount);
        emit Transfer(msg.sender, amount, Step.Send);
    }

    function get(address to, uint256 amount) external {
        token.transfer(to, amount);
        emit Transfer(to, amount, Step.Get);
    }

    function setToken(address tokenAddress) external {
        token = IERC20(tokenAddress);
    }

    function getAdminAddress() external view returns (address) {
        return admin;
    }
}
