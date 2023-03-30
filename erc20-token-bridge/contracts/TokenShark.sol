// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "./TokenBase.sol";

contract TokenShark is TokenBase {
    constructor() TokenBase("Shark coin", "SHARK") {}
}
