//SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "./IBridge.sol";
import "./Token.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";

error InsufficientFee();
error TokenNotSupported();
error InvalidAmount();
error InvalidBridge();

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
        DepositData calldata _depositData,
        Signature calldata _signature
    )
        external
        payable
        override
        nonReentrant
        validateAmount(_depositData.amount)
    {
        if (msg.value < fee) {
            revert InsufficientFee();
        }

        Token(_depositData.token).permit(
            msg.sender,
            address(this),
            _depositData.amount,
            _depositData.deadline,
            _signature.v,
            _signature.r,
            _signature.s
        );

        Token(_depositData.token).transferFrom(
            msg.sender,
            address(this),
            _depositData.amount
        );

        emit Locked(
            msg.sender,
            _depositData.to,
            _depositData.token,
            _depositData.targetBridge,
            _depositData.amount
        );
    }

    function burn(
        DepositData calldata _depositData,
        Signature calldata _signature
    )
        external
        payable
        override
        nonReentrant
        validateAmount(_depositData.amount)
    {
        if (msg.value < fee) {
            revert InsufficientFee();
        }

        Token(_depositData.token).permit(
            msg.sender,
            address(this),
            _depositData.amount,
            _depositData.deadline,
            _signature.v,
            _signature.r,
            _signature.s
        );

        Token(_depositData.token).burnFrom(msg.sender, _depositData.amount);

        emit Burned(
            msg.sender,
            _depositData.to,
            _depositData.token,
            _depositData.targetBridge,
            _depositData.amount
        );
    }

    function unlock(
        WithdrawData calldata _withdrawData
    )
        external
        override
        nonReentrant
        validateAmount(_withdrawData.amount)
    {
        Token(_withdrawData.token).transfer(msg.sender, _withdrawData.amount);

        emit Unlocked(msg.sender, _withdrawData.token, _withdrawData.amount);
    }

    function mint(
        WithdrawData calldata _withdrawData
    )
        external
        override
        nonReentrant
        validateAmount(_withdrawData.amount)
    {
        address wrappedTokenAddress = tokenToWrappedToken[_withdrawData.token];

        if (wrappedTokenAddress == address(0)) {
            Token wrappedToken = new Token(_withdrawData.name, _withdrawData.symbol, address(this));
            wrappedTokenAddress = address(wrappedToken);
            tokenToWrappedToken[_withdrawData.token] = wrappedTokenAddress;
        }

        Token(wrappedTokenAddress).mint(msg.sender, _withdrawData.amount);

        emit Minted(msg.sender, wrappedTokenAddress, _withdrawData.amount);
    }

    function updateOwner(address _owner) external onlyOwner {
        transferOwnership(_owner);
    }

    function updateFee(uint256 _fee) external onlyOwner {
        fee = _fee;
    }
}
