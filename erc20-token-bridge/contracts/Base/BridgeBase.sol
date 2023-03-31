// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../Interface/IToken.sol";

contract BridgeBase {
    address public admin;
    IToken public token;
    uint256 public nonce;
    mapping(address => mapping(uint256 => bool)) public processedNonces;

    enum Step {
        Burn,
        Mint
    }

    event Transfer(
        address indexed to,
        uint256 amount,
        Step indexed step
    );

    constructor() {
        admin = msg.sender;
    }

    function burn(uint256 amount) external {
        token.burn(msg.sender, amount);
        emit Transfer(msg.sender, amount, Step.Burn);
        nonce++;
    }

    function mint(
        address to,
        uint256 amount,
        uint256 otherChainNonce,
        address burnContractAddress
    ) external {
        require(
            processedNonces[burnContractAddress][otherChainNonce] == false,
            "Transfer already processed."
        );
        processedNonces[burnContractAddress][otherChainNonce] = true;

        token.mint(to, amount);
        emit Transfer(to, amount, Step.Mint);
    }

    function setToken(address tokenAddress) external {
        token = IToken(tokenAddress);
    }

    function getAdminAddress() external view returns (address) {
        return admin;
    }

    function getNonce() external view returns (uint256) {
        return nonce;
    }

    function isNonceProcessed(
        address contractAddress,
        uint256 _nonce
    ) external view returns (bool) {
        return processedNonces[contractAddress][_nonce];
    }
}
