// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenBase is ERC20 {
    address public admin;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        admin = msg.sender;
    }

    function updateAdmin(address newAdmin) external {
        require(msg.sender == admin, "only admin");
        admin = newAdmin;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burn(address owner, uint256 amount) external {
        _burn(owner, amount);
    }

    function getAdminAddress() external view returns (address) {
        return admin;
    }
}
