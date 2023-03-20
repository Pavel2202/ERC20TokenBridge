// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "./TokenBase.sol";

contract TokenUSDC is TokenBase {
    constructor() TokenBase("USD Coin", "USDC") {}
}
