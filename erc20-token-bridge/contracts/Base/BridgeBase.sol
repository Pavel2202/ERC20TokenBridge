// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BridgeBase {
    address public admin;
    IERC20 public token;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    enum Step {
        Send,
        Withdraw
    }

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 amount
    );
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 amount,
        Step indexed step
    );

    constructor() {
        admin = msg.sender;
        balanceOf[msg.sender] = 2 * 10 ** 18;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        require(allowance[from][to] > 0, "not approved");
        allowance[from][to] -= amount;
        _transfer(from, to, amount);
        return true;
    }

    function setToken(address tokenAddress) external {
        token = IERC20(tokenAddress);
    }

    function getAdminAddress() external view returns (address) {
        return admin;
    }

    function getAllowance(address spender) external view returns (uint256) {
        return allowance[msg.sender][spender];
    }

    function _approve(address owner, address spender, uint256 amount) private {
        allowance[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _transfer(address from, address to, uint256 amount) private {
        balanceOf[from] = balanceOf[from] - amount;
        balanceOf[to] = balanceOf[to] + amount;
        emit Transfer(from, to, amount, Step.Send);
    }
}
