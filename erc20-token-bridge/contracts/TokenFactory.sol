//SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "./Token.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract TokenFactory is Ownable {
    mapping(address => address) public tokens;

    event TokenCreated(string name, string symbol, address tokenAddress);

    function create(
        address token,
        string calldata name,
        string calldata symbol
    ) external onlyOwner returns (Token wrappedToken) {
        wrappedToken = new Token(name, symbol, msg.sender);
        tokens[token] = address(wrappedToken);
        emit TokenCreated(name, symbol, address(wrappedToken));
    }
}
