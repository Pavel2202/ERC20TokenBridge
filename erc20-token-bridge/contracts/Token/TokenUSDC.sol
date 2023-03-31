// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "../Base/TokenBase.sol";

contract TokenUSDC is TokenBase {
    constructor() TokenBase("USD Coin", "USDC") {}
}
