// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenBase is ERC20 {
    address public admin;
    uint256 private adminSet = 0;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function updateAdmin(address newAdmin) external {
        require(msg.sender == admin, "only admin");
        admin = newAdmin;
    }

    function mint(address from, address to, uint256 amount) external {
        require(from == admin, "only admin");
        _mint(to, amount);
    }

    function burn(address from, address owner, uint256 amount) external {
        require(from == admin, "only admin");
        _burn(owner, amount);
    }

    function setAdmin(address _admin) external {
        require(adminSet == 0, "admin set");
        adminSet = 1;
        admin = _admin;
    }

    function getAdminAddress() external view returns (address) {
        return admin;
    }

    function isAdminSet() external view returns (uint256) {
        return adminSet;
    }
}
