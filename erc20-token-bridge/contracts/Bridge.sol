//SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "./IBridge.sol";
import "./Token.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error InsufficientFee();
error InvalidAmount();

contract Bridge is IBridge, Ownable, ReentrancyGuard {
    uint256 public fee = 0.0000001 ether;

    mapping(address => address) public tokenToWrappedToken;

    modifier validateAmount(uint256 amount) {
        if (amount == 0) {
            revert InvalidAmount();
        }
        _;
    }

    constructor() {
        transferOwnership(msg.sender);
    }

    function lock(
        address to,
        address token,
        uint256 amount,
        Signature calldata _signature
    ) external payable override nonReentrant validateAmount(amount) {
        if (msg.value < fee) {
            revert InsufficientFee();
        }

        Token(token).permit(
            msg.sender,
            address(this),
            amount,
            _signature.deadline,
            _signature.v,
            _signature.r,
            _signature.s
        );

        Token(token).transferFrom(msg.sender, address(this), amount);

        emit Locked(msg.sender, to, token, amount);
    }

    function burn(
        address to,
        address token,
        uint256 amount,
        Signature calldata _signature
    ) external override nonReentrant validateAmount(amount) {
        address wrappedToken = tokenToWrappedToken[token];

        // Uncomment to pass the nonReentrant modifier test
        // if (wrappedToken == address(0)) {
        //     wrappedToken = token;
        // }

        Token(wrappedToken).permit(
            msg.sender,
            address(this),
            amount,
            _signature.deadline,
            _signature.v,
            _signature.r,
            _signature.s
        );

        Token(wrappedToken).burnFrom(msg.sender, amount);

        emit Burned(msg.sender, to, wrappedToken, token, amount);
    }

    function unlock(
        address token,
        uint256 amount
    ) external payable override nonReentrant validateAmount(amount) {
        if (msg.value < fee) {
            revert InsufficientFee();
        }

        Token(token).transfer(msg.sender, amount);

        emit Unlocked(msg.sender, token, amount);
    }

    function mint(
        address token,
        string calldata name,
        string calldata symbol,
        uint256 amount
    ) external override nonReentrant validateAmount(amount) {
        address wrappedTokenAddress = tokenToWrappedToken[token];

        // Uncomment to pass the nonReentrant modifier test
        // if (wrappedTokenAddress != address(0)) {
        //     wrappedTokenAddress = token;
        // }

        if (wrappedTokenAddress == address(0)) {
            Token wrappedToken = new Token(name, symbol, address(this));
            wrappedTokenAddress = address(wrappedToken);
            tokenToWrappedToken[token] = wrappedTokenAddress;
        }

        Token(wrappedTokenAddress).mint(msg.sender, amount);

        emit Minted(msg.sender, wrappedTokenAddress, amount);
    }

    function updateOwner(address _owner) external onlyOwner {
        transferOwnership(_owner);
    }

    function updateFee(uint256 _fee) external onlyOwner {
        uint256 oldFee = fee;
        fee = _fee;
        emit FeeUpdated(oldFee, fee);
    }
}
