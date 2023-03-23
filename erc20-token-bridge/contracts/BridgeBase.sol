// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IToken.sol";

contract BridgeBase {
    address public admin;
    IToken public token;
    uint256 public nonce;
    mapping(address => mapping(uint256 => bool)) public processedNonces;

    event Transfer(address from, address to, uint256 amount, uint256 step);

    constructor(address _token) {
        admin = msg.sender;
        token = IToken(_token);
    }

    function burn(address from, address to, uint256 amount) external {
        require(from == admin, "only admin");
        token.burn(from, to, amount);
        emit Transfer(msg.sender, to, amount, 0);
        nonce++;
    }

    function mint(
        address from,
        address to,
        uint256 amount,
        uint256 otherChainNonce,
        address burnContractAddress
    ) external {
        require(from == admin, "only admin");
        require(
            processedNonces[burnContractAddress][otherChainNonce] == false,
            "Transfer already processed."
        );
        processedNonces[burnContractAddress][otherChainNonce] = true;

        token.mint(from, to, amount);
        emit Transfer(msg.sender, to, amount, 1);
    }

    function getAdminAddress() external view returns (address) {
        return admin;
    }

    function getNonce() external view returns (uint256) {
        return nonce;
    }
}
