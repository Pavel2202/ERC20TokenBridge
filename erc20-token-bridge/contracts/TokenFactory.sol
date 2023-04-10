//SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "./Token.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract TokenFactory is Ownable {
    mapping(address => Token) private tokens;

    event TokenCreated(string indexed name, string indexed symbol, address tokenAddress);

    constructor() {
        transferOwnership(msg.sender);
    }

    function createToken(string calldata name, string calldata symbol) external onlyOwner returns(Token token) {
        token = new Token(name, symbol, msg.sender);
        tokens[address(token)] = token;
        emit TokenCreated(name, symbol, address(token));
    }

    function getToken(address _token) external view returns (Token) {
        return tokens[_token];
    }
}