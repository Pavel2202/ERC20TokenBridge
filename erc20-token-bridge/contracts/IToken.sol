// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

interface IToken {
    function mint(address caller, address to, uint256 amount) external;

    function burn(address caller, address owner, uint256 amount) external;
}
