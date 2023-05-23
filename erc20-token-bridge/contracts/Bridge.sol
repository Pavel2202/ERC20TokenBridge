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

    mapping(address => bool) public bridges;
    mapping(address => bool) public supportedTokens;
    mapping(address => address) public tokenToWrappedToken;

    modifier validateFee() {
        if (msg.value < fee) {
            revert InsufficientFee();
        }
        _;
    }

    modifier validateToken(address _token) {
        if (!supportedTokens[_token]) {
            revert TokenNotSupported();
        }
        _;
    }

    modifier validateAmount(uint256 amount) {
        if (amount == 0) {
            revert InvalidAmount();
        }
        _;
    }

    modifier validateBridge(address bridge) {
        if (!bridges[bridge]) {
            revert InvalidBridge();
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
        validateFee
        validateToken(_depositData.token)
        validateBridge(_depositData.targetBridge)
        validateAmount(_depositData.amount)
    {
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
        validateFee
        validateToken(_depositData.token)
        validateBridge(_depositData.targetBridge)
        validateAmount(_depositData.amount)
    {
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
        payable
        override
        nonReentrant
        validateFee
        validateToken(_withdrawData.token)
        validateAmount(_withdrawData.amount)
    {
        Token(_withdrawData.token).transfer(msg.sender, _withdrawData.amount);

        emit Unlocked(msg.sender, _withdrawData.token, _withdrawData.amount);
    }

    function mint(
        WithdrawData calldata _withdrawData
    )
        external
        payable
        override
        nonReentrant
        validateFee
        validateToken(_withdrawData.token)
        validateAmount(_withdrawData.amount)
    {
        Token(_withdrawData.token).mint(msg.sender, _withdrawData.amount);

        emit Minted(msg.sender, _withdrawData.token, _withdrawData.amount);
    }

    function addBridge(address _bridge) external onlyOwner {
        bridges[_bridge] = true;
    }

    function addToken(address _token) external onlyOwner {
        supportedTokens[_token] = true;
    }

    function createWrappedToken(
        address token,
        string calldata name,
        string calldata symbol
    ) external onlyOwner {
        Token wrappedToken = new Token(name, symbol, address(this));
        tokenToWrappedToken[token] = address(wrappedToken);
        supportedTokens[address(wrappedToken)] = true;
    }

    function updateOwner(address _owner) external onlyOwner {
        transferOwnership(_owner);
    }

    function updateFee(uint256 _fee) external onlyOwner {
        fee = _fee;
    }
}
