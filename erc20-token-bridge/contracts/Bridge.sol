//SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "./Token.sol";
import "./TokenFactory.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Bridge is Ownable {
    address public admin;
    TokenFactory public tokenFactory;

    mapping(uint256 => bool) public processedNonces;
    mapping(address => mapping(address => uint256)) public claimable;

    event Deposit(
        address indexed sender,
        address indexed token,
        uint256 toBridgeChainId,
        uint256 amount
    );
    event Withdraw(
        address indexed receiver,
        address indexed token,
        uint256 amount
    );

    constructor(address _tokenFactory) {
        tokenFactory = TokenFactory(_tokenFactory);
        admin = msg.sender;
    }

    function sendToBridge(
        address token,
        uint256 toBridgeChainId,
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

        Token(token).transferFrom(msg.sender, address(this), amount);
        emit Deposit(msg.sender, token, toBridgeChainId, amount);
    }

    function withdraw(address token, uint256 amount) external {
        require(claimable[msg.sender][token] >= amount, "insufficient balance");

        claimable[msg.sender][token] -= amount;
        Token(token).transfer(msg.sender, amount);
        emit Withdraw(msg.sender, token, amount);
    }

    function setClaimable(
        address to,
        string calldata tokenName,
        string calldata tokenSymbol,
        uint256 amount
    ) external {
        require(msg.sender == admin, "only admin");

        Token token = tokenFactory.createToken(tokenName, tokenSymbol);
        claimable[to][address(token)] = amount;
    }
}
